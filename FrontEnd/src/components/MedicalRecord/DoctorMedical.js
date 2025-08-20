import React, { useState, useEffect } from "react";
import axios from "axios";

/**
 * DoctorMedical Component
 * 
 * This component provides an interface for doctors to manage medical records.
 * It allows doctors to fetch records by Patient ID, create new records, and update existing ones
 * using a responsive Bootstrap-based UI.
 * 
 * Features:
 * - Fetch medical records by Patient ID with associated doctor details
 * - Create new medical records (doctorId prefilled from props)
 * - Edit existing medical records inline (only diagnosis and treatment editable)
 * - Search within loaded records by Record ID, Patient ID, Diagnosis, or Doctor Name
 * - Authentication and authorization checks
 * - Bootstrap 5 styling
 * 
 * @component
 * @param {{ doctorId?: number }} props
 * @returns {JSX.Element} The rendered medical records management interface
 */
function DoctorMedical({ doctorId }) {
  // ===== STATE MANAGEMENT =====
  
  /**
   * Array of medical records with doctor details for the current patient query
   */
  const [allMedicalRecords, setMedicalRecords] = useState([]);
  
  /**
   * Loading indicator used around manual fetch operations
   */
  const [loading, setLoading] = useState(false);
  
  /**
   * Error message string for displaying API failures or validation errors
   */
  const [error, setError] = useState(null);
  
  /**
   * Record id currently in edit mode
   */
  const [editRecordId, setEditRecordId] = useState(null);
  
  /**
   * Search term for filtering already-loaded medical records
   */
  const [searchTerm, setSearchTerm] = useState("");
  
  /**
   * Controls visibility of the create-record modal
   */
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  /**
   * Form state for editing an existing record
   */
  const [editForm, setEditForm] = useState({
    recordId: "",
    patientId: "",
    doctorId: "",
    diagnosis: "",
    treatment: "",
    date: "",
  });

  /**
   * Form state for creating new medical records
   */
  const [createForm, setCreateForm] = useState({
    patientId: "",
    doctorId: doctorId || "",
    diagnosis: "",
    treatment: "",
    date: new Date().toISOString().slice(0, 16),
  });

  /**
   * The patientId to query records for
   */
  const [patientIdQuery, setPatientIdQuery] = useState("");

  // Keep createForm.doctorId synced with prop
  useEffect(() => {
    setCreateForm(prev => ({ ...prev, doctorId: doctorId || "" }));
  }, [doctorId]);

  // ===== API FUNCTIONS =====
  
  /**
   * Fetches medical records for a given patientId.
   * API: GET /api/MedicalRecord/GetByPatientId/{patientId}
   */
  const fetchMedicalRecordsByPatient = (patientId) => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      setError("You must be logged in as a Doctor to view this page.");
      return;
    }
    if (!patientId) {
      alert("Please enter a Patient ID.");
      return;
    }

    setLoading(true);
    setError(null);
    axios
      .get(`http://localhost:5043/api/MedicalRecord/GetByPatientId/${patientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        // Map response to flatten Record and include Doctor Name
        const records = response.data.map(item => ({
          ...item.record,
          doctorName: item.doctor?.docName || "Unknown",
          doctorSpecialization: item.doctor?.speciality || "N/A",
        }));
        setMedicalRecords(records || []);
      })
      .catch((err) => {
        console.error("Error fetching medical records by patient:", err);
        if (err.response?.status === 404) {
          setMedicalRecords([]);
          setError("No medical records found for this Patient ID.");
        } else if (err.response?.status === 403) {
          setError("Access denied. Doctor role required.");
        } else if (err.response?.status === 401) {
          setError("Unauthorized. Please log in again.");
        } else {
          setError("Failed to load medical records. Please try again later.");
        }
      })
      .finally(() => setLoading(false));
  };

  // ===== EVENT HANDLERS =====
  
  /**
   * Enter edit mode for a record and prefill the form
   */
  const handleUpdateClick = (record) => {
    setEditRecordId(record.recordId);
    const recordDate = new Date(record.date).toISOString().slice(0, 16);
    setEditForm({
      recordId: record.recordId,
      patientId: record.patientId,
      doctorId: record.doctorId,
      diagnosis: record.diagnosis,
      treatment: record.treatment,
      date: recordDate,
    });
  };

  /**
   * Save an updated record
   * API: PUT /api/MedicalRecord/UpdateMedicalRecord/{recordId}
   */
  const handleSaveUpdate = (recordId) => {
    const token = sessionStorage.getItem("token");
    if (!editForm.patientId || !editForm.doctorId || !editForm.diagnosis || !editForm.treatment || !editForm.date) {
      alert("Please fill in all required fields.");
      return;
    }

    const updatePayload = {
      recordId: editForm.recordId,
      patientId: parseInt(editForm.patientId),
      doctorId: parseInt(editForm.doctorId),
      diagnosis: editForm.diagnosis,
      treatment: editForm.treatment,
      date: editForm.date,
    };

    axios
      .put(
        `http://localhost:5043/api/MedicalRecord/UpdateMedicalRecord/${recordId}`,
        updatePayload,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        alert("Medical record updated successfully!");
        setEditRecordId(null);
        if (patientIdQuery) fetchMedicalRecordsByPatient(patientIdQuery);
      })
      .catch((error) => {
        console.error("Error updating medical record:", error);
        if (error.response?.data?.message) {
          alert(`Failed to update medical record: ${error.response.data.message}`);
        } else {
          alert(`Failed to update medical record. Status: ${error.response?.status || 'Unknown'}`);
        }
      });
  };

  /**
   * Create a new medical record
   * API: POST /api/MedicalRecord/CreateMedicalRecord
   */
  const handleCreateRecord = () => {
    const token = sessionStorage.getItem("token");
    if (!createForm.patientId || !createForm.doctorId || !createForm.diagnosis || !createForm.treatment || !createForm.date) {
      alert("Please fill in all required fields.");
      return;
    }

    const createPayload = {
      recordId: 0,
      patientId: parseInt(createForm.patientId),
      doctorId: parseInt(createForm.doctorId),
      diagnosis: createForm.diagnosis,
      treatment: createForm.treatment,
      date: createForm.date,
    };

    axios
      .post(
        "http://localhost:5043/api/MedicalRecord/CreateMedicalRecord",
        createPayload,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        alert("Medical record created successfully!");
        setShowCreateModal(false);
        setCreateForm({
          patientId: "",
          doctorId: doctorId || "",
          diagnosis: "",
          treatment: "",
          date: new Date().toISOString().slice(0, 16),
        });
        if (patientIdQuery) fetchMedicalRecordsByPatient(patientIdQuery);
      })
      .catch((error) => {
        console.error("Error creating medical record:", error);
        if (error.response?.data?.message) {
          alert(`Failed to create medical record: ${error.response.data.message}`);
        } else {
          alert(`Failed to create medical record. Status: ${error.response?.status || 'Unknown'}`);
        }
      });
  };

  /** Cancel edit mode */
  const handleCancelUpdate = () => setEditRecordId(null);

  /** Cancel create and reset form */
  const handleCancelCreate = () => {
    setShowCreateModal(false);
    setCreateForm({
      patientId: "",
      doctorId: doctorId || "",
      diagnosis: "",
      treatment: "",
      date: new Date().toISOString().slice(0, 16),
    });
  };

  // ===== FILTERING =====
  const filteredMedicalRecords = allMedicalRecords.filter((record) => {
    const search = searchTerm.toLowerCase();
    return (
 
      record.patientId.toString().includes(search) ||
      record.doctorName.toLowerCase().includes(search)
    );
  });

  // ===== LOADING / ERROR STATES =====
  if (loading) return (
    <div className="text-center p-5">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="mt-3">Loading medical records...</p>
    </div>
  );

  if (error) return (
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

  // ===== MAIN RENDER =====
  return (
    <div className="container-fluid p-4">
      {/* ===== PAGE HEADER ===== */}
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="text-center text-primary mb-3">📋 Medical Records</h1>
          <p className="text-center text-muted">Fetch and manage records by Patient ID</p>
        </div>
      </div>

      {/* ===== PATIENT SEARCH SECTION ===== */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow">
            <div className="card-body">
              <div className="row g-3 align-items-end">
                <div className="col-md-4">
                  <label className="form-label fw-bold">Patient ID</label>
                  <input
                    type="number"
                    className="form-control form-control-lg"
                    placeholder="Enter Patient ID"
                    value={patientIdQuery}
                    onChange={(e) => setPatientIdQuery(e.target.value)}
                  />
                </div>
                <div className="col-md-3">
                  <button
                    onClick={() => fetchMedicalRecordsByPatient(patientIdQuery)}
                    className="btn btn-primary btn-lg w-100"
                  >
                    🔍 Load Records
                  </button>
                </div>
                <div className="col-md-5 text-end">
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="btn btn-success btn-lg"
                  >
                    ➕ Create New Record
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== MEDICAL RECORDS TABLE SECTION ===== */}
      <div className="row">
        <div className="col-12">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h3 className="mb-0">📋 Medical Records List</h3>
            </div>
            <div className="card-body">
              {filteredMedicalRecords.length === 0 ? (
                <div className="text-center py-5">
                  <div className="text-muted">
                    <h4>📭 No Medical Records Found</h4>
                    <p>Load records by entering a Patient ID above.</p>
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
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMedicalRecords.map((record) => (
                        <tr key={record.recordId}>
                          <td>
                            <span className="badge bg-primary fs-6">{record.recordId}</span>
                          </td>
                          {editRecordId === record.recordId ? (
                            <>
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
                                <input
                                  type="text"
                                  className="form-control"
                                  value={editForm.diagnosis}
                                  onChange={(e) => setEditForm({ ...editForm, diagnosis: e.target.value })}
                                  placeholder="Diagnosis"
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={editForm.treatment}
                                  onChange={(e) => setEditForm({ ...editForm, treatment: e.target.value })}
                                  placeholder="Treatment"
                                />
                              </td>
                              <td>
                                <span className="text-muted">{new Date(record.date).toLocaleString()}</span>
                              </td>
                              <td>
                                <div className="d-flex gap-2">
                                  <button onClick={() => handleSaveUpdate(record.recordId)} className="btn btn-success btn-sm">💾 Save</button>
                                  <button onClick={handleCancelUpdate} className="btn btn-secondary btn-sm">❌ Cancel</button>
                                </div>
                              </td>
                            </>
                          ) : (
                            <>
                              <td><span className="badge bg-secondary fs-6">{record.patientId}</span></td>
                              <td><span className="badge bg-info fs-6">{record.doctorId}</span></td>
                              <td><span className="text-muted">{record.doctorName}</span></td>
                              <td><span className="text-muted">{record.doctorSpecialization}</span></td>
                              <td><span className="text-muted">{record.diagnosis}</span></td>
                              <td><span className="text-muted">{record.treatment}</span></td>
                              <td><span className="text-muted">{new Date(record.date).toLocaleString()}</span></td>
                              <td>
                                <button onClick={() => handleUpdateClick(record)} className="btn btn-primary btn-sm">✏️ Update</button>
                              </td>
                            </>
                          )}
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

      {/* ===== CREATE NEW MEDICAL RECORD MODAL ===== */}
      {showCreateModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content shadow">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title">➕ Create New Medical Record</h5>
                <button type="button" className="btn-close btn-close-white" onClick={handleCancelCreate}></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Patient ID:</label>
                    <input
                      type="number"
                      className="form-control"
                      value={createForm.patientId}
                      onChange={(e) => setCreateForm({ ...createForm, patientId: e.target.value })}
                      placeholder="Enter Patient ID"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Doctor ID:</label>
                    <input
                      type="number"
                      className="form-control"
                      value={createForm.doctorId}
                      readOnly
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-bold">Diagnosis:</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={createForm.diagnosis}
                      onChange={(e) => setCreateForm({ ...createForm, diagnosis: e.target.value })}
                      placeholder="Enter patient diagnosis"
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-bold">Treatment:</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={createForm.treatment}
                      onChange={(e) => setCreateForm({ ...createForm, treatment: e.target.value })}
                      placeholder="Enter treatment plan"
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-bold">Date & Time:</label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      value={createForm.date}
                      onChange={(e) => setCreateForm({ ...createForm, date: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button onClick={handleCancelCreate} className="btn btn-secondary">❌ Cancel</button>
                <button onClick={handleCreateRecord} className="btn btn-success">💾 Create Record</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== FOOTER INFO ===== */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="text-center text-muted">
            <small>💡 Tip: Enter a Patient ID above and click "Load Records" to view medical history.</small>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DoctorMedical;