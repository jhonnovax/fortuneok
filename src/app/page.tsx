import Portfolio from "@/components/Dashboard/Portfolio";
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { Investment } from "@/types/Investment";

export const metadata: Metadata = {
  title: "FortuneOK | Manage your portfolio investments and track the money invested and profits",
  description: "Dashboard to manage your portfolio investments and track the money invested and profits",
};

const investmentData: Investment[] = [
  {
    name: "VOO",
    category: "stocks",
    price: 538.66,
    stocks: 62.62,
    profit: 2.67,
    profitPercentage: 2.34
  },
  {
    name: "VUG",
    category: "stocks",
    price: 410.56,
    stocks: 21.31,
    profit: 4.19,
    profitPercentage: 1.84
  },
  {
    name: "Nova Unit, San Francisco, USA",
    category: "real-estate",
    price: 50750,
    profit: 247,
    profitPercentage: 4.13
  },
  {
    name: "Saving Account, Bank of America",
    category: "cash",
    price: 25200,
    profit: 134.56,
    profitPercentage: 2.75
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
