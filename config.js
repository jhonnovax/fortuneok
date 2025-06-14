const config = {
  // REQUIRED
  appName: "FortuneOK",
  // Short description used for title and heading
  appShortDescription: "Your Smart Portfolio Tracker for All Assets",
  // Long description of your app for SEO tags (can be overwritten)
  appDescription: "Effortlessly manage your assets in one place. Say goodbye to spreadsheets and scattered records. Stay organized, track your portfolio, and make smarter financial decisions with ease.",
  // (no https://, not trialing slash at the end, just the naked domain)
  domainName: "fortuneok.com",
  ownership: {
    name: "Jhon Nova",
    username: "jhonnovax",
  },
  stripe: {
    // Create multiple plans in your Stripe dashboard, then add them here. You can add as many plans as you want, just make sure to add the priceId
    plans: [
      {
        // REQUIRED — we use this to find the plan in the webhook (for instance if you want to update the user's credits based on the plan)
        priceId:
          process.env.NODE_ENV === "development"
            ? "price_1Qv2q4DvX2TSHq7dc07XH0oM"
            : "price_1ROk6ODvX2TSHq7da3LKJBYq",
        //  REQUIRED - Name of the plan, displayed on the pricing page
        name: "Starter",
        // A friendly description of the plan, displayed on the pricing page. Tip: explain why this plan and not others
        description: "Perfect for beginners",
        // The price you want to display, the one user will be charged on Stripe.
        price: 49,
        // If you have an anchor price (i.e. $29) that you want to display crossed out, put it here. Otherwise, leave it empty
        priceAnchor: 99,
        features: [
          { name: "Unlimited Assets" },
          { name: 'Multi-Currency Support' },
          { name: "Stocks, ETFs, Funds, Crypto and more" },
          { name: "Cash, Real Estate, Savings Accounts and more" },
          { name: "Charts for Category and Position Allocation" }
          
        ],
      }
    ],
  },
  aws: {
    // If you use AWS S3/Cloudfront, put values in here
    bucket: "bucket-name",
    bucketUrl: `https://bucket-name.s3.amazonaws.com/`,
    cdn: "https://cdn-id.cloudfront.net/",
  },
  resend: {
    // REQUIRED — Email 'From' field to be used when sending magic login links
    fromNoReply: `FortuneOK <noreply@mail.fortuneok.com>`,
    // REQUIRED — Email 'From' field to be used when sending other emails, like abandoned carts, updates etc..
    fromAdmin: `Jhon at FortuneOK <jhon@mail.fortuneok.com>`,
    // Email shown to customer if need support. Leave empty if not needed => if empty, set up Crisp above, otherwise you won't be able to offer customer support."
    supportEmail: "support@fortuneok.com",
  },
  colors: {
    // REQUIRED — The DaisyUI theme to use (added to the main layout.js). Leave blank for default (light & dark mode). If you any other theme than light/dark, you need to add it in config.tailwind.js in daisyui.themes.
    theme: "system",
    // REQUIRED — This color will be reflected on the whole app outside of the document (loading bar, Chrome tabs, etc..). By default it takes the primary color from your DaisyUI theme (make sure to update your the theme name after "data-theme=")
    // OR you can just do this to use a custom color: main: "#f37055". HEX only.
    main: "#a9ff68",
  },
  auth: {
    // REQUIRED — the path to log in users. It's use to protect private routes (like /dashboard). It's used in apiClient (/libs/api.js) upon 401 errors from our API
    loginUrl: "/api/auth/signin",
    // REQUIRED — the path you want to redirect users after successfull login (i.e. /dashboard, /private). This is normally a private page for users to manage their accounts. It's used in apiClient (/libs/api.js) upon 401 errors from our API & in ButtonSignin.js
    callbackUrl: "/",
  },
};

export default config;
