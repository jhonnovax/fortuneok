import "@/styles/app.css";
import LayoutClientPrivate from "@/components/LayoutClientPrivate";

export default async function DashboardLayout({ children }) {

  return (
    <LayoutClientPrivate>
      {children}
    </LayoutClientPrivate>
  );

}