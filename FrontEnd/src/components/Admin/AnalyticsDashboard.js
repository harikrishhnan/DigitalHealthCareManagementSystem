import React, { useState, useEffect } from "react";
import axios from "axios";

/**
 * AnalyticsDashboard Component
 * 
 * This component provides comprehensive analytics and insights for the healthcare system.
 * It displays detailed statistics for patients and doctors including:
 * - Appointment statistics (completed, cancelled, scheduled, no-show)
 * - Medical records count
 * - Time-based filtering (week, month, quarter, year)
 * - Individual patient and doctor performance metrics
 * 
 * Features:
 * - Real-time data fetching from multiple API endpoints
 * - Time period filtering (week, month, quarter, year)
 * - Detailed breakdowns by status and category
 * - Responsive charts and statistics
 * - Export functionality for reports
 */
function AnalyticsDashboard() {
  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeFilter, setTimeFilter] = useState("month"); // week, month, quarter, year
  const [selectedEntity, setSelectedEntity] = useState("overview"); // overview, patient, doctor
  const [selectedId, setSelectedId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Data states
  const [appointments, setAppointments] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  
  // Statistics states
  const [overallStats, setOverallStats] = useState({
    totalAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    scheduledAppointments: 0,
    noShowAppointments: 0,
    totalMedicalRecords: 0,
    totalDoctors: 0,
    totalPatients: 0
  });
  
  const [entityStats, setEntityStats] = useState({
    appointments: [],
    medicalRecords: [],
    performance: {}
  });

  // Fetch data when component mounts or time filter changes
  useEffect(() => {
    fetchAllData();
  }, [timeFilter]);

  // Fetch entity-specific data when selection changes
  useEffect(() => {
    if (selectedEntity !== "overview" && selectedId) {
      fetchEntityData();
    }
  }, [selectedEntity, selectedId, timeFilter]);

  /**
   * Fetch all data for the dashboard
   */
  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        setError("You must be logged in to view this dashboard.");
        setLoading(false);
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };
      
      // Fetch all data in parallel
      const [appointmentsRes, medicalRecordsRes, doctorsRes, patientsRes] = await Promise.all([
        axios.get("http://localhost:5043/api/Appointment/GetAppointments", { headers }),
        axios.get("http://localhost:5043/api/MedicalRecord/GetAllMedicalRecords", { headers }),
        axios.get("http://localhost:5043/api/Doctor/GetAllDoctor", { headers }),
        axios.get("http://localhost:5043/api/Patient/GetAllPatient", { headers })
      ]);

      const appointmentsData = appointmentsRes.data || [];
      const medicalRecordsData = medicalRecordsRes.data || [];
      const doctorsData = doctorsRes.data || [];
      const patientsData = patientsRes.data || [];

      // Filter data based on time period
      const filteredAppointments = filterDataByTime(appointmentsData, 'appointmentDate');
      const filteredMedicalRecords = filterDataByTime(medicalRecordsData, 'recordDate');

      setAppointments(filteredAppointments);
      setMedicalRecords(filteredMedicalRecords);
      setDoctors(doctorsData);
      setPatients(patientsData);

      // Calculate overall statistics
      calculateOverallStats(filteredAppointments, filteredMedicalRecords, doctorsData, patientsData);
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Failed to load dashboard data. Please try again.");
      setLoading(false);
    }
  };

  /**
   * Fetch data for a specific entity (patient or doctor)
   */
  const fetchEntityData = async () => {
    if (!selectedId) return;
    
    try {
      const token = sessionStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      
      // Filter appointments and medical records for the selected entity
      const entityAppointments = appointments.filter(apt => 
        selectedEntity === "patient" ? apt.patientId.toString() === selectedId : apt.doctorId.toString() === selectedId
      );
      
      const entityMedicalRecords = medicalRecords.filter(record => 
        selectedEntity === "patient" ? record.patientId.toString() === selectedId : record.doctorId.toString() === selectedId
      );

      // Calculate entity-specific statistics
      const entityStats = calculateEntityStats(entityAppointments, entityMedicalRecords);
      setEntityStats(entityStats);
      
    } catch (error) {
      console.error("Error fetching entity data:", error);
    }
  };

  /**
   * Filter data based on selected time period
   */
  const filterDataByTime = (data, dateField) => {
    const now = new Date();
    let startDate = new Date();
    
    switch (timeFilter) {
      case "week":
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "quarter":
        startDate.setMonth(now.getMonth() - 3);
        break;
      case "year":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1);
    }
    
    return data.filter(item => {
      const itemDate = new Date(item[dateField]);
      return itemDate >= startDate && itemDate <= now;
    });
  };

  /**
   * Calculate overall statistics
   */
  const calculateOverallStats = (appointments, medicalRecords, doctors, patients) => {
    const stats = {
      totalAppointments: appointments.length,
      completedAppointments: appointments.filter(apt => apt.status === "Completed").length,
      cancelledAppointments: appointments.filter(apt => apt.status === "Cancelled").length,
      scheduledAppointments: appointments.filter(apt => apt.status === "Scheduled").length,
      noShowAppointments: appointments.filter(apt => apt.status === "No-Show").length,
      totalMedicalRecords: medicalRecords.length,
      totalDoctors: doctors.length,
      totalPatients: patients.length
    };
    
    setOverallStats(stats);
  };

  /**
   * Calculate entity-specific statistics
   */
  const calculateEntityStats = (appointments, medicalRecords) => {
    const appointmentStats = {
      total: appointments.length,
      completed: appointments.filter(apt => apt.status === "Completed").length,
      cancelled: appointments.filter(apt => apt.status === "Cancelled").length,
      scheduled: appointments.filter(apt => apt.status === "Scheduled").length,
      noShow: appointments.filter(apt => apt.status === "No-Show").length
    };

    const medicalRecordStats = {
      total: medicalRecords.length,
      recent: medicalRecords.filter(record => {
        const recordDate = new Date(record.recordDate);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return recordDate >= weekAgo;
      }).length
    };

    const performance = {
      completionRate: appointmentStats.total > 0 ? (appointmentStats.completed / appointmentStats.total * 100).toFixed(1) : 0,
      cancellationRate: appointmentStats.total > 0 ? (appointmentStats.cancelled / appointmentStats.total * 100).toFixed(1) : 0,
      noShowRate: appointmentStats.total > 0 ? (appointmentStats.noShow / appointmentStats.total * 100).toFixed(1) : 0
    };

    return {
      appointments: appointmentStats,
      medicalRecords: medicalRecordStats,
      performance
    };
  };

  /**
   * Handle entity selection
   */
  const handleEntitySelect = (entity, id) => {
    setSelectedEntity(entity);
    setSelectedId(id);
    setSearchTerm("");
  };

  /**
   * Reset to overview
   */
  const resetToOverview = () => {
    setSelectedEntity("overview");
    setSelectedId("");
    setSearchTerm("");
  };

  /**
   * Export data to CSV
   */
  const exportToCSV = () => {
    const data = selectedEntity === "overview" ? appointments : entityStats.appointments;
    if (!data || data.length === 0) return;

    const headers = Object.keys(data[0]).join(',');
    const csvContent = [headers, ...data.map(row => Object.values(row).join(','))].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedEntity}_${timeFilter}_data.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Show loading indicator
  if (loading) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading analytics dashboard...</p>
      </div>
    );
  }

  // Show error message
  if (error) {
    return (
      <div className="text-center p-5">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">⚠️ Error</h4>
          <p>{error}</p>
          <hr />
          <button className="btn btn-outline-danger" onClick={fetchAllData}>
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="text-primary mb-2">📊 Analytics Dashboard</h1>
              <p className="text-muted mb-0">Comprehensive insights and statistics for the healthcare system</p>
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-outline-primary" onClick={exportToCSV}>
                📥 Export Data
              </button>
              {selectedEntity !== "overview" && (
                <button className="btn btn-outline-secondary" onClick={resetToOverview}>
                  🔙 Back to Overview
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Time Filter */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center gap-3">
                <label className="form-label fw-bold mb-0">Time Period:</label>
                <div className="btn-group" role="group">
                  {[
                    { value: "week", label: "📅 Week", color: "outline-primary" },
                    { value: "month", label: "📅 Month", color: "primary" },
                    { value: "quarter", label: "📅 Quarter", color: "outline-primary" },
                    { value: "year", label: "📅 Year", color: "outline-primary" }
                  ].map(period => (
                    <button
                      key={period.value}
                      type="button"
                      className={`btn btn-${timeFilter === period.value ? period.color.replace('outline-', '') : period.color}`}
                      onClick={() => setTimeFilter(period.value)}
                    >
                      {period.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overview Statistics */}
      {selectedEntity === "overview" && (
        <div className="row g-4 mb-5">
          <div className="col-md-3">
            <div className="card bg-primary text-white text-center shadow h-100">
              <div className="card-body">
                <h3 className="display-6 mb-2">📅</h3>
                <h5 className="card-title">Total Appointments</h5>
                <p className="display-6 fw-bold mb-0">{overallStats.totalAppointments}</p>
                <small>Last {timeFilter}</small>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-success text-white text-center shadow h-100">
              <div className="card-body">
                <h3 className="display-6 mb-2">✅</h3>
                <h5 className="card-title">Completed</h5>
                <p className="display-6 fw-bold mb-0">{overallStats.completedAppointments}</p>
                <small>{overallStats.totalAppointments > 0 ? ((overallStats.completedAppointments / overallStats.totalAppointments) * 100).toFixed(1) : 0}%</small>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-warning text-white text-center shadow h-100">
              <div className="card-body">
                <h3 className="display-6 mb-2">📋</h3>
                <h5 className="card-title">Medical Records</h5>
                <p className="display-6 fw-bold mb-0">{overallStats.totalMedicalRecords}</p>
                <small>Last {timeFilter}</small>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-info text-white text-center shadow h-100">
              <div className="card-body">
                <h3 className="display-6 mb-2">👥</h3>
                <h5 className="card-title">Active Users</h5>
                <p className="display-6 fw-bold mb-0">{overallStats.totalDoctors + overallStats.totalPatients}</p>
                <small>{overallStats.totalDoctors} Doctors, {overallStats.totalPatients} Patients</small>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Entity Selection */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow">
            <div className="card-header bg-secondary text-white">
              <h5 className="mb-0">🔍 Entity Analysis</h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label fw-bold">Entity Type:</label>
                  <select
                    className="form-control"
                    value={selectedEntity}
                    onChange={(e) => {
                      setSelectedEntity(e.target.value);
                      setSelectedId("");
                    }}
                  >
                    <option value="overview">📊 System Overview</option>
                    <option value="patient">👥 Patient Analysis</option>
                    <option value="doctor">👨‍⚕️ Doctor Analysis</option>
                  </select>
                </div>
                {selectedEntity !== "overview" && (
                  <>
                    <div className="col-md-4">
                      <label className="form-label fw-bold">Search {selectedEntity === "patient" ? "Patient" : "Doctor"}:</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder={`Search by ${selectedEntity === "patient" ? "patient" : "doctor"} name or ID`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-bold">Select {selectedEntity === "patient" ? "Patient" : "Doctor"}:</label>
                      <select
                        className="form-control"
                        value={selectedId}
                        onChange={(e) => setSelectedId(e.target.value)}
                      >
                        <option value="">Choose...</option>
                        {(selectedEntity === "patient" ? patients : doctors)
                          .filter(item => 
                            searchTerm === "" || 
                            item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item[selectedEntity === "patient" ? "patientId" : "doctorId"]?.toString().includes(searchTerm)
                          )
                          .map(item => (
                            <option key={item[selectedEntity === "patient" ? "patientId" : "doctorId"]} 
                                    value={item[selectedEntity === "patient" ? "patientId" : "doctorId"]}>
                              {item.name} (ID: {item[selectedEntity === "patient" ? "patientId" : "doctorId"]})
                            </option>
                          ))
                        }
                      </select>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Entity Statistics */}
      {selectedEntity !== "overview" && selectedId && (
        <div className="row g-4 mb-5">
          <div className="col-md-3">
            <div className="card bg-primary text-white text-center shadow h-100">
              <div className="card-body">
                <h3 className="display-6 mb-2">📅</h3>
                <h5 className="card-title">Total Appointments</h5>
                <p className="display-6 fw-bold mb-0">{entityStats.appointments.total}</p>
                <small>Last {timeFilter}</small>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-success text-white text-center shadow h-100">
              <div className="card-body">
                <h3 className="display-6 mb-2">✅</h3>
                <h5 className="card-title">Completed</h5>
                <p className="display-6 fw-bold mb-0">{entityStats.appointments.completed}</p>
                <small>{entityStats.performance.completionRate}%</small>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-danger text-white text-center shadow h-100">
              <div className="card-body">
                <h3 className="display-6 mb-2">❌</h3>
                <h5 className="card-title">Cancelled</h5>
                <p className="display-6 fw-bold mb-0">{entityStats.appointments.cancelled}</p>
                <small>{entityStats.performance.cancellationRate}%</small>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-warning text-white text-center shadow h-100">
              <div className="card-body">
                <h3 className="display-6 mb-2">📋</h3>
                <h5 className="card-title">Medical Records</h5>
                <p className="display-6 fw-bold mb-0">{entityStats.medicalRecords.total}</p>
                <small>{entityStats.medicalRecords.recent} recent</small>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Statistics Table */}
      <div className="row">
        <div className="col-12">
          <div className="card shadow">
            <div className="card-header bg-success text-white">
              <h5 className="mb-0">
                📊 {selectedEntity === "overview" ? "System" : selectedEntity === "patient" ? "Patient" : "Doctor"} Statistics - Last {timeFilter}
              </h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead className="table-dark">
                    <tr>
                      <th>Metric</th>
                      <th>Count</th>
                      <th>Percentage</th>
                      <th>Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedEntity === "overview" ? (
                      <>
                        <tr>
                          <td>Total Appointments</td>
                          <td><span className="badge bg-primary fs-6">{overallStats.totalAppointments}</span></td>
                          <td>100%</td>
                          <td>📈</td>
                        </tr>
                        <tr>
                          <td>Completed Appointments</td>
                          <td><span className="badge bg-success fs-6">{overallStats.completedAppointments}</span></td>
                          <td>{overallStats.totalAppointments > 0 ? ((overallStats.completedAppointments / overallStats.totalAppointments) * 100).toFixed(1) : 0}%</td>
                          <td>✅</td>
                        </tr>
                        <tr>
                          <td>Cancelled Appointments</td>
                          <td><span className="badge bg-danger fs-6">{overallStats.cancelledAppointments}</span></td>
                          <td>{overallStats.totalAppointments > 0 ? ((overallStats.cancelledAppointments / overallStats.totalAppointments) * 100).toFixed(1) : 0}%</td>
                          <td>❌</td>
                        </tr>
                        <tr>
                          <td>Scheduled Appointments</td>
                          <td><span className="badge bg-info fs-6">{overallStats.scheduledAppointments}</span></td>
                          <td>{overallStats.totalAppointments > 0 ? ((overallStats.scheduledAppointments / overallStats.totalAppointments) * 100).toFixed(1) : 0}%</td>
                          <td>📅</td>
                        </tr>
                        <tr>
                          <td>No-Show Appointments</td>
                          <td><span className="badge bg-warning fs-6">{overallStats.noShowAppointments}</span></td>
                          <td>{overallStats.totalAppointments > 0 ? ((overallStats.noShowAppointments / overallStats.totalAppointments) * 100).toFixed(1) : 0}%</td>
                          <td>⚠️</td>
                        </tr>
                        <tr>
                          <td>Medical Records Created</td>
                          <td><span className="badge bg-secondary fs-6">{overallStats.totalMedicalRecords}</span></td>
                          <td>-</td>
                          <td>📋</td>
                        </tr>
                      </>
                    ) : (
                      <>
                        <tr>
                          <td>Total Appointments</td>
                          <td><span className="badge bg-primary fs-6">{entityStats.appointments.total}</span></td>
                          <td>100%</td>
                          <td>📈</td>
                        </tr>
                        <tr>
                          <td>Completed Appointments</td>
                          <td><span className="badge bg-success fs-6">{entityStats.appointments.completed}</span></td>
                          <td>{entityStats.performance.completionRate}%</td>
                          <td>✅</td>
                        </tr>
                        <tr>
                          <td>Cancelled Appointments</td>
                          <td><span className="badge bg-danger fs-6">{entityStats.appointments.cancelled}</span></td>
                          <td>{entityStats.performance.cancellationRate}%</td>
                          <td>❌</td>
                        </tr>
                        <tr>
                          <td>Scheduled Appointments</td>
                          <td><span className="badge bg-info fs-6">{entityStats.appointments.scheduled}</span></td>
                          <td>{entityStats.appointments.total > 0 ? ((entityStats.appointments.scheduled / entityStats.appointments.total) * 100).toFixed(1) : 0}%</td>
                          <td>📅</td>
                        </tr>
                        <tr>
                          <td>No-Show Appointments</td>
                          <td><span className="badge bg-warning fs-6">{entityStats.appointments.noShow}</span></td>
                          <td>{entityStats.performance.noShowRate}%</td>
                          <td>⚠️</td>
                        </tr>
                        <tr>
                          <td>Medical Records</td>
                          <td><span className="badge bg-secondary fs-6">{entityStats.medicalRecords.total}</span></td>
                          <td>-</td>
                          <td>📋</td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      {selectedEntity !== "overview" && selectedId && (
        <div className="row mt-4">
          <div className="col-12">
            <div className="card shadow">
              <div className="card-header bg-info text-white">
                <h5 className="mb-0">💡 Performance Insights</h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-4">
                    <div className="text-center p-3 border rounded">
                      <h6 className="text-primary">Completion Rate</h6>
                      <h3 className="text-success">{entityStats.performance.completionRate}%</h3>
                      <small className="text-muted">Appointments completed successfully</small>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="text-center p-3 border rounded">
                      <h6 className="text-primary">Cancellation Rate</h6>
                      <h3 className="text-danger">{entityStats.performance.cancellationRate}%</h3>
                      <small className="text-muted">Appointments cancelled</small>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="text-center p-3 border rounded">
                      <h6 className="text-primary">No-Show Rate</h6>
                      <h3 className="text-warning">{entityStats.performance.noShowRate}%</h3>
                      <small className="text-muted">Appointments with no-show</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AnalyticsDashboard;
