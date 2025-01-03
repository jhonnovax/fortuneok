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
    category: "cash",
    company: "Proteccion",
    name: "Retirement Account",
    price: 1000,
    annualInterestRate: 7
  },
  {
    date: "2018-04-25",
    category: "real-estate",
    company: "Cacique Building",
    name: "Unit 402, New York, USA",
    price: 45000,
    annualInterestRate: 3,
  },
  {
    date: "2022-04-25",
    category: "real-estate",
    company: "Cacique Building",
    name: "Unit 403, San Francisco, USA",
    price: 50000,
    annualInterestRate: 3,
  },
  {
    date: "2023-04-25",
    category: "goods",
    company: "Renault",
    name: "Sandero Stepway",
    price: 10000,
    annualInterestRate: 0
  },
  {
    date: "2024-02-21",
    category: "real-estate",
    company: "Novoa Building",
    name: "Unit 301, New York, USA",
    price: 25000,
    annualInterestRate: 3
  },
  {
    date: "2024-06-15",
    category: "stocks",
    company: "Hapi",
    name: "VOO",
    price: 538.66,
    stocks: 62.62,
    annualInterestRate: 7
  },
  {
    date: "2024-07-25",
    category: "stocks",
    company: "Hapi",
    name: "VUG",
    price: 410.56,
    stocks: 21.31,
    annualInterestRate: 7
  },
  {
    date: "2024-10-02",
    category: 'cash',
    company: "Bancolombia",
    name: "Saving Account",
    price: 100000,
    annualInterestRate: 9.55
  },
  {
    date: "2024-10-06",
    category: "cash",
    company: "Nubank",
    name: "Saving Account",
    price: 10000,
    annualInterestRate: 11
  },
  {
    date: "2024-11-21",
    category: "cash",
    company: "Wealthsimple",
    name: "Saving Account",
    price: 10000,
    annualInterestRate: 2.75
  },
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
