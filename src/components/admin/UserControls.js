"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { ROLES } from "@/lib/validators";
import { useToast } from "@/components/ui/Toast";
import { Icon } from "@/components/ui/Icon";

/** Change a user's role or (de)activate the account. Admins can't change themselves. */
export default function UserControls({ user, isSelf }) {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  async function update(body, message) {
    setBusy(true);
    try {
      await api(`/api/admin/users/${user.id}`, { method: "PATCH", body });
      toast(message);
      router.refresh();
    } catch (err) {
      toast(err.message, { icon: "alert", tone: "bad" });
    } finally {
      setBusy(false);
    }
  }

  if (isSelf) return <span style={{ fontSize: 12.5, color: "var(--ink-3)" }}>This is you</span>;

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
      <label className="sr-only" htmlFor={`role-${user.id}`}>
        Role for {user.email}
      </label>
      <select
        id={`role-${user.id}`}
        className="inp"
        style={{ minHeight: 40, padding: "6px 36px 6px 12px", borderRadius: 12, width: "auto" }}
        value={user.role}
        disabled={busy}
        onChange={(e) =>
          update(
            { role: e.target.value },
            `${user.email} is now ${e.target.value === "admin" ? "an" : "a"} ${e.target.value}`,
          )
        }
      >
        {ROLES.map((r) => (
          <option key={r} value={r}>
            {r.charAt(0).toUpperCase() + r.slice(1)}
          </option>
        ))}
      </select>
      <button
        type="button"
        className={user.isActive ? "btn btn-glass btn-sm" : "btn btn-mint btn-sm"}
        disabled={busy}
        onClick={() =>
          update(
            { isActive: !user.isActive },
            user.isActive ? `${user.email} deactivated and signed out` : `${user.email} reactivated`,
          )
        }
      >
        <Icon name={user.isActive ? "lock" : "check"} /> {user.isActive ? "Deactivate" : "Reactivate"}
      </button>
    </div>
  );
}
