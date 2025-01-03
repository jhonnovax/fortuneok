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
    date: "2022-04-25",
    name: "Nova Unit, San Francisco, USA",
    category: "real-estate",
    price: 50750,
    profit: 247,
    profitPercentage: 4.13
  },
  {
    date: "2023-04-25",
    name: "Saving Account, Bank of America",
    category: "cash",
    price: 25200,
    profit: 134.56,
    profitPercentage: 2.75
  },
  {
    date: "2024-06-15",
    name: "VOO",
    category: "stocks",
    price: 538.66,
    stocks: 62.62,
    profit: 2.67,
    profitPercentage: 2.34
  },
  {
    date: "2024-07-25",
    name: "VUG",
    category: "stocks",
    price: 410.56,
    stocks: 21.31,
    profit: 4.19,
    profitPercentage: 1.84
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
