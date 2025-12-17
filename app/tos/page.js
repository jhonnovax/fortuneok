import { Suspense } from "react";
import { getSEOTags } from "@/libs/seo";
import config from "@/config";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QuestionsAboutDocs from "@/components/QuestionsAboutDocs";

// CHATGPT PROMPT TO GENERATE YOUR TERMS & SERVICES — replace with your own data 👇

// 1. Go to https://chat.openai.com/
// 2. Copy paste bellow
// 3. Replace the data with your own (if needed)
// 4. Paste the answer from ChatGPT directly in the <pre> tag below

// You are an excellent lawyer.

// I need your help to write a simple Terms & Services for my website. Here is some context:
// - Website: https://fortuneok.com
// - Name: FortuneOK
// - Contact information: support@mail.fortuneok.com
// - Description: A JavaScript code boilerplate to help entrepreneurs launch their startups faster
// - Ownership: when buying a package, users can download code to create apps. They own the code but they do not have the right to resell it. They can ask for a full refund within 7 day after the purchase.
// - User data collected: name, email and payment information
// - Non-personal data collection: web cookies
// - Link to privacy-policy: https://fortuneok.com/privacy-policy
// - Governing Law: United States
// - Updates to the Terms: users will be updated by email

// Please write a simple Terms & Services for my site. Add the current date. Do not add or explain your reasoning. Answer:

export const metadata = getSEOTags({
  title: `Terms and Conditions | ${config.appName}`,
  canonicalUrlRelative: "/tos",
});

const TOS = () => {
  return (
    <>
      <Suspense fallback={null}>
        <Header />
      </Suspense>
      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-extrabold pb-6">
          Terms and Conditions for {config.appName}
        </h1>

        <pre
          className="leading-relaxed whitespace-pre-wrap"
          style={{ fontFamily: "sans-serif" }}
        >
          {`Last Updated: February 20, 2025

Welcome to FortuneOK! By using our website (https://fortuneok.com) and services, you agree to the following Terms & Services. If you do not agree, please do not use our services.

1. Services Provided

FortuneOK allows users to manage and track their investments in one place. By purchasing a package, users can register their investments and receive real-time updates.

2. Purchases & Refund Policy

Users who purchase a package can request a full refund within 7 days of purchase by contacting support@mail.fortuneok.com.

3. User Data Collection

We collect the following personal data:

Name
Email
Payment information

Additionally, we collect non-personal data through web cookies. For more details, please review our Privacy Policy at https://fortuneok.com/privacy-policy.

4. User Responsibilities

Users must provide accurate information and use the services in compliance with applicable laws. Misuse of our services may result in account suspension or termination.

5. Governing Law

These Terms & Services are governed by the laws of the United States.

6. Updates to the Terms

We may update these Terms from time to time. Users will be notified of changes via email.

By using FortuneOK, you acknowledge that you have read and agree to these Terms & Services.`}
        </pre>
        <QuestionsAboutDocs documentName="terms and conditions" />
      </main>
      <Footer />
    </>
  );
};

export default TOS;
