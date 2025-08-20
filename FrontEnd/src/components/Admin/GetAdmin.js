import React, { useState, useEffect } from "react";
import axios from "axios";

/**
 * GetAdmin Component
 * 
 * This component provides a comprehensive interface for managing admin records.
 * It allows administrators to view, edit, delete, and search admin information.
 * 
 * Features:
 * - Display all admins in a table format with enhanced details
 * - Edit admin details inline (name, phone, email)
 * - Delete admin records with confirmation
 * - Advanced filtering by Admin ID or Name
 * - Authentication and authorization checks
 * - Real-time filtering and updates
 * - Bootstrap 5 styling with improved UI
 */
function GetAdmin() {
  // State management for component data and UI
  const [allAdmins, setAdmins] = useState([]); // All admins data from API
  const [loading, setLoading] = useState(true); // Loading state for API calls
  const [error, setError] = useState(null); // Error message display
  const [editAdminId, setEditAdminId] = useState(null); // Currently edited admin ID
  const [idFilter, setIdFilter] = useState(""); // Filter by Admin ID
  const [nameFilter, setNameFilter] = useState(""); // Filter by Admin Name
  
  // Form state for editing admin details
  const [editForm, setEditForm] = useState({
    adminId: "",
    userID: "",
    name: "",
    phoneNo: "",
    email: "",
  });

  // Fetch admins when component mounts
  useEffect(() => {
    fetchAdmins();
  }, []);

  /**
   * Fetch all admins from the backend API
   * Handles authentication, API calls, and error scenarios
   */
  const fetchAdmins = () => {
    // Get authentication token from session storage
    const token = sessionStorage.getItem("token");

    // Check if user is authenticated
    if (!token) {
      setError("You must be logged in as an Admin to view this page.");
      setLoading(false);
      return;
    }

    // Make API call to fetch all admins
    axios
      .get("http://localhost:5043/api/Admin/GetAllAdmin", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        // Update admins state with fetched data
        setAdmins(response.data || []);
        setLoading(false);
        setError(null); // Clear error if data is available
      })
      .catch((error) => {
        console.error("Error fetching admins:", error);
        
        // Handle different error scenarios with appropriate messages
        if (error.response?.status === 403) {
          setError("Access denied. Admin role required.");
        } else if (error.response?.status === 401) {
          setError("Unauthorized. Please log in again.");
        } else if (error.response?.status === 404) {
          setError("Admin API endpoint not found. Please check the backend configuration.");
        } else if (error.response?.status === 500) {
          setError("Backend server error. Please try again later.");
        } else {
          setError("Failed to load admins. Please try again.");
        }
        setLoading(false);
      });
  };

  /**
   * Delete an admin by ID
   * Shows confirmation dialog before deletion
   * @param {number} adminId - The ID of the admin to delete
   */
  const handleDelete = (adminId) => {
    // Show confirmation dialog before proceeding
    if (window.confirm("Are you sure you want to delete this admin?")) {
      const token = sessionStorage.getItem("token");

      // Make API call to delete admin
      axios
        .delete(`http://localhost:5043/api/Admin/DeleteAdmin/${adminId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(() => {
          alert("Admin deleted successfully.");
          // Remove the deleted admin from local state
          setAdmins((prev) => prev.filter((a) => a.adminId !== adminId));
        })
        .catch((error) => {
          console.error("Error deleting admin:", error);
          alert("Failed to delete admin.");
        });
    }
  };

  /**
   * Enable edit mode for a specific admin
   * Populates the edit form with current admin data
   * @param {Object} admin - The admin object to edit
   */
  const handleUpdateClick = (admin) => {
    // Set the admin ID being edited
    setEditAdminId(admin.adminId);
    
    // Populate edit form with current admin data
    setEditForm({
      adminId: admin.adminId,
      userID: admin.userID,
      name: admin.name,
      phoneNo: admin.phoneNo,
      email: admin.email,
    });
  };

  /**
   * Save the updated admin details
   * Sends PUT request to update admin information
   * @param {number} adminId - The ID of the admin being updated
   */
  const handleSaveUpdate = (adminId) => {
    const token = sessionStorage.getItem("token");

    // Make API call to update admin
    axios
      .put(
        `http://localhost:5043/api/Admin/UpdateAdmin/${adminId}`,
        editForm, // Send the entire edit form data
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        alert("Admin updated successfully.");
        // Exit edit mode
        setEditAdminId(null);
        // Refresh the admins list to show updated data
        fetchAdmins();
      })
      .catch((error) => {
        console.error("Error updating admin:", error);
        alert("Failed to update admin.");
      });
  };

  /**
   * Cancel edit mode
   * Resets the edit state without saving changes
   */
  const handleCancelUpdate = () => {
    setEditAdminId(null);
  };

  /**
   * Filter admins based on multiple criteria
   * Filters by Admin ID and Name
   */
  const filteredAdmins = allAdmins.filter((admin) => {
    const idMatch = !idFilter || admin.adminId.toString().includes(idFilter);
    const nameMatch = !nameFilter || admin.name?.toLowerCase().includes(nameFilter.toLowerCase());
    return idMatch && nameMatch;
  });

  /**
   * Clear all filters
   */
  const clearFilters = () => {
    setIdFilter("");
    setNameFilter("");
  };

  // Show loading indicator while fetching data
  if (loading) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading admins...</p>
      </div>
    );
  }
  
  // Show error message if there's an error
  if (error) {
    return (
      <div className="text-center p-5">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">⚠️ Error</h4>
          <p>{error}</p>
          <hr />
          <button className="btn btn-outline-danger" onClick={fetchAdmins}>
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      {/* Page Title */}
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="text-center text-primary mb-3">👨‍💼 Admins Management</h1>
          <p className="text-center text-muted">Manage and maintain administrative accounts in the system</p>
        </div>
      </div>

      {/* Filter Section */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">🔍 Search & Filter Options</h5>
            </div>
            <div className="card-body">
              <div className="row g-3 align-items-end">
                <div className="col-md-4">
                  <label className="form-label fw-bold">Admin ID:</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter ID"
                    value={idFilter}
                    onChange={(e) => setIdFilter(e.target.value)}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-bold">Admin Name:</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter name"
                    value={nameFilter}
                    onChange={(e) => setNameFilter(e.target.value)}
                  />
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

      {/* Results Summary */}
      <div className="row mb-3">
        <div className="col-12">
          <div className="alert alert-info" role="alert">
            <strong>📊 Results:</strong> Showing {filteredAdmins.length} of {allAdmins.length} admins
            {idFilter && <span> • ID: {idFilter}</span>}
            {nameFilter && <span> • Name: {nameFilter}</span>}
          </div>
        </div>
      </div>

      {/* Display admins table or "no admins" message */}
      {filteredAdmins.length === 0 ? (
        <div className="row">
          <div className="col-12">
            <div className="alert alert-warning" role="alert">
              <h4 className="alert-heading">😔 No Admins Found</h4>
              <p>
                {idFilter || nameFilter
                  ? "No admins match your current filters. Try adjusting your search criteria."
                  : "No admins found in the system."}
              </p>
              {(idFilter || nameFilter) && (
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
                <h5 className="mb-0">👨‍💼 Admins Directory</h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-striped table-hover">
                    <thead className="table-dark">
                      <tr>
                        <th>Admin ID</th>
                        <th>User ID</th>
                        <th>Name</th>
                        <th>Phone</th>
                        <th>Email</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAdmins.map((admin) => (
                        <tr key={admin.adminId}>
                          {/* Admin ID is always read-only */}
                          <td>
                            <span className="badge bg-primary fs-6">{admin.adminId}</span>
                          </td>

                          {/* Conditional rendering: Edit mode vs View mode */}
                          {editAdminId === admin.adminId ? (
                            // EDIT MODE - Show input fields for editing
                            <>
                              {/* User ID is read-only */}
                              <td>
                                <span className="badge bg-secondary fs-6">{admin.userID}</span>
                              </td>
                              
                              {/* Editable Name field */}
                              <td>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={editForm.name}
                                  onChange={(e) =>
                                    setEditForm({ ...editForm, name: e.target.value })
                                  }
                                />
                              </td>

                              {/* Editable Phone number field */}
                              <td>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={editForm.phoneNo}
                                  onChange={(e) =>
                                    setEditForm({
                                      ...editForm,
                                      phoneNo: e.target.value,
                                    })
                                  }
                                />
                              </td>

                              {/* Editable Email field with email validation */}
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

                              {/* Action buttons for edit mode */}
                              <td>
                                {/* Save button - green background */}
                                <button
                                  onClick={() => handleSaveUpdate(admin.adminId)}
                                  className="btn btn-success btn-sm me-2"
                                >
                                  💾 Save
                                </button>
                                {/* Cancel button - gray background */}
                                <button
                                  onClick={handleCancelUpdate}
                                  className="btn btn-secondary btn-sm"
                                >
                                  ❌ Cancel
                                </button>
                              </td>
                            </>
                          ) : (
                            // VIEW MODE - Show read-only data
                            <>
                              {/* Read-only admin information */}
                              <td>
                                <span className="badge bg-secondary fs-6">{admin.userID}</span>
                              </td>
                              <td>
                                <strong className="text-primary">{admin.name}</strong>
                              </td>
                              <td>{admin.phoneNo}</td>
                              <td>
                                <span className="text-info">{admin.email}</span>
                              </td>
                              {/* Action buttons for view mode */}
                              <td>
                                {/* Update button - blue background */}
                                <button
                                  onClick={() => handleUpdateClick(admin)}
                                  className="btn btn-info btn-sm me-2"
                                >
                                  ✏️ Update
                                </button>
                                {/* Delete button - red background */}
                                <button
                                  onClick={() => handleDelete(admin.adminId)}
                                  className="btn btn-danger btn-sm"
                                >
                                  🗑️ Delete
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
    </div>
  );
}

export default GetAdmin;
