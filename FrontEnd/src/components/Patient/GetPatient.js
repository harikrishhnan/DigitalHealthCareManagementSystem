import React, { useState, useEffect } from "react";
import axios from "axios";

/**
 * GetPatient Component
 * 
 * This component provides a comprehensive interface for managing patient records.
 * It allows administrators to view, edit, delete, and search patient information.
 * 
 * Features:
 * - Display all patients in a table format with enhanced details
 * - Edit patient details inline (userID, patientName, phoneNo, email)
 * - Delete patient records with confirmation
 * - Advanced filtering by Patient ID or Name
 * - Authentication and authorization checks
 * - Real-time filtering and updates
 * - Bootstrap 5 styling with improved UI
 */
function GetPatient() {
  // State management for component data and UI
  const [allPatients, setPatients] = useState([]); // All patients data from API
  const [loading, setLoading] = useState(true); // Loading state for API calls
  const [error, setError] = useState(null); // Error message display
  const [editPatientId, setEditPatientId] = useState(null); // Currently edited patient ID
  const [idFilter, setIdFilter] = useState(""); // Filter by Patient ID
  const [nameFilter, setNameFilter] = useState(""); // Filter by Patient Name
  
  // Form state for editing patient details
  const [editForm, setEditForm] = useState({
    patientId: "",
    userID: "",
    patientName: "",
    phoneNo: "",
    email: "",
  });

  // Fetch patients when component mounts
  useEffect(() => {
    fetchPatients();
  }, []);

  /**
   * Fetch all patients from the backend API
   * Handles authentication, API calls, and error scenarios
   */
  const fetchPatients = () => {
    // Get authentication token from session storage
    const token = sessionStorage.getItem("token");

    // Check if user is authenticated
    if (!token) {
      setError("You must be logged in as an Admin to view this page.");
      setLoading(false);
      return;
    }

    // Make API call to fetch all patients
    axios
      .get("http://localhost:5043/api/Patient/GetAllPatient", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        // Update patients state with fetched data
        setPatients(response.data || []);
        setLoading(false);
        setError(null); // Clear error if data is available
      })
      .catch((error) => {
        console.error("Error fetching patients:", error);
        
        // Handle different error scenarios with appropriate messages
        if (error.response?.status === 403) {
          setError("Access denied. Admin role required.");
        } else if (error.response?.status === 401) {
          setError("Unauthorized. Please log in again.");
        } else if (error.response?.status === 404) {
          setError("Patient API endpoint not found. Please check the backend configuration.");
        } else if (error.response?.status === 500) {
          setError("Backend server error. Please try again later.");
        } else {
          setError("Failed to load patients. Please try again.");
        }
        setLoading(false);
      });
  };

  /**
   * Delete a patient by ID
   * Shows confirmation dialog before deletion
   * @param {number} patientId - The ID of the patient to delete
   */
  const handleDelete = (patientId) => {
    // Show confirmation dialog before proceeding
    if (window.confirm("Are you sure you want to delete this patient?")) {
      const token = sessionStorage.getItem("token");

      // Make API call to delete patient
      axios
        .delete(`http://localhost:5043/api/Patient/DeletePatient/${patientId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(() => {
          alert("Patient deleted successfully.");
          // Remove the deleted patient from local state
          setPatients((prev) => prev.filter((p) => p.patientId !== patientId));
        })
        .catch((error) => {
          console.error("Error deleting patient:", error);
          alert("Failed to delete patient.");
        });
    }
  };

  /**
   * Enable edit mode for a specific patient
   * Populates the edit form with current patient data
   * @param {Object} patient - The patient object to edit
   */
  const handleUpdateClick = (patient) => {
    // Set the patient ID being edited
    setEditPatientId(patient.patientId);
    
    // Populate edit form with current patient data
    setEditForm({
      patientId: patient.patientId,
      userID: patient.userID,
      patientName: patient.patientName,
      phoneNo: patient.phoneNo,
      email: patient.email,
    });
  };

  /**
   * Save the updated patient details
   * Sends PUT request to update patient information
   * @param {number} patientId - The ID of the patient being updated
   */
  const handleSaveUpdate = (patientId) => {
    const token = sessionStorage.getItem("token");

    // Make API call to update patient
    axios
      .put(
        `http://localhost:5043/api/Patient/UpdatePatientByID/${patientId}`,
        editForm, // Send the entire edit form data
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        alert("Patient updated successfully.");
        // Exit edit mode
        setEditPatientId(null);
        // Refresh the patients list to show updated data
        fetchPatients();
      })
      .catch((error) => {
        console.error("Error updating patient:", error);
        alert("Failed to update patient.");
      });
  };

  /**
   * Cancel edit mode
   * Resets the edit state without saving changes
   */
  const handleCancelUpdate = () => {
    setEditPatientId(null);
  };

  /**
   * Filter patients based on multiple criteria
   * Filters by Patient ID and Name
   */
  const filteredPatients = allPatients.filter((patient) => {
    const idMatch = !idFilter || patient.patientId.toString().includes(idFilter);
    const nameMatch = !nameFilter || patient.patientName?.toLowerCase().includes(nameFilter.toLowerCase());
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
        <p className="mt-3">Loading patients...</p>
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
          <button className="btn btn-outline-danger" onClick={fetchPatients}>
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
          <h1 className="text-center text-primary mb-3">👥 Patients Management</h1>
          <p className="text-center text-muted">Manage and maintain patient records in the system</p>
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
                  <label className="form-label fw-bold">Patient ID:</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter ID"
                    value={idFilter}
                    onChange={(e) => setIdFilter(e.target.value)}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-bold">Patient Name:</label>
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
            <strong>📊 Results:</strong> Showing {filteredPatients.length} of {allPatients.length} patients
            {idFilter && <span> • ID: {idFilter}</span>}
            {nameFilter && <span> • Name: {nameFilter}</span>}
          </div>
        </div>
      </div>

      {/* Display patients table or "no patients" message */}
      {filteredPatients.length === 0 ? (
        <div className="row">
          <div className="col-12">
            <div className="alert alert-warning" role="alert">
              <h4 className="alert-heading">😔 No Patients Found</h4>
              <p>
                {idFilter || nameFilter
                  ? "No patients match your current filters. Try adjusting your search criteria."
                  : "No patients found in the system."}
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
                <h5 className="mb-0">👥 Patients Directory</h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-striped table-hover">
                    <thead className="table-dark">
                      <tr>
                        <th>Patient ID</th>
                        <th>User ID</th>
                        <th>Patient Name</th>
                        <th>Phone</th>
                        <th>Email</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPatients.map((patient) => (
                        <tr key={patient.patientId}>
                          {/* Patient ID is always read-only */}
                          <td>
                            <span className="badge bg-primary fs-6">{patient.patientId}</span>
                          </td>

                          {/* Conditional rendering: Edit mode vs View mode */}
                          {editPatientId === patient.patientId ? (
                            // EDIT MODE - Show input fields for editing
                            <>
                              {/* User ID is read-only */}
                              <td>
                                <span className="badge bg-secondary fs-6">{patient.userID}</span>
                              </td>
                              
                              {/* Editable Patient Name field */}
                              <td>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={editForm.patientName}
                                  onChange={(e) =>
                                    setEditForm({ ...editForm, patientName: e.target.value })
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
                                  onClick={() => handleSaveUpdate(patient.patientId)}
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
                              {/* Read-only patient information */}
                              <td>
                                <span className="badge bg-secondary fs-6">{patient.userID}</span>
                              </td>
                              <td>
                                <strong className="text-primary">{patient.patientName}</strong>
                              </td>
                              <td>{patient.phoneNo}</td>
                              <td>
                                <span className="text-info">{patient.email}</span>
                              </td>
                              {/* Action buttons for view mode */}
                              <td>
                                {/* Update button - blue background */}
                                <button
                                  onClick={() => handleUpdateClick(patient)}
                                  className="btn btn-info btn-sm me-2"
                                >
                                  ✏️ Update
                                </button>
                                {/* Delete button - red background */}
                                <button
                                  onClick={() => handleDelete(patient.patientId)}
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

export default GetPatient;
