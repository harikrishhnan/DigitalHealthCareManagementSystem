import React, { useState, useEffect } from "react";
import axios from "axios";

/**
 * GetAppointment Component
 * 
 * This component provides a comprehensive interface for managing appointment records.
 * It allows administrators to view, edit, delete, and search appointment information.
 * 
 * Features:
 * - Display all appointments in a table format with enhanced details
 * - Edit appointment details inline (doctorId, patientId, appointmentDate, status)
 * - Delete appointment records with confirmation
 * - Advanced filtering by Appointment ID, Status, Date, Patient Name, and Doctor Name
 * - Authentication and authorization checks
 * - Real-time filtering and updates
 * - Bootstrap 5 styling with improved UI
 */
function GetAppointment() {
  // State management for component data and UI
  const [allAppointments, setAppointments] = useState([]); // All appointments data from API
  const [loading, setLoading] = useState(true); // Loading state for API calls
  const [error, setError] = useState(null); // Error message display
  const [editAppointmentId, setEditAppointmentId] = useState(null); // Currently edited appointment ID
  const [idFilter, setIdFilter] = useState(""); // Filter by Appointment ID
  const [statusFilter, setStatusFilter] = useState(""); // Filter by Status
  const [dateFilter, setDateFilter] = useState(""); // Filter by Date
  const [patientNameFilter, setPatientNameFilter] = useState(""); // Filter by Patient Name
  const [doctorNameFilter, setDoctorNameFilter] = useState(""); // Filter by Doctor Name
  
  // Form state for editing appointment details
  const [editForm, setEditForm] = useState({
    appointmentId: "",
    doctorId: "",
    patientId: "",
    appointmentDate: "",
    status: "",
  });

  // Fetch appointments when component mounts
  useEffect(() => {
    fetchAppointments();
  }, []);

  /**
   * Fetch all appointments from the backend API
   * Handles authentication, API calls, and error scenarios
   */
  const fetchAppointments = () => {
    // Get authentication token from session storage
    const token = sessionStorage.getItem("token");

    // Check if user is authenticated
    if (!token) {
      setError("You must be logged in as an Admin to view this page.");
      setLoading(false);
      return;
    }

    // Make API call to fetch all appointments
    axios
      .get("http://localhost:5043/api/Appointment/GetAppointments", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        // Update appointments state with fetched data
        setAppointments(response.data || []);
        setLoading(false);
        setError(null); // Clear error if data is available
      })
      .catch((error) => {
        console.error("Error fetching appointments:", error);
        
        // Handle different error scenarios with appropriate messages
        if (error.response?.status === 403) {
          setError("Access denied. Admin role required.");
        } else if (error.response?.status === 401) {
          setError("Unauthorized. Please log in again.");
        } else if (error.response?.status === 404) {
          setError("Appointments API endpoint not found. Please check the backend configuration.");
        } else if (error.response?.status === 500) {
          setError("Backend server error. Please try again later.");
        } else {
          setError("Failed to load appointments. Please try again.");
        }
        setLoading(false);
      });
  };

  /**
   * Delete an appointment by ID
   * Shows confirmation dialog before deletion
   * @param {number} appointmentId - The ID of the appointment to delete
   */
  const handleDelete = (appointmentId) => {
    // Show confirmation dialog before proceeding
    if (window.confirm("Are you sure you want to delete this appointment?")) {
      const token = sessionStorage.getItem("token");

      // Make API call to delete appointment
      axios
        .delete(`http://localhost:5043/api/Appointment/DeleteAppointment/${appointmentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(() => {
          alert("Appointment deleted successfully.");
          // Remove the deleted appointment from local state
          setAppointments((prev) => prev.filter((a) => a.appointmentId !== appointmentId));
        })
        .catch((error) => {
          console.error("Error deleting appointment:", error);
          alert("Failed to delete appointment.");
        });
    }
  };

  /**
   * Enable edit mode for a specific appointment
   * Populates the edit form with current appointment data
   * @param {Object} appointment - The appointment object to edit
   */
  const handleUpdateClick = (appointment) => {
    // Set the appointment ID being edited
    setEditAppointmentId(appointment.appointmentId);
    
    // Format date for input field (YYYY-MM-DDTHH:MM)
    const appointmentDate = new Date(appointment.appointmentDate)
      .toISOString()
      .slice(0, 16);
    
    // Populate edit form with current appointment data
    setEditForm({
      appointmentId: appointment.appointmentId,
      doctorId: appointment.doctorId,
      patientId: appointment.patientId,
      appointmentDate: appointmentDate,
      status: appointment.status,
    });
  };

  /**
   * Save the updated appointment details
   * Sends PUT request to update appointment information
   * @param {number} appointmentId - The ID of the appointment being updated
   */
  const handleSaveUpdate = (appointmentId) => {
    const token = sessionStorage.getItem("token");

    // Make API call to update appointment
    axios
      .put(
        `http://localhost:5043/api/Appointment/UpdateAppointment/${appointmentId}`,
        editForm, // Send the entire edit form data
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        alert("Appointment updated successfully.");
        // Exit edit mode
        setEditAppointmentId(null);
        // Refresh the appointments list to show updated data
        fetchAppointments();
      })
      .catch((error) => {
        console.error("Error updating appointment:", error);
        alert("Failed to update appointment.");
      });
  };

  /**
   * Cancel edit mode
   * Resets the edit state without saving changes
   */
  const handleCancelUpdate = () => {
    setEditAppointmentId(null);
  };

  /**
   * Filter appointments based on multiple criteria
   * Filters by Appointment ID, Status, Date, Patient Name, and Doctor Name
   */
  const filteredAppointments = allAppointments.filter((appointment) => {
    const idMatch = !idFilter || appointment.appointmentId.toString().includes(idFilter);
    const statusMatch = !statusFilter || appointment.status === statusFilter;
    const dateMatch = !dateFilter || new Date(appointment.appointmentDate).toISOString().split('T')[0] === dateFilter;
    const patientMatch = !patientNameFilter || appointment.patientName?.toLowerCase().includes(patientNameFilter.toLowerCase());
    const doctorMatch = !doctorNameFilter || appointment.doctorName?.toLowerCase().includes(doctorNameFilter.toLowerCase());
    return idMatch && statusMatch && dateMatch && patientMatch && doctorMatch;
  });

  /**
   * Clear all filters
   */
  const clearFilters = () => {
    setIdFilter("");
    setStatusFilter("");
    setDateFilter("");
    setPatientNameFilter("");
    setDoctorNameFilter("");
  };

  // Show loading indicator while fetching data
  if (loading) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading appointments...</p>
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
          <button className="btn btn-outline-danger" onClick={fetchAppointments}>
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
          <h1 className="text-center text-primary mb-3">📅 Appointments Management</h1>
          <p className="text-center text-muted">Manage and maintain appointment records in the system</p>
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
                  <label className="form-label fw-bold">Appointment ID:</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter ID"
                    value={idFilter}
                    onChange={(e) => setIdFilter(e.target.value)}
                  />
                </div>
                <div className="col-md-2">
                  <label className="form-label fw-bold">Status:</label>
                  <select
                    className="form-control"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="">All Statuses</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                   
                  </select>
                </div>
                <div className="col-md-2">
                  <label className="form-label fw-bold">Date:</label>
                  <input
                    type="date"
                    className="form-control"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
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
                <div className="col-md-2 text-end">
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
            <strong>📊 Results:</strong> Showing {filteredAppointments.length} of {allAppointments.length} appointments
            {idFilter && <span> • ID: {idFilter}</span>}
            {statusFilter && <span> • Status: {statusFilter}</span>}
            {dateFilter && <span> • Date: {dateFilter}</span>}
            {patientNameFilter && <span> • Patient: {patientNameFilter}</span>}
            {doctorNameFilter && <span> • Doctor: {doctorNameFilter}</span>}
          </div>
        </div>
      </div>

      {/* Display appointments table or "no appointments" message */}
      {filteredAppointments.length === 0 ? (
        <div className="row">
          <div className="col-12">
            <div className="alert alert-warning" role="alert">
              <h4 className="alert-heading"> No Appointments Found</h4>
              <p>
                {idFilter || statusFilter || dateFilter || patientNameFilter || doctorNameFilter
                  ? "No appointments match your current filters. Try adjusting your search criteria."
                  : "No appointments found in the system."}
              </p>
              {(idFilter || statusFilter || dateFilter || patientNameFilter || doctorNameFilter) && (
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
                <h5 className="mb-0">📅 Appointments Directory</h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-striped table-hover">
                    <thead className="table-dark">
                      <tr>
                        <th>Appointment ID</th>
                        <th>Patient Details</th>
                        <th>Doctor Details</th>
                        <th>Appointment Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAppointments.map((appointment) => (
                        <tr key={appointment.appointmentId}>
                          {/* Appointment ID is always read-only */}
                          <td>
                            <span className="badge bg-primary fs-6">{appointment.appointmentId}</span>
                          </td>

                          {/* Conditional rendering: Edit mode vs View mode */}
                          {editAppointmentId === appointment.appointmentId ? (
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
                                <small className="text-muted">Name: {appointment.patientName}</small>
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
                                <small className="text-muted">Name: {appointment.doctorName}</small>
                              </td>

                              {/* Editable Appointment Date field */}
                              <td>
                                <input
                                  type="datetime-local"
                                  className="form-control"
                                  value={editForm.appointmentDate}
                                  onChange={(e) =>
                                    setEditForm({ ...editForm, appointmentDate: e.target.value })
                                  }
                                />
                              </td>

                              {/* Editable Status field with dropdown */}
                              <td>
                                <select
                                  className="form-control"
                                  value={editForm.status}
                                  onChange={(e) =>
                                    setEditForm({ ...editForm, status: e.target.value })
                                  }
                                >
                                  <option value="Scheduled">Scheduled</option>
                                  <option value="Completed">Completed</option>
                                  <option value="Cancelled">Cancelled</option>
                                 
                                </select>
                              </td>

                              {/* Action buttons for edit mode */}
                              <td>
                                {/* Save button - green background */}
                                <button
                                  onClick={() => handleSaveUpdate(appointment.appointmentId)}
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
                                  <span className="badge bg-info fs-6 mb-1">{appointment.patientId}</span>
                                  <br />
                                  <strong className="text-primary">{appointment.patientName}</strong>
                                </div>
                              </td>

                              {/* Doctor Details */}
                              <td>
                                <div>
                                  <span className="badge bg-warning fs-6 mb-1">{appointment.doctorId}</span>
                                  <br />
                                  <strong className="text-success">{appointment.doctorName}</strong>
                                  <br />
                                  <small className="text-muted">{appointment.specialization}</small>
                                </div>
                              </td>

                              {/* Appointment Date */}
                              <td>{new Date(appointment.appointmentDate).toLocaleString()}</td>

                              {/* Status */}
                              <td>
                                <span
                                  className={
                                    appointment.status === "Completed" ? "badge bg-success fs-6" :
                                    appointment.status === "Scheduled" ? "badge bg-info fs-6" :
                                    appointment.status === "Cancelled" ? "badge bg-danger fs-6" :
                                    "badge bg-secondary fs-6"
                                  }
                                >
                                  {appointment.status}
                                </span>
                              </td>

                              {/* Action buttons for view mode */}
                              <td>
                                {/* Update button - blue background */}
                                <button
                                  onClick={() => handleUpdateClick(appointment)}
                                  className="btn btn-info btn-sm me-2"
                                >
                                  ✏️ Update
                                </button>
                                {/* Delete button - red background */}
                                <button
                                  onClick={() => handleDelete(appointment.appointmentId)}
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

export default GetAppointment;
