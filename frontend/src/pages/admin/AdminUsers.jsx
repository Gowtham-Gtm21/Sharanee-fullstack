import { useEffect, useMemo, useState } from "react";
import { adminApi } from "../../api/endpoints";
import { useToast } from "../../context/ToastContext";
import { Icon } from "../../components/Icons";
import { FaEye, FaEdit } from "react-icons/fa";

export default function AdminUsers() {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const USERS_PER_PAGE = 5;

  const load = () => adminApi.users().then((r) => setUsers(r.data.users || [])).catch(() => { });
  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    if (!confirm("Delete this customer?")) return;
    try { await adminApi.deleteUser(id); toast.success("Customer deleted."); load(); }
    catch { toast.error("Could not delete."); }
  };
  let filteredUsers = [...users];


  const viewUser = (user) => {
    setSelectedUser(user);
    setShowModal(true);
    setIsEdit(false);
  };

  const editUser = (user) => {
    setSelectedUser({ ...user });
    setShowModal(true);
    setIsEdit(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  const saveUser = async () => {
    console.log("Save button clicked");
    console.log(selectedUser);

    try {
      const res = await adminApi.updateUser(selectedUser._id, {
        fullName: selectedUser.fullName,
        email: selectedUser.email,
        phone: selectedUser.phone,
        role: selectedUser.role,
        isActive: selectedUser.isActive,
      });

      console.log("Response:", res.data);

      toast.success("User updated successfully");
      load();
      closeModal();

    } catch (err) {
      console.log("Error:", err.response?.data);
      console.log(err);

      toast.error("Failed to update user");
    }
  };

  // Search by Name, Email, Phone
  if (search.trim()) {
    filteredUsers = filteredUsers.filter(
      (u) =>
        u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase()) ||
        u.phone?.includes(search)
    );
  }

  // Role Filter
  if (roleFilter) {

    filteredUsers = filteredUsers.filter(
      u =>
        u.role?.toLowerCase() === roleFilter.toLowerCase()
    );

  }

  // Status Filter
  if (statusFilter) {
    filteredUsers = filteredUsers.filter(
      (u) =>
        (u.isActive ? "Active" : "Blocked") === statusFilter
    );
  }

  // Pagination
  const lastIndex = currentPage * USERS_PER_PAGE;
  const firstIndex = lastIndex - USERS_PER_PAGE;

  const currentUsers = filteredUsers.slice(firstIndex, lastIndex);

  const totalPages = Math.ceil(
    filteredUsers.length / USERS_PER_PAGE
  );
  return (
    <>


      <div className="admin-toolbar">

        <h1>Users</h1>

        <div className="product-toolbar users-toolbar">

          <input
            className="toolbar-input"
            placeholder="Search Users..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />

          <select
            className="toolbar-select"
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Roles</option>
            <option value="user">Customer</option>
            <option value="admin">Admin</option>
          </select>

          <select
            className="toolbar-select"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Blocked">Blocked</option>
          </select>

        </div>

      </div>


      <table className="admin-table">
        <thead>

          <tr>
            <th>User</th>

            <th>Email</th>

            <th>Phone</th>

            <th>Role</th>

            <th>Status</th>

            <th>Joined</th>

            <th>Actions</th>

          </tr>

        </thead>
        <tbody>
          {currentUsers.map((u) => (
            <tr key={u._id}>

              <td>
                <div className="user-info">

                  <div className="user-avatar">
                    {u.fullName?.charAt(0).toUpperCase()}
                  </div>

                  <div className="user-name">
                    {u.fullName}
                  </div>

                </div>
              </td>

              <td>{u.email}</td>

              <td>{u.phone || "—"}</td>

              <td>
                <span className="tag">
                  {u.role === "admin" ? "Admin" : "Customer"}
                </span>
              </td>

              <td>
                <span className={u.isActive ? "status-active" : "status-blocked"}>
                  {u.isActive ? "Active" : "Blocked"}
                </span>
              </td>

              <td>
                {new Date(u.createdAt).toLocaleDateString("en-IN")}
              </td>

              <td style={{ whiteSpace: "nowrap" }}>
                <button
                  className="icon-btn view"
                  title="View"
                  onClick={() => viewUser(u)}
                >
                  <FaEye size={15} />
                </button>

                <button
                  className="icon-btn edit"
                  title="Edit"
                  onClick={() => editUser(u)}
                >
                  <FaEdit size={15} />
                </button>

                <button
                  className="icon-btn danger"
                  title="Delete"
                  onClick={() => remove(u._id)}
                >
                  <Icon.Trash size={16} />
                </button>


              </td>

            </tr>
          ))}


          {currentUsers.length === 0 &&

            <tr>

              <td colSpan="8" style={{ color: "var(--muted)" }}>

                No users found.

              </td>

            </tr>

          }

        </tbody>
      </table>


      <div className="pagination">

        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        >

          Previous

        </button>

        {Array.from({ length: totalPages }, (_, index) => (

          <button
            key={index}
            className={currentPage === index + 1 ? "active-page" : ""}
            onClick={() => setCurrentPage(index + 1)}
          >

            {index + 1}

          </button>

        ))}

        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
        >

          Next

        </button>

      </div>

      {showModal && selectedUser && (

        <div className="modal-back">

          <div className="modal">

            <h2>
              {isEdit ? "Edit User" : "User Details"}
            </h2>


            <div className="edit-user-header">

              <div className="edit-user-avatar">
                {selectedUser.fullName?.charAt(0).toUpperCase()}
              </div>

              <h3>{selectedUser.fullName}</h3>

            </div>

            <div className="order-details-grid">

              <div>
                <label>Name</label>

                <input
                  readOnly={!isEdit}
                  value={selectedUser.fullName}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      fullName: e.target.value,
                    })
                  }
                />

              </div>

              <div>
                <label>Email</label>

                <input
                  readOnly
                  value={selectedUser.email}
                />

              </div>

              <div>
                <label>Phone</label>

                <input
                  readOnly={!isEdit}
                  value={selectedUser.phone || ""}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      phone: e.target.value,
                    })
                  }
                />

              </div>

              <div>

                <label>Role</label>

                <select
                  disabled={!isEdit}
                  value={selectedUser.role}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      role: e.target.value
                    })
                  }
                >
                  <option value="user">Customer</option>
                  <option value="admin">Admin</option>
                </select>

              </div>

              <div>

                <label>Status</label>

                <select
                  disabled={!isEdit}
                  value={selectedUser.isActive ? "true" : "false"}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      isActive: e.target.value === "true"
                    })
                  }
                >
                  <option value="true">Active</option>
                  <option value="false">Blocked</option>
                </select>

              </div>

              <div>

                <label>Joined Date</label>

                <input
                  readOnly
                  value={new Date(selectedUser.createdAt).toLocaleDateString("en-IN")}
                />

              </div>

            </div>

            <div className="modal-actions">

              <button
                className="btn-secondary"
                onClick={closeModal}
              >
                Cancel
              </button>

              <button
                className="btn"
                onClick={saveUser}
              >
                Save
              </button>

            </div>
          </div>

        </div>

      )}

    </>
  );
}
