import { useEffect, useState } from "react";
import { adminApi } from "../../api/endpoints";
import { useToast } from "../../context/ToastContext";
import { Icon } from "../../components/Icons";

export default function AdminUsers() {
  const toast = useToast();
  const [users, setUsers] = useState([]);

  const load = () => adminApi.users().then((r) => setUsers(r.data.users || [])).catch(() => {});
  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    if (!confirm("Delete this customer?")) return;
    try { await adminApi.deleteUser(id); toast.success("Customer deleted."); load(); }
    catch { toast.error("Could not delete."); }
  };

  return (
    <>
      <h1>Users</h1>
      <table className="admin-table">
        <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th></th></tr></thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id}>
              <td>{u.fullName}</td>
              <td>{u.email}</td>
              <td>{u.phone || "—"}</td>
              <td><span className="tag">{u.role === "admin" ? "Admin" : "Customer"}</span></td>
              <td style={{ whiteSpace: "nowrap" }}>
                <button
                  className="icon-btn danger"
                  title="Delete"
                  aria-label="Delete"
                  onClick={() => remove(u._id)}
                >
                  <Icon.Trash size={16} />
                </button>
              </td>
            </tr>
          ))}
          {users.length === 0 && <tr><td colSpan="5" style={{ color: "var(--muted)" }}>No customers yet.</td></tr>}
        </tbody>
      </table>
    </>
  );
}
