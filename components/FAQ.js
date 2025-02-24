"use client";

import { useRef, useState } from "react";

// <FAQ> component is a lsit of <Item> component
// Just import the FAQ & add your FAQ content to the const faqList

const faqList = [
  {
    question: "Why do I need FortuneOK?",
    answer: <div className="space-y-2 leading-relaxed">When do you have many kinds of investments, it&apos;s hard to keep track of them. FortuneOK is a tool that helps you keep track of your investments and manage all of them in one place.</div>,
  },
  {
    question: "Does it support multiple currencies?",
    answer: <div className="space-y-2 leading-relaxed">Yes! FortuneOK supports multiple currencies. You can add your investments in different currencies and FortuneOK will convert them to your base currency for you.</div>,
  },
  {
    question: "Can I migrate my existing investments?",
    answer: <div className="space-y-2 leading-relaxed">Yes! For now you can import or export your investments to Excel/CSV.</div>,
  },
  {
    question: 'It is secure?',
    answer: <div className="space-y-2 leading-relaxed">Yes! We prioritize security and use encryption to keep your investment data safe. Your information is never shared or sold.</div>,
  },
  {
    question: "Can I get a refund?",
    answer: <p>Yes! You can request a refund within 7 days of your purchase. Reach out by email at <a className="text-primary hover:underline" href="mailto:support@fortuneok.com" target="_blank" rel="noopener noreferrer">support@fortuneok.com</a>.</p>,
  }
];

const Item = ({ item }) => {
  const accordion = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <li>
      <button
        className="relative flex gap-2 items-center w-full py-5 text-base font-semibold text-left border-t md:text-lg border-base-content/10"
        onClick={(e) => {
          e.preventDefault();
          setIsOpen(!isOpen);
        }}
        aria-expanded={isOpen}
      >
        <span
          className={`flex-1 text-base-content ${isOpen ? "text-primary" : ""}`}
        >
          {item?.question}
        </span>
        <svg
          className={`flex-shrink-0 w-4 h-4 ml-auto fill-current`}
          viewBox="0 0 16 16"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            y="7"
            width="16"
            height="2"
            rx="1"
            className={`transform origin-center transition duration-200 ease-out ${
              isOpen && "rotate-180"
            }`}
          />
          <rect
            y="7"
            width="16"
            height="2"
            rx="1"
            className={`transform origin-center rotate-90 transition duration-200 ease-out ${
              isOpen && "rotate-180 hidden"
            }`}
          />
        </svg>
      </button>

      <div
        ref={accordion}
        className={`transition-all duration-300 ease-in-out opacity-80 overflow-hidden`}
        style={
          isOpen
            ? { maxHeight: accordion?.current?.scrollHeight, opacity: 1 }
            : { maxHeight: 0, opacity: 0 }
        }
      >
        <div className="pb-5 leading-relaxed">{item?.answer}</div>
      </div>
    </li>
  );
};

const FAQ = () => {
  return (
    <section className="bg-base-200" id="faq">
      <div className="py-24 px-8 max-w-7xl mx-auto flex flex-col md:flex-row gap-12">
        <div className="flex flex-col text-left basis-1/2">
          <p className="inline-block font-semibold text-primary mb-4">FAQ</p>
          <p className="sm:text-4xl text-3xl font-extrabold text-base-content">
            Frequently Asked Questions
          </p>
        </div>

        <ul className="basis-1/2">
          {faqList.map((item, i) => (
            <Item key={i} item={item} />
          ))}
        </ul>
      </div>
    </section>
  );
};

export default FAQ;
