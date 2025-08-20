import React, { useState, useEffect } from "react";
import axios from "axios";

/**
 * GetUser Component
 *
 * Manages user records for administrators, with inline editing and advanced filtering.
 *
 * Features:
 * - Fetches all users via /api/User/GetAllUser
 * - Edits user details (email, role) and optional password update via /api/User/UpdateUser/{id}
 * - Advanced filtering by User ID and Role
 * - Robust error handling with console logging
 * - Bootstrap 5 styling with improved UI
 *
 * @component
 * @returns {JSX.Element} The rendered user management interface
 */
function GetUser() {
  // ===== STATE MANAGEMENT =====
  const [allUsers, setUsers] = useState([]); // All fetched users
  const [loading, setLoading] = useState(true); // Loading flag
  const [error, setError] = useState(null); // Error message
  const [editUserId, setEditUserId] = useState(null); // Currently edited userId
  const [idFilter, setIdFilter] = useState(""); // Filter by User ID
  const [roleFilter, setRoleFilter] = useState(""); // Filter by Role
  const [editForm, setEditForm] = useState({
    userId: "",
    email: "",
    role: "",
    password: "",
  });

  // ===== LIFECYCLE HOOKS =====
  useEffect(() => {
    fetchUsers();
  }, []);

  // ===== API FUNCTIONS =====
  const fetchUsers = () => {
    setLoading(true);
    setError(null);

    const token = sessionStorage.getItem("token");
    if (!token) {
      setError("You must be logged in as an Admin to view this page. Please log in and try again.");
      console.error("No authentication token found");
      setLoading(false);
      return;
    }

    axios
      .get("http://localhost:5043/api/User/GetAllUser", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        const users = response.data.map(item => ({
          userId: item.userId,
          email: item.email,
          role: item.role || "Unknown",
        }));
        if (users.some(user => user.role === "Unknown")) {
          console.warn("Some users have missing roles:", 
            users.filter(user => user.role === "Unknown"));
        }
        console.log("✅ Users fetched successfully:", users);
        setUsers(users);
        setLoading(false);
      })
      .catch((error) => {
        console.error("❌ Error fetching users:", {
          error: error.message,
          status: error.response?.status,
          data: error.response?.data,
        });
        if (error.response?.status === 403) {
          setError("Access denied. Admin role required. Please check your permissions.");
        } else if (error.response?.status === 401) {
          setError("Unauthorized. Please log in again.");
        } else if (error.response?.status === 404) {
          setError("No users found.");
        } else {
          setError(`Failed to load users: ${error.response?.data || error.message}. Please try again or contact support.`);
        }
        setLoading(false);
      });
  };

  // ===== EVENT HANDLERS =====
  const handleUpdateClick = (user) => {
    setEditUserId(user.userId);
    setEditForm({
      userId: user.userId,
      email: user.email,
      role: user.role,
      password: "", // Never show existing password
    });
  };

  const handleSaveUpdate = (userId) => {
    if (!editForm.email.trim()) {
      setError("Email cannot be empty.");
      console.warn("Update attempted with empty email");
      return;
    }
    if (!editForm.role) {
      setError("Role cannot be empty.");
      console.warn("Update attempted with empty role");
      return;
    }
    if (editForm.password && editForm.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      console.warn("Password too short:", editForm.password.length);
      return;
    }

    const token = sessionStorage.getItem("token");
    const updateData = {
      userId: editForm.userId,
      email: editForm.email,
      role: editForm.role,
      password: editForm.password || undefined, // Omit password if empty
    };
    console.log("📤 Sending update payload:", updateData);

    axios
      .put(
        `http://localhost:5043/api/User/UpdateUser/${userId}`,
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((response) => {
        console.log("✅ User updated successfully:", response.data);
        alert("User updated successfully.");
        setEditUserId(null);
        fetchUsers();
      })
      .catch((error) => {
        console.error("❌ Error updating user:", {
          error: error.message,
          status: error.response?.status,
          data: error.response?.data,
        });
        if (error.response?.status === 400) {
          setError(`Invalid input: ${error.response.data || "Check user details."}`);
        } else if (error.response?.status === 401) {
          setError("Unauthorized. Please log in again.");
        } else if (error.response?.status === 403) {
          setError("Access denied. Admin role required.");
        } else {
          setError(`Failed to update user: ${error.response?.data || error.message}. Please try again.`);
        }
      });
  };

  const handleCancelUpdate = () => {
    setEditUserId(null);
    setEditForm({ userId: "", email: "", role: "", password: "" });
  };

  // ===== FILTERS =====
  const filteredUsers = allUsers.filter((user) => {
    const idMatch = !idFilter || user.userId.toLowerCase().includes(idFilter.toLowerCase());
    const roleMatch = !roleFilter || user.role === roleFilter;
    return idMatch && roleMatch;
  });

  /**
   * Clear all filters
   */
  const clearFilters = () => {
    setIdFilter("");
    setRoleFilter("");
  };

  // ===== LOADING & ERROR UI =====
  if (loading) return (
    <div className="text-center p-5">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="mt-3">Loading users...</p>
    </div>
  );
  
  if (error) return (
    <div className="text-center p-5">
      <div className="alert alert-danger" role="alert">
        <h4 className="alert-heading">⚠️ Error</h4>
        <p>{error}</p>
        <hr />
        <div className="d-flex justify-content-center gap-2">
          <button className="btn btn-outline-danger" onClick={() => setError(null)}>
            Dismiss
          </button>
          <button className="btn btn-outline-primary" onClick={fetchUsers}>
            Retry
          </button>
        </div>
      </div>
    </div>
  );

  // ===== RENDER =====
  return (
    <div className="container-fluid p-4">
      {/* ===== PAGE HEADER ===== */}
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="text-center text-primary mb-3">👤 Users Management</h1>
          <p className="text-center text-muted">Manage and maintain user accounts and permissions in the system</p>
        </div>
      </div>

      {/* ===== FILTER SECTION ===== */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">🔍 Search & Filter Options</h5>
            </div>
            <div className="card-body">
              <div className="row g-3 align-items-end">
                <div className="col-md-4">
                  <label className="form-label fw-bold">User ID:</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter User ID"
                    value={idFilter}
                    onChange={(e) => setIdFilter(e.target.value)}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-bold">Role:</label>
                  <select
                    className="form-control"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                  >
                    <option value="">All Roles</option>
                    <option value="Admin">Admin</option>
                    <option value="Doctor">Doctor</option>
                    <option value="Patient">Patient</option>
                  </select>
                </div>
                <div className="col-md-4 text-end">
                  <button onClick={clearFilters} className="btn btn-outline-secondary">
                    🗑️ Clear Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== RESULTS SUMMARY ===== */}
      <div className="row mb-3">
        <div className="col-12">
          <div className="alert alert-info" role="alert">
            <strong>📊 Results:</strong> Showing {filteredUsers.length} of {allUsers.length} users
            {idFilter && <span> • ID: {idFilter}</span>}
            {roleFilter && <span> • Role: {roleFilter}</span>}
          </div>
        </div>
      </div>

      {/* ===== USERS TABLE ===== */}
      {filteredUsers.length === 0 ? (
        <div className="row">
          <div className="col-12">
            <div className="alert alert-warning" role="alert">
              <h4 className="alert-heading">😔 No Users Found</h4>
              <p>
                {idFilter || roleFilter
                  ? "No users match your current filters. Try adjusting your search criteria."
                  : "No users found in the system."}
              </p>
              {(idFilter || roleFilter) && (
                <button className="btn btn-outline-warning" onClick={clearFilters}>
                  Clear All Filters
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="row">
          <div className="col-12">
            <div className="card shadow">
              <div className="card-header bg-success text-white">
                <h5 className="mb-0">👤 Users Directory</h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-striped table-hover">
                    <thead className="table-dark">
                      <tr>
                        <th>User ID</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th style={{ width: "150px" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.userId}>
                          {editUserId === user.userId ? (
                            <>
                              <td>
                                <span className="badge bg-primary fs-6">{user.userId}</span>
                              </td>
                              <td>
                                <input
                                  type="email"
                                  className="form-control"
                                  value={editForm.email}
                                  onChange={(e) =>
                                    setEditForm({ ...editForm, email: e.target.value })
                                  }
                                />
                              </td>
                              <td>
                                <select
                                  className="form-select"
                                  value={editForm.role}
                                  onChange={(e) =>
                                    setEditForm({ ...editForm, role: e.target.value })
                                  }
                                >
                                  <option value="Admin">Admin</option>
                                  <option value="Doctor">Doctor</option>
                                  <option value="Patient">Patient</option>
                                </select>
                              </td>
                              <td>
                                <button
                                  className="btn btn-success btn-sm me-2"
                                  onClick={() => handleSaveUpdate(user.userId)}
                                >
                                  💾 Save
                                </button>
                                <button
                                  className="btn btn-secondary btn-sm"
                                  onClick={handleCancelUpdate}
                                >
                                  ❌ Cancel
                                </button>
                              </td>
                            </>
                          ) : (
                            <>
                              <td>
                                <span className="badge bg-primary fs-6">{user.userId}</span>
                              </td>
                              <td>
                                <span className="text-info">{user.email}</span>
                              </td>
                              <td>
                                <span
                                  className={
                                    user.role === "Admin"
                                      ? "badge bg-danger fs-6"
                                      : user.role === "Doctor"
                                      ? "badge bg-success fs-6"
                                      : user.role === "Patient"
                                      ? "badge bg-info fs-6"
                                      : "badge bg-secondary fs-6"
                                  }
                                >
                                  {user.role}
                                </span>
                              </td>
                              <td>
                                <button
                                  className="btn btn-info btn-sm"
                                  onClick={() => handleUpdateClick(user)}
                                >
                                  ✏️ Update
                                </button>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== PASSWORD UPDATE SECTION ===== */}
      {editUserId && (
        <div className="row mt-4">
          <div className="col-12">
            <div className="card shadow">
              <div className="card-header bg-warning text-white">
                <h5 className="mb-0">🔐 Update Password</h5>
              </div>
              <div className="card-body">
                <p className="text-muted mb-3">
                  Enter a new password (minimum 6 characters). Leave empty to keep the current password.
                </p>
                <div className="row g-3 align-items-end">
                  <div className="col-md-6">
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Enter new password (optional)"
                      value={editForm.password}
                      onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                    />
                  </div>
                  <div className="col-md-3">
                    <button
                      className="btn btn-outline-secondary w-100"
                      onClick={() => setEditForm({ ...editForm, password: "" })}
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== FOOTER TIP ===== */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="text-center text-muted">
            <small>💡 Tip: Use the filters above to find users by ID or role.</small>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GetUser;