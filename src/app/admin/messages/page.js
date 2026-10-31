import { requirePageRole } from "@/server/auth/guards";
import { listMessages } from "@/server/services/messageService";
import { messagesQuerySchema } from "@/lib/validators";
import { formatDateTime } from "@/lib/format";
import Eyebrow from "@/components/ui/Eyebrow";
import Tabs from "@/components/ui/Tabs";
import { Icon } from "@/components/ui/Icon";
import MessageReadToggle from "@/components/admin/MessageReadToggle";
import Pager from "@/components/admin/Pager";

export const metadata = { title: "Messages" };

export default async function AdminMessagesPage({ searchParams }) {
  await requirePageRole(["physician", "admin"], "/admin/messages");
  const query = messagesQuerySchema.parse(await searchParams);
  const result = await listMessages(query);

  return (
    <>
      <div className="page-head">
        <div>
          <Eyebrow tone="sun" icon="mail">
            Inbox
          </Eyebrow>
          <h1 style={{ marginTop: 12 }}>Contact messages</h1>
          <p>{result.unread ? `${result.unread} unread.` : "You’re all caught up."}</p>
        </div>
        <Tabs
          layoutId="msg-filter"
          label="Message filter"
          value={query.filter || "all"}
          items={[
            { id: "all", href: "/admin/messages", label: "All" },
            { id: "unread", href: "/admin/messages?filter=unread", label: "Unread", count: result.unread },
          ]}
        />
      </div>
      <div className="stack">
        {result.items.length ? (
          result.items.map((m) => (
            <article key={m.id} className={`panel clay ${m.readAt ? "" : "t-sun"}`}>
              <div className="status-head">
                <div>
                  <b>{m.name}</b>{" "}
                  <a className="link-btn" href={`mailto:${m.email}`} style={{ display: "inline" }}>
                    {m.email}
                  </a>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <span className={`tag ${m.readAt ? "t-blue" : "t-sun"}`}>{m.topic}</span>
                  <time style={{ fontSize: 12.5, color: "var(--ink-3)" }}>{formatDateTime(m.createdAt)}</time>
                </div>
              </div>
              <p style={{ whiteSpace: "pre-wrap", color: "var(--ink-2)" }}>{m.message}</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <MessageReadToggle id={m.id} read={!!m.readAt} />
                <a
                  className="btn btn-glass btn-sm"
                  href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.topic}`)}`}
                >
                  <Icon name="mail" /> Reply by email
                </a>
              </div>
            </article>
          ))
        ) : (
          <div className="panel clay empty">
            <span className="bubble lg t-sun">
              <Icon name="mail" />
            </span>
            <h3>No messages</h3>
            <p>Messages sent from the contact form appear here.</p>
          </div>
        )}
        <Pager
          page={result.page}
          pageSize={result.pageSize}
          total={result.total}
          basePath="/admin/messages"
          query={{ filter: query.filter }}
        />
      </div>
    </>
  );
}
