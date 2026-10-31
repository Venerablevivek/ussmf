import { requirePageRole } from "@/server/auth/guards";
import { listUsers } from "@/server/services/userService";
import { usersQuerySchema } from "@/lib/validators";
import { formatDate } from "@/lib/format";
import Eyebrow from "@/components/ui/Eyebrow";
import Badge from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import UserControls from "@/components/admin/UserControls";
import Pager from "@/components/admin/Pager";

export const metadata = { title: "Users" };

const ROLE_TONE = { athlete: "blue", physician: "lav", admin: "coral" };

export default async function AdminUsersPage({ searchParams }) {
  const me = await requirePageRole(["admin"], "/admin/users");
  const query = usersQuerySchema.parse(await searchParams);
  const result = await listUsers(query);

  return (
    <>
      <div className="page-head">
        <div>
          <Eyebrow tone="coral" icon="users">
            Administration
          </Eyebrow>
          <h1 style={{ marginTop: 12 }}>Users</h1>
          <p>Change roles and deactivate accounts. Deactivation signs the user out everywhere.</p>
        </div>
      </div>
      <div className="stack">
        <form className="filters panel clay" method="get" role="search">
          <div className="field" style={{ flex: "2 1 240px" }}>
            <label htmlFor="q">Search</label>
            <input className="inp" id="q" name="q" defaultValue={query.q} placeholder="Name or email" />
          </div>
          <div className="field">
            <label htmlFor="role">Role</label>
            <select className="inp" id="role" name="role" defaultValue={query.role}>
              <option value="">All roles</option>
              <option value="athlete">Athletes</option>
              <option value="physician">Physicians</option>
              <option value="admin">Admins</option>
            </select>
          </div>
          <button className="btn btn-primary btn-sm" type="submit">
            <Icon name="search" /> Apply
          </button>
        </form>
        <div className="ctable-wrap">
          <table className="ctable">
            <thead>
              <tr>
                <th scope="col">User</th>
                <th scope="col">Role</th>
                <th scope="col">Status</th>
                <th scope="col">Joined</th>
                <th scope="col">Manage</th>
              </tr>
            </thead>
            <tbody>
              {result.items.map((u) => (
                <tr key={u.id}>
                  <td>
                    <b>{u.name}</b>
                    <div style={{ fontSize: 12.5, color: "var(--ink-3)" }}>{u.email}</div>
                  </td>
                  <td>
                    <Badge tone={ROLE_TONE[u.role]}>{u.role}</Badge>
                  </td>
                  <td>
                    {u.isActive ? <Badge tone="mint">Active</Badge> : <Badge tone="coral">Deactivated</Badge>}
                  </td>
                  <td style={{ whiteSpace: "nowrap" }}>{formatDate(u.createdAt)}</td>
                  <td>
                    <UserControls user={u} isSelf={u.id === me.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pager
          page={result.page}
          pageSize={result.pageSize}
          total={result.total}
          basePath="/admin/users"
          query={{ q: query.q, role: query.role }}
        />
      </div>
    </>
  );
}
