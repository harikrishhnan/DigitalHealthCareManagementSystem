import React, { useState, useEffect } from "react";
import axios from "axios";

/**
 * PatientAppointment Component
 *
 * Displays a read-only table of appointments for a patient with filtering options.
 * Features:
 * - Fetches appointments from API with authentication
 * - Filters by status and date
 * - No edit or add functionality
 */
function PatientAppointment({ patientId }) {
  // ===== STATE =====
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPatientId, setCurrentPatientId] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState(""); // YYYY-MM-DD

  // ===== EFFECTS =====
  useEffect(() => {
    setCurrentPatientId(patientId);
    if (patientId) {
      fetchAppointments(patientId);
    } else {
      setError("Patient ID not provided.");
      setLoading(false);
    }
  }, [patientId]);

  // ===== API =====
  const fetchAppointments = (pid) => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      setError("You must be logged in as a Patient to view this page.");
      setLoading(false);
      return;
    }
    if (!pid) {
      setError("Patient ID not provided.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    axios
      .get(`http://localhost:5043/api/Patient/GetAppointmentsByPatient/${pid}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setAppointments(res.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("You have no appointments:", err);
        if (err.response?.status === 403) setError("Access denied. Patient role required.");
        else if (err.response?.status === 401) setError("Unauthorized. Please log in again.");
        else setError("Failed to load appointments.");
        setLoading(false);
      });
  };

  // ===== FILTERED VIEW =====
  const filteredAppointments = appointments.filter((appt) => {
    let matches = true;
    if (statusFilter !== "All") {
      matches = matches && appt.status === statusFilter;
    }
    if (dateFilter) {
      const apptDate = new Date(appt.appointmentDate).toISOString().slice(0, 10);
      matches = matches && apptDate === dateFilter;
    }
    return matches;
  });

  // ===== UI STATES =====
  if (loading) return <p>Loading appointments...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  // ===== RENDER =====
  return (
    <div className="container py-4">
      <h2 className="mb-4 text-primary text-center">📅 My Appointments</h2>

      {/* Filters */}
      <div className="card p-3 mb-4">
        <div className="row g-3 align-items-end">
          <div className="col-md-4">
            <label className="form-label fw-bold">Status</label>
            <select
              className="form-control"
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
            <button className="btn btn-outline-secondary w-100" onClick={() => { setStatusFilter("All"); setDateFilter(""); }}>
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Appointment List */}
      <table className="table table-striped table-bordered">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Doctor</th>
            <th>Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {filteredAppointments.length === 0 ? (
            <tr>
              <td colSpan="4" className="text-center">No appointments found</td>
            </tr>
          ) : (
            filteredAppointments.map((appt) => (
              <tr key={appt.appointmentId}>
                <td>{appt.appointmentId}</td>
                <td>{appt.doctorId}</td>
                <td>{new Date(appt.appointmentDate).toLocaleString()}</td>
                <td>
                  <span
                    className={
                      appt.status === "Completed" ? "bg-success text-white p-1 rounded" :
                      appt.status === "Scheduled" ? "bg-info text-white p-1 rounded" :
                      appt.status === "Cancelled" ? "bg-danger text-white p-1 rounded" :
                      ""
                    }
                  >
                    {appt.status}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default PatientAppointment;