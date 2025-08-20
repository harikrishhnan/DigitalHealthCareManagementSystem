
import React, { useState, useEffect } from "react";
import axios from "axios";

/**
 * DoctorAppointments Component
 *
 * Displays and manages appointments for a doctor, with filtering and inline editing.
 *
 * Features:
 * - Fetches appointments via /api/Doctor/GetAppointmentsByDoctor
 * - Filters by status and date
 * - Edits appointment details inline (patientId, appointmentDate, status)
 * - Displays patient name beside patient ID
 * - Robust error handling with console logging
 * - Bootstrap 5 styling
 *
 * @component
 * @returns {JSX.Element} The rendered appointments interface
 */
function DoctorAppointments() {
  // ===== STATE MANAGEMENT =====
  const [allAppointments, setAppointments] = useState([]); // All fetched appointments
  const [loading, setLoading] = useState(true); // Loading flag
  const [error, setError] = useState(null); // Error message
  const [editAppointmentId, setEditAppointmentId] = useState(null); // Currently editing appointmentId
  const [statusFilter, setStatusFilter] = useState("All"); // Status filter
  const [dateFilter, setDateFilter] = useState(""); // Date filter (YYYY-MM-DD)
  const [editForm, setEditForm] = useState({
    appointmentId: "",
    doctorId: "",
    patientId: "",
    patientName: "",
    appointmentDate: "",
    status: "",
  });

  // ===== LIFECYCLE HOOKS =====
  useEffect(() => {
    fetchAppointments();
  }, []);

  // ===== API FUNCTIONS =====
  const fetchAppointments = () => {
    setLoading(true);
    setError(null);

    const token = sessionStorage.getItem("token");
    if (!token) {
      setError("You must be logged in as a Doctor to view this page. Please log in and try again.");
      console.error("No authentication token found");
      setLoading(false);
      return;
    }

    axios
      .get("http://localhost:5043/api/Doctor/GetAppointmentsByDoctor", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        const appointments = response.data
          .map(item => {
            const date = new Date(item.appointmentDate);
            if (isNaN(date)) {
              console.warn(`Invalid appointment date for AppointmentId ${item.appointmentId}: ${item.appointmentDate}`);
              return null;
            }
            if (!item.status) {
              console.warn(`Missing status for AppointmentId ${item.appointmentId}`);
            }
            return {
              appointmentId: item.appointmentId,
              doctorId: item.doctorId,
              patientId: item.patientId,
              patientName: item.patientName || "Unknown",
              appointmentDate: item.appointmentDate,
              status: item.status || "Unknown",
            };
          })
          .filter(item => item !== null);
        if (appointments.some(appt => appt.patientName === "Unknown")) {
          console.warn("Some appointments have missing patient names:", 
            appointments.filter(appt => appt.patientName === "Unknown"));
        }
        console.log("✅ Appointments fetched successfully:", appointments);
        setAppointments(appointments);
        setLoading(false);
      })
      .catch((error) => {
        console.error("❌ Error fetching appointments:", {
          error: error.message,
          status: error.response?.status,
          data: error.response?.data,
        });
        if (error.response?.status === 403) {
          setError("Access denied. Doctor role required. Please check your permissions.");
        } else if (error.response?.status === 401) {
          setError("Unauthorized. Please log in again.");
        } else if (error.response?.status === 404) {
          setError("No appointments found for this doctor.");
        } else {
          setError(`Failed to load appointments: ${error.response?.data || error.message}. Please try again or contact support.`);
        }
        setLoading(false);
      });
  };

  // ===== EVENT HANDLERS =====
  const handleUpdateClick = (appointment) => {
    const date = new Date(appointment.appointmentDate);
    if (isNaN(date)) {
      console.error("Invalid appointment date:", appointment.appointmentDate);
      alert("Cannot edit: Invalid appointment date.");
      return;
    }
    setEditAppointmentId(appointment.appointmentId);
    const appointmentDate = date.toISOString().slice(0, 16);
    setEditForm({
      appointmentId: appointment.appointmentId,
      doctorId: appointment.doctorId,
      patientId: appointment.patientId,
      patientName: appointment.patientName,
      appointmentDate: appointmentDate,
      status: appointment.status,
    });
  };

  // Unchanged as per request
  const handleSaveUpdate = (appointmentId) => {
    const token = sessionStorage.getItem("token");
    console.log("Payload for update:", editForm);
    axios
      .put(
        `http://localhost:5043/api/Appointment/UpdateAppointment/${appointmentId}`,
        editForm,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        console.log("Appointment updated successfully");
        alert("Appointment updated successfully.");
        setEditAppointmentId(null);
        fetchAppointments();
      })
      .catch((error) => {
        console.error("Error updating appointment:", error);
        alert("Failed to update appointment.");
      });
  };

  const handleCancelUpdate = () => {
    setEditAppointmentId(null);
  };

  // ===== FILTERS =====
  const filteredAppointments = allAppointments.filter((appt) => {
    let matches = true;
    if (statusFilter !== "All") matches = matches && appt.status === statusFilter;
    if (dateFilter) {
      const date = new Date(appt.appointmentDate);
      if (isNaN(date)) return false;
      const apptDate = date.toISOString().slice(0, 10);
      matches = matches && apptDate === dateFilter;
    }
    return matches;
  });

  const todayAppointment = allAppointments.filter((apt) => {
    const date = new Date(apt.appointmentDate);
    if (isNaN(date)) return false;
    const today = new Date().toISOString().split("T")[0];
    const aptDate = date.toISOString().split("T")[0];
    return aptDate === today;
  });

  // ===== LOADING & ERROR UI =====
  if (loading) return (
    <div className="text-center p-5">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="mt-3">Loading appointments...</p>
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
          <button className="btn btn-outline-primary" onClick={fetchAppointments}>
            Retry
          </button>
        </div>
      </div>
    </div>
  );

  // ===== RENDER =====
  return (
    <div className="container-fluid py-4">
      {/* ===== PAGE HEADER ===== */}
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="text-center text-primary mb-3">📅 My Appointments</h1>
          <p className="text-center text-muted">Filter by status or date to view specific appointments.</p>
        </div>
      </div>

      {/* ===== APPOINTMENT SUMMARY ===== */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h3 className="card-title text-center mb-4">📊 Appointment Summary</h3>
          <div className="row text-center">
            <div className="col-md-4 col-sm-6 mb-3">
              <h5 className="text-primary">Today's Appointments</h5>
              <p className="fs-2 fw-bold text-primary">{todayAppointment.filter(apt => apt.status === "Scheduled").length}</p>
            </div>
            <div className="col-md-4 col-sm-6 mb-3">
              <h5 className="text-success">Completed</h5>
              <p className="fs-2 fw-bold text-success">
                {todayAppointment.filter(apt => apt.status === "Completed").length}
              </p>
            </div>
            <div className="col-md-4 col-sm-6 mb-3">
              <h5 className="text-danger">Cancelled</h5>
              <p className="fs-2 fw-bold text-danger">
                {todayAppointment.filter(apt => apt.status === "Cancelled").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ===== FILTER SECTION ===== */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-4">
              <label className="form-label fw-bold">Status</label>
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label fw-bold">Date</label>
              <input
                type="date"
                className="form-control"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={() => {
                  setStatusFilter("All");
                  setDateFilter("");
                }}
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ===== APPOINTMENTS TABLE ===== */}
      {filteredAppointments.length === 0 ? (
        <div className="alert alert-info text-center">No appointments found.</div>
      ) : (
        <div className="card shadow-sm">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-striped table-hover table-bordered">
                <thead className="table-dark text-center">
                  <tr>
                    <th>Appointment ID</th>
                    <th>Patient ID</th>
                    <th>Patient Name</th>
                    <th>Appointment Date</th>
                    <th>Status</th>
                    <th style={{ width: "150px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody className="align-middle text-center">
                  {filteredAppointments.map((appointment) => (
                    <tr key={appointment.appointmentId}>
                      {editAppointmentId === appointment.appointmentId ? (
                        <>
                          <td>{appointment.appointmentId}</td>
                          <td>
                            <input
                              type="number"
                              className="form-control"
                              value={editForm.patientId}
                              onChange={(e) =>
                                setEditForm({ ...editForm, patientId: parseInt(e.target.value) })
                              }
                            />
                          </td>
                          <td>{editForm.patientName || "Unknown"}</td>
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
                          <td>
                            <select
                              className="form-select"
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
                          <td>
                            <button
                              className="btn btn-success btn-sm me-2"
                              onClick={() => handleSaveUpdate(appointment.appointmentId)}
                            >
                              Save
                            </button>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={handleCancelUpdate}
                            >
                              Cancel
                            </button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td>{appointment.appointmentId}</td>
                          <td>{appointment.patientId}</td>
                          <td>{appointment.patientName || "Unknown"}</td>
                          <td>
                            {new Date(appointment.appointmentDate).toLocaleString() || "Invalid Date"}
                          </td>
                          <td>
                            <span
                              className={
                                appointment.status === "Completed"
                                  ? "badge bg-success"
                                  : appointment.status === "Scheduled"
                                  ? "badge bg-info"
                                  : appointment.status === "Cancelled"
                                  ? "badge bg-danger"
                                  : "badge bg-secondary"
                              }
                            >
                              {appointment.status}
                            </span>
                          </td>
                          <td>
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleUpdateClick(appointment)}
                            >
                              Update
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
      )}

      {/* ===== FOOTER TIP ===== */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="text-center text-muted">
            <small>💡 Tip: Use the filters above to narrow down appointments by status or date.</small>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DoctorAppointments;