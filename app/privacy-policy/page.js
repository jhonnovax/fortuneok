import { getSEOTags } from "@/libs/seo";
import config from "@/config";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QuestionsAboutDocs from "@/components/QuestionsAboutDocs";

// CHATGPT PROMPT TO GENERATE YOUR PRIVACY POLICY — replace with your own data 👇

// 1. Go to https://chat.openai.com/
// 2. Copy paste bellow
// 3. Replace the data with your own (if needed)
// 4. Paste the answer from ChatGPT directly in the <pre> tag below

// You are an excellent lawyer.

// I need your help to write a simple privacy policy for my website. Here is some context:
// - Website: https://fortuneok.com
// - Name: FortuneOK
// - Description: A tool to help you manage and track your investments
// - User data collected: name, email and payment information
// - Non-personal data collection: web cookies
// - Purpose of Data Collection: Order processing
// - Data sharing: we do not share the data with any other parties
// - Children's Privacy: we do not collect any data from children
// - Updates to the Privacy Policy: users will be updated by email
// - Contact information: support@fortuneok.com

// Please write a simple privacy policy for my site. Add the current date.  Do not add or explain your reasoning. Answer:

export const metadata = getSEOTags({
  title: `Privacy Policy | ${config.appName}`,
  canonicalUrlRelative: "/privacy-policy",
});

const PrivacyPolicy = () => {
  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-extrabold pb-6">
          Privacy Policy for {config.appName}
        </h1>

        <pre
          className="leading-relaxed whitespace-pre-wrap"
          style={{ fontFamily: "sans-serif" }}
        >
          {`Last Updated: February 20, 2025

Welcome to FortuneOK (https://fortuneok.com). Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your information.

1. Information We Collect
We collect the following information:
Personal Information: Name, email, and payment information.
Non-Personal Information: Web cookies to enhance user experience.

2. How We Use Your Information
We use your data to process orders and improve our services.

3. Data Sharing
We do not share your personal data with third parties.

4. Children's Privacy
We do not collect or process data from children under 13.

5. Updates to This Policy
We may update this Privacy Policy from time to time. Users will be notified via email of any changes.`}
          </pre>
        <QuestionsAboutDocs documentName="privacy policy" />
      </main>
      <Footer />
    </>
  );
};

export default PrivacyPolicy;
