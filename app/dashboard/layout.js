import LayoutClientPrivate from "@/components/LayoutClientPrivate";

export default function DashboardLayout({ children }) {

  return (
    <LayoutClientPrivate>
      {children}
    </LayoutClientPrivate>
  );

}