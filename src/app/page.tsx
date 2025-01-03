import Portfolio from "@/components/Dashboard/Portfolio";
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { Investment } from "@/types/Investment";

export const metadata: Metadata = {
  title: "FortuneOK | Manage your Investment Portfolio",
  description: "Effortlessly manage your portfolio investments with our intuitive dashboard. Track your invested funds, analyze allocation, and monitor the performance of your investments all in one place.",
};

const investmentData: Investment[] = [
  {
    date: "2011-11-29",
    company: "Proteccion",
    name: "Retirement Account",
    amount: 1000,
    annualInterestRate: 7,
    profit: 120,
    total: 1000,
  },
  {
    date: "2018-04-25",
    company: "Cacique Building",
    name: "Unit 402, New York, USA",
    amount: 45000,
    annualInterestRate: 3,
    profit: 1200,
    total: 45000
  },
  {
    date: "2022-04-25",
    company: "Cacique Building",
    name: "Unit 403, San Francisco, USA",
    amount: 50000,
    annualInterestRate: 3,
    profit: 1500,
    total: 50000
  },
  {
    date: "2023-04-25",
    company: "Renault",
    name: "Sandero Stepway",
    amount: 10000,
    annualInterestRate: 0,
    profit: 0,
    total: 10000
  },
  {
    date: "2024-02-21",
    company: "Novoa Building",
    name: "Unit 301, New York, USA",
    amount: 25000,
    annualInterestRate: 3,
    profit: 750,
    total: 25000
  },
  {
    date: "2024-06-15",
    company: "Hapi",
    name: "VOO",
    stocks: 62.62,
    annualInterestRate: 7,
    profit: 1240,
    total: (62.62 * 543.05),
  },
  {
    date: "2024-07-25",
    company: "Hapi",
    name: "VUG",
    stocks: 21.31,
    annualInterestRate: 7,
    profit: 0,
    total: (21.31 * 415.19)
  },
  {
    date: "2024-10-02",
    company: "Bancolombia",
    name: "CDT",
    amount: 100000,
    annualInterestRate: 9.55,
    profit: 9550,
    total: 100000
  },
  {
    date: "2024-10-06",
    company: "Nubank",
    name: "Saving Account",
    amount: 10000,
    annualInterestRate: 11,
    profit: 1100,
    total: 10000
  },
  {
    date: "2024-11-21",
    company: "Wealthsimple",
    name: "Saving Account",
    amount: 10000,
    annualInterestRate: 2.75,
    profit: 275,
    total: 10000
  }
];


export default function Home() {
  return (
    <>
      <DefaultLayout>
        <Portfolio investmentData={investmentData} />
      </DefaultLayout>
    </>
  );
}
