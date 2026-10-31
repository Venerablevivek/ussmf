import { requirePageRole } from "@/server/auth/guards";
import PortalNav from "@/components/layout/PortalNav";

export const metadata = {
  title: { default: "Dashboard", template: "%s · Dashboard · U.S.S.M.F." },
  robots: { index: false },
};

const NAV = [
  { id: "overview", href: "/dashboard", label: "My applications", icon: "doc" },
  { id: "certificates", href: "/dashboard/certificates", label: "My certificates", icon: "medal" },
];

export default async function DashboardLayout({ children }) {
  const user = await requirePageRole(["athlete"], "/dashboard");
  return (
    <div className="app-main">
      <div className="wrap">
        <PortalNav items={NAV} userLabel={user.email} layoutId="dash-tab" />
        {children}
      </div>
    </div>
  );
}
