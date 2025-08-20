import React, { useState, useEffect } from "react";
import axios from "axios";

/**
 * GetMedicalRecord Component
 * 
 * This component provides a comprehensive interface for managing medical record records.
 * It allows administrators to view, edit, delete, and search medical record information.
 * 
 * Features:
 * - Display all medical records in a table format with enhanced details
 * - Edit medical record details inline (patientId, doctorId, diagnosis, treatment, date)
 * - Delete medical record records with confirmation
 * - Advanced filtering by Record ID, Patient Name, Doctor Name, and Diagnosis
 * - Authentication and authorization checks
 * - Real-time filtering and updates
 * - Bootstrap 5 styling with improved UI
 */
function GetMedicalRecord() {
  // State management for component data and UI
  const [allMedicalRecords, setMedicalRecords] = useState([]); // All medical records data from API
  const [loading, setLoading] = useState(true); // Loading state for API calls
  const [error, setError] = useState(null); // Error message display
  const [editRecordId, setEditRecordId] = useState(null); // Currently edited record ID
  const [idFilter, setIdFilter] = useState(""); // Filter by Record ID
  const [patientNameFilter, setPatientNameFilter] = useState(""); // Filter by Patient Name
  const [doctorNameFilter, setDoctorNameFilter] = useState(""); // Filter by Doctor Name
  const [diagnosisFilter, setDiagnosisFilter] = useState(""); // Filter by Diagnosis
  
  // Form state for editing medical record details
  const [editForm, setEditForm] = useState({
    recordId: "",
    patientId: "",
    doctorId: "",
    diagnosis: "",
    treatment: "",
    date: "",
  });

  // Fetch medical records when component mounts
  useEffect(() => {
    fetchMedicalRecords();
  }, []);

  /**
   * Fetch all medical records from the backend API
   * Handles authentication, API calls, and error scenarios
   */
  const fetchMedicalRecords = () => {
    // Get authentication token from session storage
    const token = sessionStorage.getItem("token");

    // Check if user is authenticated
    if (!token) {
      setError("You must be logged in as an Admin to view this page.");
      setLoading(false);
      return;
    }

    // Make API call to fetch all medical records
    axios
      .get("http://localhost:5043/api/MedicalRecord/GetAllMedicalRecords", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        // Update medical records state with fetched data
        setMedicalRecords(response.data || []);
        setLoading(false);
        setError(null); // Clear error if data is available
      })
      .catch((error) => {
        console.error("Error fetching medical records:", error);
        
        // Handle different error scenarios with appropriate messages
        if (error.response?.status === 403) {
          setError("Access denied. Admin role required.");
        } else if (error.response?.status === 401) {
          setError("Unauthorized. Please log in again.");
        } else if (error.response?.status === 404) {
          setError("Medical records API endpoint not found. Please check the backend configuration.");
        } else if (error.response?.status === 500) {
          setError("Backend server error. Please try again later.");
        } else {
          setError("Failed to load medical records. Please try again.");
        }
        setLoading(false);
      });
  };

  /**
   * Delete a medical record by ID
   * Shows confirmation dialog before deletion
   * @param {number} recordId - The ID of the medical record to delete
   */
  const handleDelete = (recordId) => {
    // Show confirmation dialog before proceeding
    if (window.confirm("Are you sure you want to delete this medical record?")) {
      const token = sessionStorage.getItem("token");

      // Make API call to delete medical record
      axios
        .delete(`http://localhost:5043/api/MedicalRecord/DeleteMedicalRecord/${recordId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(() => {
          alert("Medical record deleted successfully.");
          // Remove the deleted medical record from local state
          setMedicalRecords((prev) => prev.filter((r) => r.recordId !== recordId));
        })
        .catch((error) => {
          console.error("Error deleting medical record:", error);
          alert("Failed to delete medical record.");
        });
    }
  };

  /**
   * Enable edit mode for a specific medical record
   * Populates the edit form with current medical record data
   * @param {Object} medicalRecord - The medical record object to edit
   */
  const handleUpdateClick = (medicalRecord) => {
    // Set the record ID being edited
    setEditRecordId(medicalRecord.recordId);
    
    // Format date for input field (YYYY-MM-DD)
    const recordDate = new Date(medicalRecord.recordDate)
      .toISOString()
      .split('T')[0];
    
    // Populate edit form with current medical record data
    setEditForm({
      recordId: medicalRecord.recordId,
      patientId: medicalRecord.patientId,
      doctorId: medicalRecord.doctorId,
      diagnosis: medicalRecord.diagnosis,
      treatment: medicalRecord.treatment,
      date: recordDate,
    });
  };

  /**
   * Save the updated medical record details
   * Sends PUT request to update medical record information
   * @param {number} recordId - The ID of the medical record being updated
   */
  const handleSaveUpdate = (recordId) => {
    const token = sessionStorage.getItem("token");

    // Make API call to update medical record
    axios
      .put(
        `http://localhost:5043/api/MedicalRecord/UpdateMedicalRecord/${recordId}`,
        editForm, // Send the entire edit form data
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        alert("Medical record updated successfully.");
        // Exit edit mode
        setEditRecordId(null);
        // Refresh the medical records list to show updated data
        fetchMedicalRecords();
      })
      .catch((error) => {
        console.error("Error updating medical record:", error);
        alert("Failed to update medical record.");
      });
  };

  /**
   * Cancel edit mode
   * Resets the edit state without saving changes
   */
  const handleCancelUpdate = () => {
    setEditRecordId(null);
  };

  /**
   * Filter medical records based on multiple criteria
   * Filters by Record ID, Patient Name, Doctor Name, and Diagnosis
   */
  const filteredMedicalRecords = allMedicalRecords.filter((medicalRecord) => {
    const idMatch = !idFilter || medicalRecord.recordId.toString().includes(idFilter);
    const patientMatch = !patientNameFilter || medicalRecord.patientName?.toLowerCase().includes(patientNameFilter.toLowerCase());
    const doctorMatch = !doctorNameFilter || medicalRecord.doctorName?.toLowerCase().includes(doctorNameFilter.toLowerCase());
    const diagnosisMatch = !diagnosisFilter || medicalRecord.diagnosis?.toLowerCase().includes(diagnosisFilter.toLowerCase());
    return idMatch && patientMatch && doctorMatch && diagnosisMatch;
  });

  /**
   * Clear all filters
   */
  const clearFilters = () => {
    setIdFilter("");
    setPatientNameFilter("");
    setDoctorNameFilter("");
    setDiagnosisFilter("");
  };

  // Show loading indicator while fetching data
  if (loading) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading medical records...</p>
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
          <button className="btn btn-outline-danger" onClick={fetchMedicalRecords}>
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
          <h1 className="text-center text-primary mb-3">📋 Medical Records Management</h1>
          <p className="text-center text-muted">Manage and maintain medical records in the system</p>
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
                <div className="col-md-2">
                  <label className="form-label fw-bold">Record ID:</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter ID"
                    value={idFilter}
                    onChange={(e) => setIdFilter(e.target.value)}
                  />
                </div>
                <div className="col-md-2">
                  <label className="form-label fw-bold">Patient Name:</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter name"
                    value={patientNameFilter}
                    onChange={(e) => setPatientNameFilter(e.target.value)}
                  />
                </div>
                <div className="col-md-2">
                  <label className="form-label fw-bold">Doctor Name:</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter name"
                    value={doctorNameFilter}
                    onChange={(e) => setDoctorNameFilter(e.target.value)}
                  />
                </div>
                <div className="col-md-2">
                  <label className="form-label fw-bold">Diagnosis:</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter diagnosis"
                    value={diagnosisFilter}
                    onChange={(e) => setDiagnosisFilter(e.target.value)}
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
            <strong>📊 Results:</strong> Showing {filteredMedicalRecords.length} of {allMedicalRecords.length} medical records
            {idFilter && <span> • ID: {idFilter}</span>}
            {patientNameFilter && <span> • Patient: {patientNameFilter}</span>}
            {doctorNameFilter && <span> • Doctor: {doctorNameFilter}</span>}
            {diagnosisFilter && <span> • Diagnosis: {diagnosisFilter}</span>}
          </div>
        </div>
      </div>

      {/* Display medical records table or "no medical records" message */}
      {filteredMedicalRecords.length === 0 ? (
        <div className="row">
          <div className="col-12">
            <div className="alert alert-warning" role="alert">
              <h4 className="alert-heading">😔 No Medical Records Found</h4>
              <p>
                {idFilter || patientNameFilter || doctorNameFilter || diagnosisFilter
                  ? "No medical records match your current filters. Try adjusting your search criteria."
                  : "No medical records found in the system."}
              </p>
              {(idFilter || patientNameFilter || doctorNameFilter || diagnosisFilter) && (
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
                <h5 className="mb-0">📋 Medical Records Directory</h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-striped table-hover">
                    <thead className="table-dark">
                      <tr>
                        <th>Record ID</th>
                        <th>Patient Details</th>
                        <th>Doctor Details</th>
                        <th>Diagnosis</th>
                        <th>Treatment</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMedicalRecords.map((medicalRecord) => (
                        <tr key={medicalRecord.recordId}>
                          {/* Record ID is always read-only */}
                          <td>
                            <span className="badge bg-primary fs-6">{medicalRecord.recordId}</span>
                          </td>

                          {/* Conditional rendering: Edit mode vs View mode */}
                          {editRecordId === medicalRecord.recordId ? (
                            // EDIT MODE - Show input fields for editing
                            <>
                              {/* Editable Patient ID field */}
                              <td>
                                <div className="mb-2">
                                  <small className="text-muted">Patient ID:</small>
                                  <input
                                    type="number"
                                    className="form-control form-control-sm"
                                    value={editForm.patientId}
                                    onChange={(e) =>
                                      setEditForm({ ...editForm, patientId: parseInt(e.target.value) })
                                    }
                                  />
                                </div>
                                <small className="text-muted">Name: {medicalRecord.patientName}</small>
                              </td>

                              {/* Editable Doctor ID field */}
                              <td>
                                <div className="mb-2">
                                  <small className="text-muted">Doctor ID:</small>
                                  <input
                                    type="number"
                                    className="form-control form-control-sm"
                                    value={editForm.doctorId}
                                    onChange={(e) =>
                                      setEditForm({ ...editForm, doctorId: parseInt(e.target.value) })
                                    }
                                  />
                                </div>
                                <small className="text-muted">Name: {medicalRecord.docName}</small>
                              </td>

                              {/* Editable Diagnosis field */}
                              <td>
                                <textarea
                                  className="form-control"
                                  value={editForm.diagnosis}
                                  onChange={(e) =>
                                    setEditForm({ ...editForm, diagnosis: e.target.value })
                                  }
                                  rows="3"
                                />
                              </td>

                              {/* Editable Treatment field */}
                              <td>
                                <textarea
                                  className="form-control"
                                  value={editForm.treatment}
                                  onChange={(e) =>
                                    setEditForm({ ...editForm, treatment: e.target.value })
                                  }
                                  rows="3"
                                />
                              </td>

                              {/* Editable Date field */}
                              <td>
                                <input
                                  type="date"
                                  className="form-control"
                                  value={editForm.date}
                                  onChange={(e) =>
                                    setEditForm({ ...editForm, date: e.target.value })
                                  }
                                />
                              </td>

                              {/* Action buttons for edit mode */}
                              <td>
                                {/* Save button - green background */}
                                <button
                                  onClick={() => handleSaveUpdate(medicalRecord.recordId)}
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
                              {/* Patient Details */}
                              <td>
                                <div>
                                  <span className="badge bg-info fs-6 mb-1">{medicalRecord.patientId}</span>
                                  <br />
                                  <strong className="text-primary">{medicalRecord.patientName}</strong>
                                </div>
                              </td>

                              {/* Doctor Details */}
                              <td>
                                <div>
                                  <span className="badge bg-warning fs-6 mb-1">{medicalRecord.doctorId}</span>
                                  <br />
                                  <strong className="text-success">{medicalRecord.docName}</strong>
                                  <br />
                                  <small className="text-muted">{medicalRecord.specialization}</small>
                                </div>
                              </td>

                              {/* Diagnosis */}
                              <td>
                                <div className="text-wrap" style={{ maxWidth: '200px' }}>
                                  {medicalRecord.diagnosis}
                                </div>
                              </td>

                              {/* Treatment */}
                              <td>
                                <div className="text-wrap" style={{ maxWidth: '200px' }}>
                                  {medicalRecord.treatment}
                                </div>
                              </td>

                              {/* Date */}
                              <td>{new Date(medicalRecord.recordDate).toLocaleDateString()}</td>

                              {/* Action buttons for view mode */}
                              <td>
                                {/* Update button - blue background */}
                                <button
                                  onClick={() => handleUpdateClick(medicalRecord)}
                                  className="btn btn-info btn-sm me-2"
                                >
                                  ✏️ Update
                                </button>
                                {/* Delete button - red background */}
                                <button
                                  onClick={() => handleDelete(medicalRecord.recordId)}
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

export default GetMedicalRecord;
