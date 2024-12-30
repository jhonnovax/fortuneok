import ECommerce from "@/components/Dashboard/Portfolio";
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

export const metadata: Metadata = {
  title: "FortuneOk | Manage my portfolio investments and track the money invested and profits",
  description: "Dashboard to handle my portfolio investments and track the money invested and profits",
};

export default function Home() {
  return (
    <>
      <DefaultLayout>
        <ECommerce />
      </DefaultLayout>
    </>
  );
}
