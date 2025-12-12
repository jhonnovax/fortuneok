import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import config from "@/config";
import connectMongo from "./mongo";
import connectMongoose from "./mongoose";
import User from "@/models/User";

export const authOptions = {
  // Set any random key in .env.local
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      // Follow the "Login with Google" tutorial to get your credentials
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      async profile(profile) {
        return {
          id: profile.sub,
          name: profile.given_name ? profile.given_name : profile.name,
          email: profile.email,
          image: profile.picture,
          createdAt: new Date(),
        };
      },
    }),
    // Follow the "Login with Email" tutorial to set up your email server
    // Requires a MongoDB database. Set MONOGODB_URI env variable.
    ...(connectMongo
      ? [
          EmailProvider({
            server: {
              host: "smtp.resend.com",
              port: 465,
              auth: {
                user: "resend",
                pass: process.env.RESEND_API_KEY,
              },
            },
            from: config.resend.fromNoReply,
          }),
        ]
      : []),
  ],
  // New users will be saved in Database (MongoDB Atlas). Each user (model) has some fields like name, email, image, etc..
  // Requires a MongoDB database. Set MONOGODB_URI env variable.
  // Learn more about the model type: https://next-auth.js.org/v3/adapters/models
  ...(connectMongo && { adapter: MongoDBAdapter(connectMongo) }),

  callbacks: {
    signIn: async ({ user }) => {
      try {
        // Update lastAccessAt when user signs in or registers
        // Also ensure createdAt is set for email provider users
        await connectMongoose();
        const existingUser = await User.findOne({ email: user.email });
        
        const updateData = { lastAccessAt: new Date() };
        
        // If user exists but createdAt is missing (common with email provider),
        // set it to now. This happens because MongoDB adapter bypasses Mongoose timestamps.
        if (existingUser && !existingUser.createdAt) {
          updateData.createdAt = new Date();
        }
        
        // If user doesn't exist yet (shouldn't happen, but handle edge case),
        // create with createdAt. Otherwise just update.
        if (!existingUser) {
          updateData.createdAt = new Date();
          await User.findOneAndUpdate(
            { email: user.email },
            {
              email: user.email,
              name: user.name,
              image: user.image,
              ...updateData,
            },
            { upsert: true, setDefaultsOnInsert: true }
          );
        } else {
          await User.findOneAndUpdate(
            { email: user.email },
            updateData,
            { upsert: false }
          );
        }
      } catch (error) {
        console.error("Error updating user:", error);
        // Don't block sign-in if update fails
      }
      return true;
    },
    session: async ({ session, token }) => {
      if (session?.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  theme: {
    colorScheme: "auto",
    brandColor: "#a9ff68",
    buttonText: '#000',
    // Add you own logo below. Recommended size is rectangle (i.e. 200x50px) and show your logo + name.
    // It will be used in the login flow to display your logo. If you don't add it, it will look faded.
    logo: `https://${config.domainName}/logoAndName.png`,
  },
};
