"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import { Icon } from "@/components/ui/Icon";

export default function MessageReadToggle({ id, read }) {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      className={read ? "btn btn-glass btn-sm" : "btn btn-primary btn-sm"}
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          await api("/api/admin/messages", { method: "PATCH", body: { id, read: !read } });
          router.refresh();
        } catch (err) {
          toast(err.message, { icon: "alert", tone: "bad" });
        } finally {
          setBusy(false);
        }
      }}
    >
      <Icon name={read ? "mail" : "check"} /> {read ? "Mark unread" : "Mark as read"}
    </button>
  );
}
