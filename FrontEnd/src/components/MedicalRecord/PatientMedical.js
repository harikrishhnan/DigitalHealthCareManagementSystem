import React, { useState, useEffect } from "react";
import axios from "axios";

/**
 * PatientMedical Component
 *
 * Displays all medical records for the current patient by default.
 * Provides a client-side filter by Record ID or Doctor Name.
 *
 * Features:
 * - Fetches medical records for the patient using their patientId (from props or storage)
 * - Displays records with doctor details (name and specialization)
 * - Filters records by Record ID or Doctor Name
 * - Robust error handling with console logging for debugging
 * - Bootstrap 5 styling
 *
 * @component
 * @param {{ patientId?: number }} props
 * @returns {JSX.Element} The rendered medical records interface
 */
function PatientMedical({ patientId }) {
  // ===== STATE =====
  const [allMedicalRecords, setMedicalRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recordIdFilter, setRecordIdFilter] = useState("");

  // Resolve the patient ID from prop or storage
  const resolvePatientId = () => {
    if (patientId) return patientId;
    try {
      const raw = sessionStorage.getItem("loggedInUser") || localStorage.getItem("loggedInUser") || "{}";
      const parsed = JSON.parse(raw);
      const id = parsed.patientId || parsed.userID || null;
      if (!id) {
        console.error("No patientId or userID found in storage");
      }
      return id;
    } catch (err) {
      console.error("Error parsing loggedInUser from storage:", err);
      return null;
    }
  };

  useEffect(() => {
    const pid = resolvePatientId();
    if (pid) {
      fetchMedicalRecordsByPatient(pid);
    } else {
      setError("Patient ID not found. Please log in or provide a valid ID.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===== API =====
  const fetchMedicalRecordsByPatient = (pid) => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      setError("You must be logged in as a Patient to view this page.");
      console.error("No authentication token found");
      return;
    }
    if (!pid) {
      setError("Patient ID not found.");
      console.error("No patient ID provided for fetching records");
      return;
    }

    setLoading(true);
    setError(null);
    axios
      .get(`http://localhost:5043/api/MedicalRecord/GetByPatientId/${pid}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        // Map response to flatten Record and include Doctor details
        const records = response.data.map(item => ({
          recordId: item.record.recordId,
          patientId: item.record.patientId,
          doctorId: item.record.doctorId,
          diagnosis: item.record.diagnosis,
          treatment: item.record.treatment,
          date: item.record.date,
          doctorName: item.doctor?.docName || "Unknown",
          doctorSpecialization: item.doctor?.speciality || "N/A",
        }));
        console.log("Fetched medical records:", records); // Log successful data
        setMedicalRecords(records || []);
      })
      .catch((err) => {
        console.error("Error fetching medical records by patient:", {
          error: err.message,
          status: err.response?.status,
          data: err.response?.data,
        });
        if (err.response?.status === 404) {
          setMedicalRecords([]);
          setError("No medical records found for this patient.");
        } else if (err.response?.status === 403) {
          setError("Access denied. Patient role required.");
        } else if (err.response?.status === 401) {
          setError("Unauthorized. Please log in again.");
        } else {
          setError("Failed to load medical records. Please try again later.");
        }
      })
      .finally(() => setLoading(false));
  };

  // ===== FILTERING =====
  const filteredMedicalRecords = recordIdFilter.trim()
    ? allMedicalRecords.filter((record) =>
        record.recordId.toString().includes(recordIdFilter.trim()) ||
        record.doctorName.toLowerCase().includes(recordIdFilter.trim().toLowerCase())
      )
    : allMedicalRecords;

  // ===== STATES =====
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

  if (error) {
    return (
      <div className="text-center p-5">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">⚠️ Error</h4>
          <p>{error}</p>
          <hr />
          <button className="btn btn-outline-danger" onClick={() => setError(null)}>
            Dismiss
          </button>
        </div>
      </div>
    );
  }

  // ===== RENDER =====
  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="text-center text-primary mb-3">📋 My Medical Records</h1>
          <p className="text-center text-muted">Showing all records by default. Filter by Record ID or Doctor Name if needed.</p>
        </div>
      </div>
      {/* Record ID Filter */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow">
            <div className="card-body">
              <div className="row g-3 align-items-end">
                <div className="col-md-8">
                  <label className="form-label fw-bold">Filter by Record ID or Doctor Name</label>
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    placeholder="Type a Record ID or Doctor Name to filter"
                    value={recordIdFilter}
                    onChange={(e) => setRecordIdFilter(e.target.value)}
                  />
                </div>
                <div className="col-md-4">
                  <button
                    className="btn btn-outline-secondary btn-lg w-100"
                    onClick={() => setRecordIdFilter("")}
                  >
                    Clear Filter
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Records Table */}
      <div className="row">
        <div className="col-12">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h3 className="mb-0">📋 Medical Record Details</h3>
            </div>
            <div className="card-body">
              {filteredMedicalRecords.length === 0 ? (
                <div className="text-center py-5">
                  <div className="text-muted">
                    <h4>📭 No Medical Records Found</h4>
                    <p>Try clearing the filter to see all records.</p>
                  </div>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-striped table-hover">
                    <thead className="table-dark">
                      <tr>
                        <th>Record ID</th>
                        <th>Patient ID</th>
                        <th>Doctor ID</th>
                        <th>Doctor Name</th>
                        <th>Specialization</th>
                        <th>Diagnosis</th>
                        <th>Treatment</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMedicalRecords.map((record) => (
                        <tr key={record.recordId}>
                          <td>
                            <span className="badge bg-primary fs-6">{record.recordId}</span>
                          </td>
                          <td>
                            <span className="badge bg-secondary fs-6">{record.patientId}</span>
                          </td>
                          <td>
                            <span className="badge bg-info fs-6">{record.doctorId}</span>
                          </td>
                          <td>
                            <span className="text-muted">{record.doctorName}</span>
                          </td>
                          <td>
                            <span className="text-muted">{record.doctorSpecialization}</span>
                          </td>
                          <td>
                            <span className="text-muted">{record.diagnosis}</span>
                          </td>
                          <td>
                            <span className="text-muted">{record.treatment}</span>
                          </td>
                          <td>
                            <span className="text-muted">{new Date(record.date).toLocaleString()}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Footer */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="text-center text-muted">
            <small>💡 Tip: Start typing a Record ID or Doctor Name above to filter your records.</small>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PatientMedical;