import { requirePageRole } from "@/server/auth/guards";
import PortalNav from "@/components/layout/PortalNav";

export const metadata = {
  title: { default: "Review portal", template: "%s · Review portal · U.S.S.M.F." },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }) {
  const user = await requirePageRole(["physician", "admin"], "/admin");
  const nav = [
    { id: "overview", href: "/admin", label: "Overview", icon: "grid" },
    { id: "applications", href: "/admin/applications", label: "Applications", icon: "doc" },
    { id: "certificates", href: "/admin/certificates", label: "Certificates", icon: "medal" },
    { id: "messages", href: "/admin/messages", label: "Messages", icon: "mail" },
    ...(user.role === "admin" ? [{ id: "users", href: "/admin/users", label: "Users", icon: "users" }] : []),
  ];
  const label = `${user.role === "physician" ? "Dr. " : ""}${user.first_name} ${user.last_name} · ${user.role}`;
  return (
    <div className="app-main">
      <div className="wrap">
        <PortalNav items={nav} userLabel={label} layoutId="admin-tab" />
        {children}
      </div>
    </div>
  );
}
