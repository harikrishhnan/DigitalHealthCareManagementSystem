import React, { useState, useEffect } from "react";
import axios from "axios";

/**
 * GetDoctor Component
 * 
 * This component provides a comprehensive interface for managing doctor records.
 * It allows administrators to view, edit, delete, and search doctor information.
 * 
 * Features:
 * - Display all doctors in a table format
 * - Edit doctor details inline (name, speciality, phone, email)
 * - Delete doctor records with confirmation
 * - Advanced filtering by Doctor ID, Specialization, and Name
 * - Authentication and authorization checks
 * - Real-time filtering and updates
 * - Bootstrap 5 styling with improved UI
 */
function GetDoctor() {
  // State management for component data and UI
  const [allDoctors, setDoctors] = useState([]); // All doctors data from API
  const [loading, setLoading] = useState(true); // Loading state for API calls
  const [error, setError] = useState(null); // Error message display
  const [editDoctorId, setEditDoctorId] = useState(null); // Currently edited doctor ID
  const [idFilter, setIdFilter] = useState(""); // Filter by Doctor ID
  const [specializationFilter, setSpecializationFilter] = useState(""); // Filter by Specialization
  const [nameFilter, setNameFilter] = useState(""); // Filter by Doctor Name
  const [specializations, setSpecializations] = useState([]); // Available specializations
  
  // Form state for editing doctor details
  const [editForm, setEditForm] = useState({
    doctorId: "",
    userID: "",
    docName: "",
    speciality: "",
    phoneNo: "",
    email: "",
  });

  // Fetch doctors when component mounts
  useEffect(() => {
    fetchDoctors();
  }, []);

  // Extract unique specializations when doctors data changes
  useEffect(() => {
    if (allDoctors.length > 0) {
      const uniqueSpecs = [...new Set(allDoctors.map((doctor) => doctor.speciality))]
        .filter(Boolean)
        .sort();
      setSpecializations(uniqueSpecs);
    }
  }, [allDoctors]);

  /**
   * Fetch all doctors from the backend API
   * Handles authentication, API calls, and error scenarios
   */
  const fetchDoctors = () => {
    // Get authentication token from session storage
    const token = sessionStorage.getItem("token");

    // Check if user is authenticated
    if (!token) {
      setError("You must be logged in as an Admin to view this page.");
      setLoading(false);
      return;
    }

    // Make API call to fetch all doctors
    axios
      .get("http://localhost:5043/api/Doctor/GetAllDoctor", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        // Update doctors state with fetched data
        setDoctors(response.data || []);
        setLoading(false);
        setError(null); // Clear error if data is available
      })
      .catch((error) => {
        console.error("Error fetching doctors:", error);
        
        // Handle different error scenarios with appropriate messages
        if (error.response?.status === 403) {
          setError("Access denied. Admin role required.");
        } else if (error.response?.status === 401) {
          setError("Unauthorized. Please log in again.");
        } else if (error.response?.status === 404) {
          setError("Doctors API endpoint not found. Please check the backend configuration.");
        } else if (error.response?.status === 500) {
          setError("Backend server error. Please try again later.");
        } else {
          setError("Failed to load doctors. Please try again.");
        }
        setLoading(false);
      });
  };

  /**
   * Delete a doctor by ID
   * Shows confirmation dialog before deletion
   * @param {number} doctorId - The ID of the doctor to delete
   */
  const handleDelete = (doctorId) => {
    // Show confirmation dialog before proceeding
    if (window.confirm("Are you sure you want to delete this doctor?")) {
      const token = sessionStorage.getItem("token");

      // Make API call to delete doctor
      axios
        .delete(`http://localhost:5043/api/Doctor/DeleteDoctor/${doctorId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(() => {
          alert("Doctor deleted successfully.");
          // Remove the deleted doctor from local state
          setDoctors((prev) => prev.filter((d) => d.doctorId !== doctorId));
        })
        .catch((error) => {
          console.error("Error deleting doctor:", error);
          alert("Failed to delete doctor.");
        });
    }
  };

  /**
   * Enable edit mode for a specific doctor
   * Populates the edit form with current doctor data
   * @param {Object} doctor - The doctor object to edit
   */
  const handleUpdateClick = (doctor) => {
    // Set the doctor ID being edited
    setEditDoctorId(doctor.doctorId);
    
    // Populate edit form with current doctor data
    setEditForm({
      doctorId: doctor.doctorId,
      userID: doctor.userID,
      docName: doctor.docName,
      speciality: doctor.speciality,
      phoneNo: doctor.phoneNo,
      email: doctor.email,
    });
  };

  /**
   * Save the updated doctor details
   * Sends PUT request to update doctor information
   * @param {number} doctorId - The ID of the doctor being updated
   */
  const handleSaveUpdate = (doctorId) => {
    const token = sessionStorage.getItem("token");

    // Make API call to update doctor
    axios
      .put(
        `http://localhost:5043/api/Doctor/UpdateDoctorByID/${doctorId}`,
        editForm, // Send the entire edit form data
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        alert("Doctor updated successfully.");
        // Exit edit mode
        setEditDoctorId(null);
        // Refresh the doctors list to show updated data
        fetchDoctors();
      })
      .catch((error) => {
        console.error("Error updating doctor:", error);
        alert("Failed to update doctor.");
      });
  };

  /**
   * Cancel edit mode
   * Resets the edit state without saving changes
   */
  const handleCancelUpdate = () => {
    setEditDoctorId(null);
  };

  /**
   * Filter doctors based on multiple criteria
   * Filters by Doctor ID, Specialization, and Name
   */
  const filteredDoctors = allDoctors.filter((doctor) => {
    const idMatch = !idFilter || doctor.doctorId.toString().includes(idFilter);
    const specMatch = !specializationFilter || doctor.speciality === specializationFilter;
    const nameMatch = !nameFilter || doctor.docName.toLowerCase().includes(nameFilter.toLowerCase());
    return idMatch && specMatch && nameMatch;
  });

  /**
   * Clear all filters
   */
  const clearFilters = () => {
    setIdFilter("");
    setSpecializationFilter("");
    setNameFilter("");
  };

  // Show loading indicator while fetching data
  if (loading) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading doctors...</p>
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
          <button className="btn btn-outline-danger" onClick={fetchDoctors}>
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
          <h1 className="text-center text-primary mb-3">👨‍⚕️ Doctors Management</h1>
          <p className="text-center text-muted">Manage and maintain doctor records in the system</p>
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
                <div className="col-md-3">
                  <label className="form-label fw-bold">Filter by Doctor ID:</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter Doctor ID"
                    value={idFilter}
                    onChange={(e) => setIdFilter(e.target.value)}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-bold">Filter by Specialization:</label>
                  <select
                    className="form-control"
                    value={specializationFilter}
                    onChange={(e) => setSpecializationFilter(e.target.value)}
                  >
                    <option value="">All Specializations</option>
                    {specializations.map((spec) => (
                      <option key={spec} value={spec}>
                        {spec}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-bold">Filter by Name:</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter Doctor Name"
                    value={nameFilter}
                    onChange={(e) => setNameFilter(e.target.value)}
                  />
                </div>
                <div className="col-md-3 text-end">
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
            <strong>📊 Results:</strong> Showing {filteredDoctors.length} of {allDoctors.length} doctors
            {idFilter && <span> • Filtered by ID: {idFilter}</span>}
            {specializationFilter && <span> • Filtered by Specialization: {specializationFilter}</span>}
            {nameFilter && <span> • Filtered by Name: {nameFilter}</span>}
          </div>
        </div>
      </div>

      {/* Display doctors table or "no doctors" message */}
      {filteredDoctors.length === 0 ? (
        <div className="row">
          <div className="col-12">
            <div className="alert alert-warning" role="alert">
              <h4 className="alert-heading">😔 No Doctors Found</h4>
              <p>
                {idFilter || specializationFilter || nameFilter
                  ? "No doctors match your current filters. Try adjusting your search criteria."
                  : "No doctors found in the system."}
              </p>
              {(idFilter || specializationFilter || nameFilter) && (
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
                <h5 className="mb-0">👥 Doctors Directory</h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-striped table-hover">
                    <thead className="table-dark">
                      <tr>
                        <th>Doctor ID</th>
                        <th>User ID</th>
                        <th>Name</th>
                        <th>Speciality</th>
                        <th>Phone</th>
                        <th>Email</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDoctors.map((doctor) => (
                        <tr key={doctor.doctorId}>
                          {/* Doctor ID is always read-only */}
                          <td>
                            <span className="badge bg-primary fs-6">{doctor.doctorId}</span>
                          </td>
                          <td>
                            <span className="badge bg-secondary fs-6">{doctor.userID}</span>
                          </td>

                          {/* Conditional rendering: Edit mode vs View mode */}
                          {editDoctorId === doctor.doctorId ? (
                            // EDIT MODE - Show input fields for editing
                            <>
                              {/* Editable Name field */}
                              <td>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={editForm.docName}
                                  onChange={(e) =>
                                    setEditForm({ ...editForm, docName: e.target.value })
                                  }
                                />
                              </td>
                           
                          
                              {/* Editable Speciality field */}
                              <td>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={editForm.speciality}
                                  onChange={(e) =>
                                    setEditForm({
                                      ...editForm,
                                      speciality: e.target.value,
                                    })
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
                                  onClick={() => handleSaveUpdate(doctor.doctorId)}
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
                              {/* Read-only doctor information */}
                              <td>
                                <strong className="text-primary">{doctor.docName}</strong>
                              </td>
                              <td>
                                <span className="badge bg-info fs-6">{doctor.speciality}</span>
                              </td>
                              <td>{doctor.phoneNo}</td>
                              <td>{doctor.email}</td>
                              {/* Action buttons for view mode */}
                              <td>
                                {/* Update button - blue background */}
                                <button
                                  onClick={() => handleUpdateClick(doctor)}
                                  className="btn btn-info btn-sm me-2"
                                >
                                  ✏️ Update
                                </button>
                                {/* Delete button - red background */}
                                <button
                                  onClick={() => handleDelete(doctor.doctorId)}
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

export default GetDoctor;
