import React, { useState, useEffect } from "react";
import axios from "axios";

/**
 * DoctorSearch Component
 *
 * Displays a table of doctors with filtering by ID and specialization.
 * Allows booking appointments via a modal form triggered by a button in each row.
 * Features:
 * - Fetches all doctors from API with authentication
 * - Filters by Doctor ID and Specialization
 * - Modal form for booking appointments
 * - Improved error handling and debugging
 */
function DoctorSearch() {
  // =============================
  // State and Patient ID Handling
  // =============================
  const [allDoctors, setDoctors] = useState([]); // All doctors from API
  const [loading, setLoading] = useState(true); // Loading state for API calls
  const [error, setError] = useState(null); // Error message display
  const [idFilter, setIdFilter] = useState(""); // Filter by Doctor ID
  const [specializationFilter, setSpecializationFilter] = useState(""); // Filter by Specialization
  const [specializations, setSpecializations] = useState([]); // Available specializations
  const [showModal, setShowModal] = useState(false); // Modal visibility
  const [selectedDoctor, setSelectedDoctor] = useState(null); // Selected doctor for appointment
  const [form, setForm] = useState({
    appointmentId: 0,
    doctorId: "",
    patientId: sessionStorage.getItem("PatientID"),
    appointmentDate: new Date().toISOString().slice(0, 16), // Local date-time
    status: "Scheduled",
  }); // Form state for appointment
  const [formLoading, setFormLoading] = useState(false); // Loading state for form submission
  const [formError, setFormError] = useState(null); // Error state for form submission

  // =============================
  // Effects: Fetch doctors and extract specializations
  // =============================
  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (allDoctors.length > 0) {
      const uniqueSpecs = [...new Set(allDoctors.map((doctor) => doctor.speciality))]
        .filter(Boolean)
        .sort();
      setSpecializations(uniqueSpecs);
      setError(null); // Clear error if data is available
    } else if (allDoctors.length === 0 && !loading) {
      setError("No doctors available. The server returned an empty list.");
    }
  }, [allDoctors, loading]);

  // =============================
  // API: Fetch all doctors from backend
  // =============================
  const fetchDoctors = () => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      setError("You must be logged in to view this page.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    axios
      .get("http://localhost:5043/api/Doctor/GetAllDoctor", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        console.log("API Response:", response.data);
        setDoctors(response.data || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching doctors:", error);
        let errorMessage = "Failed to load doctors. Please try again.";
        if (error.code === "ERR_NETWORK") {
          errorMessage = "Backend server is not running. Please start the backend service.";
        } else if (error.response?.status === 404) {
          errorMessage = "Doctors API endpoint not found. Please check the backend configuration.";
        } else if (error.response?.status === 500) {
          errorMessage = "Backend server error. Please try again later.";
        } else if (error.response?.status === 403) {
          errorMessage = "Access denied. Please check your permissions.";
        } else if (error.response?.status === 401) {
          errorMessage = "Unauthorized. Please log in again.";
        }
        setError(errorMessage);
        setLoading(false);
      });
  };

  // =============================
  // Appointment Modal Logic
  // =============================
  const handleAppointmentBooking = (doctor) => {
    setSelectedDoctor(doctor);
    setForm({
      appointmentId: 0,
      doctorId: doctor.doctorId.toString(),
      patientId: sessionStorage.getItem("PatientID"),
      appointmentDate: new Date().toISOString().slice(0, 16), // Local date-time
      status: "Scheduled",
    });
    setShowModal(true);
    setFormError(null);
  };

  const addAppointment = (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem("token");
    if (!token) {
      setFormError("You must be logged in to book an appointment.");
      return;
    }

    if (!form.appointmentDate) {
      setFormError("Please select a date and time.");
      return;
    }
    if (isNaN(form.doctorId) || parseInt(form.doctorId) <= 0) {
      setFormError("Invalid Doctor ID.");
      return;
    }

    setFormLoading(true);
    setFormError(null);

    const payload = {
      appointmentId: 0,
      doctorId: parseInt(form.doctorId),
      patientId: parseInt(form.patientId),
      appointmentDate: form.appointmentDate, // Use raw local date-time
      status: form.status,
    };

    console.log("Payload sent:", payload); // Debug payload

    axios
      .post("http://localhost:5043/api/Appointment/CreateAppointment", payload, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        console.log("Appointment created:", res.data);
        setForm({
          appointmentId: 0,
          doctorId: "",
          patientId: sessionStorage.getItem("PatientID"),
          appointmentDate: new Date().toISOString().slice(0, 16),
          status: "Scheduled",
        });
        setShowModal(false);
        setFormLoading(false);
        alert("Appointment booked successfully!");
      })
      .catch((err) => {
        console.error("Error booking appointment:", err.response ? err.response.data : err.message);
        setFormError(
          err.response
            ? `Error: ${err.response.data.message || err.response.statusText}`
            : "Network error, please try again."
        );
        setFormLoading(false);
      });
  };

  const handleAppointmentCancel = () => {
    setForm({
      appointmentId: 0,
      doctorId: "",
      patientId: sessionStorage.getItem("PatientID"),
      appointmentDate: new Date().toISOString().slice(0, 16),
      status: "Scheduled",
    });
    setShowModal(false);
    setFormError(null);
  };

  // =============================
  // UI Rendering Logic
  // =============================
  const filteredDoctors = allDoctors.filter((doctor) => {
    const idMatch = !idFilter || doctor.doctorId.toString().includes(idFilter);
    const specMatch = !specializationFilter || doctor.speciality === specializationFilter;
    return idMatch && specMatch;
  });

  const clearFilters = () => {
    setIdFilter("");
    setSpecializationFilter("");
  };

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
          <h1 className="text-center text-primary mb-3">👨‍⚕️ Doctor Search & Directory</h1>
          <p className="text-center text-muted">Search and filter through all available doctors</p>
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
                  <label className="form-label fw-bold">Filter by Doctor ID:</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter Doctor ID"
                    value={idFilter}
                    onChange={(e) => setIdFilter(e.target.value)}
                  />
                </div>
                <div className="col-md-4">
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
            <strong>📊 Results:</strong> Showing {filteredDoctors.length} of {allDoctors.length} doctors
            {idFilter && <span> • Filtered by ID: {idFilter}</span>}
            {specializationFilter && <span> • Filtered by Specialization: {specializationFilter}</span>}
          </div>
        </div>
      </div>

      {/* Doctors Table or No Results */}
      {filteredDoctors.length === 0 ? (
        <div className="row">
          <div className="col-12">
            <div className="alert alert-warning" role="alert">
              <h4 className="alert-heading">😔 No Doctors Found</h4>
              <p>
                {idFilter || specializationFilter
                  ? "No doctors match your current filters. Try adjusting your search criteria."
                  : "No doctors found in the system."}
              </p>
              {(idFilter || specializationFilter) && (
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
                          <td>
                            <span className="badge bg-primary fs-6">{doctor.doctorId}</span>
                          </td>
                          <td>
                            <span className="badge bg-secondary fs-6">{doctor.userId || doctor.userID}</span>
                          </td>
                          <td>
                            <strong className="text-primary">{doctor.docName}</strong>
                          </td>
                          <td>
                            <span className="badge bg-info fs-6">{doctor.speciality}</span>
                          </td>
                          <td>{doctor.phoneNo}</td>
                          <td>{doctor.email}</td>
                          <td>
                            <button
                              onClick={() => handleAppointmentBooking(doctor)}
                              className="btn btn-info text-white"
                              disabled={formLoading}
                            >
                              Book Appointment
                            </button>
                          </td>
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

      {/* Appointment Booking Modal */}
      {showModal && (
        <div className="modal show fade d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <div className="w-100">
                  <h5 className="modal-title mb-2">Book Appointment with</h5>
                  <div className="d-flex justify-content-between align-items-center">
                    <h4 className="mb-0">{selectedDoctor?.docName}</h4>
                    <span className="badge bg-secondary">{selectedDoctor?.speciality}</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleAppointmentCancel}
                  disabled={formLoading}
                />
              </div>
              <div className="modal-body">
                {formError && <p className="text-danger mb-3">{formError}</p>}
                <form onSubmit={addAppointment}>
                  <div className="mb-3">
                    <label className="form-label">Date & Time</label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      value={form.appointmentDate}
                      onChange={(e) => setForm({ ...form, appointmentDate: e.target.value })}
                      required
                      disabled={formLoading}
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn btn-success"
                    disabled={formLoading}
                  >
                    {formLoading ? "Submitting..." : "Confirm Appointment"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary ms-2"
                    onClick={handleAppointmentCancel}
                    disabled={formLoading}
                  >
                    Cancel
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DoctorSearch;