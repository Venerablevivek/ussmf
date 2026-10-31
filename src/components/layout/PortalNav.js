"use client";

import { usePathname } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import Tabs from "@/components/ui/Tabs";
import { Icon } from "@/components/ui/Icon";

/** Tab bar for the athlete dashboard and the review portal, with the signed-in user and sign out. */
export default function PortalNav({ items, userLabel, layoutId }) {
  const pathname = usePathname();
  const { signOut } = useAuth();
  // The longest matching href wins, so /admin/applications beats /admin.
  const active = [...items]
    .sort((a, b) => b.href.length - a.href.length)
    .find((i) => pathname === i.href || pathname.startsWith(`${i.href}/`))?.id;
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
        flexWrap: "wrap",
        marginBottom: 28,
      }}
    >
      <Tabs items={items} value={active} label="Portal sections" layoutId={layoutId} />
      <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13.5, color: "var(--ink-2)" }}>
        <span>{userLabel}</span>
        <button type="button" className="btn btn-glass btn-sm" onClick={signOut}>
          <Icon name="logout" /> Sign out
        </button>
      </div>
    </div>
  );
}
