import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import PatientAppointment from "../Appointment/PatientAppointment";
import PatientMedical from "../MedicalRecord/PatientMedical";
//import DoctorSearch from "../Doctor/DoctorSearch";
import DoctorSearch from "../Doctor/DoctorSearchcopy";


/**
 * PatientDashboard Component
 * 
 * This is the main dashboard component for patients in the healthcare system.
 * It provides a comprehensive interface for patients to manage their healthcare,
 * view appointments, access medical records, and update their profile information.
 * 
 * Features:
 * - Dashboard overview with statistics
 * - Appointment management (integrated with PatientAppointment component)
 * - Medical records management (integrated with PatientMedical component)
 * - Doctor search functionality (integrated with DoctorSearch component)
 * - Profile management with edit capabilities
 * - Responsive Bootstrap-based UI
 * - Authentication and authorization checks
 * 
 * @component
 * @returns {JSX.Element} The rendered patient dashboard
 */
function PatientDashboard() {
  const navigate = useNavigate();

  // ===== STATE MANAGEMENT =====
  
  /**
   * State for storing patient's profile information fetched from API
   * Contains: patientId, userID, patientName, phoneNo, email
   */
  const [patientProfile, setPatientProfile] = useState({});
  
  /**
   * Boolean flag to control profile editing mode
   * When true, shows edit form; when false, shows view mode
   */
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  /**
   * Loading state indicator for API calls
   * Shows loading message while fetching data
   */
  const [loading, setLoading] = useState(true);
  
  /**
   * Error state for storing and displaying error messages
   * Used for API failures, authentication issues, etc.
   */
  const [error, setError] = useState(null);
  
  /**
   * Currently active navigation tab
   * Controls which content section is displayed
   */
  const [activeTab, setActiveTab] = useState("dashboard");
  
  /**
   * Boolean flag to control profile modal visibility
   * When true, shows the profile modal overlay
   */
  const [showProfile, setShowProfile] = useState(false);
  
  /**
   * Array of today's appointments for the patient
   * Used for dashboard statistics and today's schedule display
   */
  const [todaysAppointments, setTodaysAppointments] = useState([]);
  
  /**
   * Array of future appointments for the patient
   * Used for dashboard statistics
   */
  const [futureAppointments, setFutureAppointments] = useState([]);
  
  /**
   * Form state for profile editing
   * Stores temporary values while editing profile information
   */
  const [profileForm, setProfileForm] = useState({
    patientName: "",
    phoneNo: "",
    email: "",
  });

  // ===== LIFECYCLE HOOKS =====
  
  /**
   * useEffect hook that runs when component mounts
   * Fetches initial data: patient profile
   */
  useEffect(() => {
    fetchPatientProfile();
  }, []);

  // Fetch statistics after profile is loaded
  useEffect(() => {
    if (patientProfile?.patientId) {
      fetchStatistics();
    }
  }, [patientProfile]);

  // ===== API FUNCTIONS =====
  
  /**
   * Fetches the patient's profile information from the backend API
   * Handles authentication, makes API call, and updates state accordingly
   * 
   * API Endpoint: GET /api/Patient/GetPatientProfile
   * Authentication: JWT token from sessionStorage
   */
  const fetchPatientProfile = () => {
    const token = sessionStorage.getItem("token");
    
    if (!token) {
      setError("You must be logged in as a Patient to view this page.");
      setLoading(false);
      return;
    }

    console.log("Fetching patient profile...");
    axios
      .get("http://localhost:5043/api/Patient/GetPatientProfile", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        console.log("Patient profile fetched successfully:", response.data);
        setPatientProfile(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching patient profile:", error);
        if (error.response?.status === 403) {
          setError("Access denied. Patient role required.");
        } else if (error.response?.status === 401) {
          setError("Unauthorized. Please log in again.");
        } else {
          setError("Failed to load patient profile. Error: " + (error.message || "Unknown"));
        }
        setLoading(false);
      });
      
  };
sessionStorage.setItem("PatientID", patientProfile?.patientId);
  /**
   * Fetches appointment statistics for the dashboard
   * Gets all appointments and filters for today's date
   * 
   * API Endpoint: GET /api/Patient/GetAppointmentsByPatient/{patientId}
   * Authentication: JWT token from sessionStorage
   */

  const fetchStatistics = () => {
    const token = sessionStorage.getItem("token");
    if (!token || !patientProfile?.patientId) {
      console.log("Token or patientId missing, skipping fetchStatistics");
      return;
    }
    
    console.log(`Fetching appointments for patientId: ${patientProfile.patientId} at ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
    axios
      .get(`http://localhost:5043/api/Patient/GetAppointmentsByPatient/${patientProfile.patientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        console.log("Appointments response:", response.data);
        const appointments = Array.isArray(response.data) ? response.data : [];
        if (appointments.length === 0) {
          console.log("No appointments returned from API");
        }
        const futureAppointments = appointments.filter(apt => apt.status === "Scheduled");
        const today = new Date().toISOString().split('T')[0]; // "2025-08-14" for today
        console.log("Today's date for filtering:", today);
        const todaysAppointments = appointments.filter(appointment => {
          const appointmentDate = new Date(appointment.appointmentDate).toISOString().split('T')[0];
          console.log(`Checking appointment ${appointment.appointmentId}: ${appointmentDate} vs ${today}`);
          return appointmentDate === today;
        });
        
        console.log("Today's appointments:", todaysAppointments);
        console.log("Future appointments:", futureAppointments);
        setTodaysAppointments(todaysAppointments);
        setFutureAppointments(futureAppointments);
      })
      .catch((error) => {
        console.error("Error fetching appointments:", error);
        console.log("Error response:", error.response?.data);
        if (error.response?.status === 404) {
          console.log("Endpoint not found or no appointments for this patient");
        } else if (error.response?.status === 401 || error.response?.status === 403) {
          console.log("Authentication/Authorization issue");
        } else {
          console.log("Unknown error, status:", error.response?.status);
        }
      });
  };

  // ===== EVENT HANDLERS =====
  
  /**
   * Handles user logout process
   * Clears session data and redirects to login page
   * Shows confirmation dialog before proceeding
   */
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("userRole");
      sessionStorage.removeItem("userName");
      alert("Logged out successfully!");
      navigate("/login");
    }
  };

  /**
   * Enables profile editing mode
   * Populates the edit form with current profile data
   * Called when user clicks "Edit Profile" button
   */
  const handleEditProfile = () => {
    if (patientProfile) {
      setProfileForm({
        patientName: patientProfile.patientName || "",
        phoneNo: patientProfile.phoneNo || "",
        email: patientProfile.email || "",
      });
      setIsEditingProfile(true);
    }
  };

  /**
   * Saves profile changes to the backend
   * Sends PUT request with updated profile information
   * 
   * API Endpoint: PUT /api/Patient/UpdatePatientByID/{patientId}
   * Authentication: JWT token from sessionStorage
   * 
   * @throws {Error} When API call fails
   */
  const handleSaveProfile = () => {
    const token = sessionStorage.getItem("token");
    
    if (!profileForm.patientName || !profileForm.phoneNo || !profileForm.email) {
      alert("Please fill in all required fields.");
      return;
    }

    console.log("Attempting to update patient profile...");
    console.log("Patient ID:", patientProfile.patientId);
    console.log("Form data:", profileForm);

    const updatePayload = {
      patientId: patientProfile.patientId,
      userID: patientProfile.userID,
      patientName: profileForm.patientName,
      phoneNo: profileForm.phoneNo,
      email: profileForm.email,
    };

    console.log("Update payload:", updatePayload);
    console.log("API endpoint:", `http://localhost:5043/api/Patient/UpdatePatientByID/${patientProfile.patientId}`);

    axios
      .put(
        `http://localhost:5043/api/Patient/UpdatePatientByID/${patientProfile.patientId}`,
        updatePayload,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((response) => {
        console.log("Profile update response:", response);
        alert("Profile updated successfully!");
        setPatientProfile(prevProfile => ({
          ...prevProfile,
          patientName: profileForm.patientName,
          phoneNo: profileForm.phoneNo,
          email: profileForm.email,
        }));
        setIsEditingProfile(false);
        fetchPatientProfile();
      })
      .catch((error) => {
        console.error("Error updating profile:", error);
        if (error.response?.data?.message) {
          alert(`Failed to update profile: ${error.response.data.message}`);
        } else if (error.response?.status === 400) {
          alert("Bad request. Please check your input data.");
        } else if (error.response?.status === 401) {
          alert("Unauthorized. Please log in again.");
        } else if (error.response?.status === 403) {
          alert("Access denied. You don't have permission to update this profile.");
        } else if (error.response?.status === 404) {
          alert("Patient profile not found.");
        } else if (error.response?.status === 500) {
          alert("Server error. Please try again later.");
        } else {
          alert(`Failed to update profile. Status: ${error.response?.status || 'Unknown'}`);
        }
      });
  };

  /**
   * Cancels profile editing mode
   * Resets the form and returns to view mode without saving changes
   */
  const handleCancelProfile = () => {
    setIsEditingProfile(false);
  };

  /**
   * Handles doctor selection from DoctorSearch component
   * @param {Object} doctor - The selected doctor object
   */
  const handleDoctorSelection = (doctor) => {
    console.log("Selected doctor:", doctor);
    alert(`Doctor ${doctor.name} selected! You can now book an appointment.`);
  };

  // ===== LOADING AND ERROR STATES =====
  
  if (loading) return (
    <div className="text-center p-5">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="mt-3">Loading patient dashboard...</p>
    </div>
  );
  
  if (error) return (
    <div className="text-center p-5">
      <div className="alert alert-danger" role="alert">
        <h4 className="alert-heading">⚠️ Error</h4>
        <p>{error}</p>
        <hr />
        <button className="btn btn-outline-danger" onClick={() => window.location.reload()}>
          🔄 Retry
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-vh-100 bg-light">
      {/* ===== HEADER SECTION ===== */}
      <div className="bg-primary text-white p-4 shadow">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="h3 mb-1">🏥 Patient Dashboard</h1>
            {patientProfile && (
              <p className="mb-0">Welcome back, <strong>{patientProfile.patientName}</strong>!</p>
            )}
          </div>
          <div className="d-flex gap-2">
            <button
              onClick={() => setShowProfile(true)}
              className="btn btn-outline-light"
            >
              👤 My Profile
            </button>
            <button
              onClick={handleLogout}
              className="btn btn-danger"
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </div>

      {/* ===== NAVIGATION SECTION ===== */}
      <div className="bg-white p-3 border-bottom shadow-sm">
        <div className="d-flex flex-wrap gap-2">
          {[
            { id: "dashboard", label: "📊 Dashboard", color: "primary" },
            { id: "search-doctors", label: "👨‍⚕️ Search Doctors", color: "primary" },
            { id: "medical-records", label: "📋 Medical Records", color: "primary" },
            { id: "appointments", label: "📅 My Appointments", color: "primary" },
    
         
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`btn btn-${activeTab === tab.id ? tab.color : 'outline-secondary'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ===== CONTENT SECTION ===== */}
      <div className="p-4">
        {/* ===== DASHBOARD OVERVIEW TAB ===== */}
        {activeTab === "dashboard" && (
          <div>
            <h2 className="mb-4 text-primary">📊 Dashboard Overview</h2>
            
            {/* ===== STATISTICS CARDS ===== */}
            <div className="row g-4 mb-4">
              <div className="col-md-4">
                <div className="card bg-warning text-white text-center shadow">
                  <div className="card-body">
                    <h3 className="display-6">📅</h3>
                    <h4 className="card-title">Today's Appointments</h4>
                    <p className="display-4 fw-bold">{todaysAppointments.length}</p>
                  </div>
                </div>
              </div>
              
            </div>

            {/* ===== Today's Appointments ===== */}
            <h3 className="mb-3">Today's Appointments</h3>
            {todaysAppointments.length === 0 ? (
              <div className="alert alert-info" role="alert">
                <h4>📭 No Appointments Today</h4>
                <p>You don't have any appointments scheduled for today. Use the "My Appointments" tab to view your schedule or book new appointments.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead className="table-dark">
                    <tr>
                      <th>Doctor ID</th>
                      <th>Appointment Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todaysAppointments.map((appointment) => (
                      <tr key={appointment.appointmentId}>
                        <td>{appointment.doctorId}</td>
                        <td>{new Date(appointment.appointmentDate).toLocaleString()}</td>
                        <td>
                          <span
                            className={
                              appointment.status === "Completed" ? "bg-success text-white p-1 rounded" :
                              appointment.status === "Scheduled" ? "bg-info text-white p-1 rounded" :
                              appointment.status === "Cancelled" ? "bg-danger text-white p-1 rounded" :
                              ""
                            }
                          >
                            {appointment.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ===== APPOINTMENTS TAB ===== */}
        {activeTab === "appointments" && (
          <PatientAppointment patientId={patientProfile?.patientId} />
        )}

        {/* ===== MEDICAL RECORDS TAB ===== */}
        {activeTab === "medical-records" && (
          <PatientMedical patientId={patientProfile?.patientId} />
        )}

        {/* ===== DOCTOR SEARCH TAB ===== */}
        {activeTab === "search-doctors" && (
          <DoctorSearch patientId={patientProfile?.patientId} />
        )}
      </div>

      {/* ===== PROFILE MODAL ===== */}
      {showProfile && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">👤 My Profile</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => {
                    setShowProfile(false);
                    setIsEditingProfile(false);
                  }}
                ></button>
              </div>
              <div className="modal-body">
                {patientProfile && (
                  <div>
                    {!isEditingProfile ? (
                      // ===== VIEW PROFILE MODE =====
                      <div>
                        <div className="mb-3">
                          <strong>Patient ID:</strong> {patientProfile.patientId}
                        </div>
                        <div className="mb-3">
                          <strong>User ID:</strong> {patientProfile.userID}
                        </div>
                        <div className="mb-3">
                          <strong>Name:</strong> {patientProfile.patientName}
                        </div>
                        <div className="mb-3">
                          <strong>Phone:</strong> {patientProfile.phoneNo}
                        </div>
                        <div className="mb-4">
                          <strong>Email:</strong> {patientProfile.email}
                        </div>
                        <div className="d-flex gap-2">
                          <button
                            onClick={handleEditProfile}
                            className="btn btn-primary flex-fill"
                          >
                            ✏️ Edit Profile
                          </button>
                        </div>
                      </div>
                    ) : (
                      // ===== EDIT PROFILE MODE =====
                      <div>
                        <div className="mb-3">
                          <label className="form-label fw-bold">Name:</label>
                          <input
                            type="text"
                            className="form-control"
                            value={profileForm.patientName}
                            onChange={(e) => setProfileForm({ ...profileForm, patientName: e.target.value })}
                            placeholder="Enter your full name"
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label fw-bold">Phone:</label>
                          <input
                            type="tel"
                            className="form-control"
                            value={profileForm.phoneNo}
                            onChange={(e) => setProfileForm({ ...profileForm, phoneNo: e.target.value })}
                            placeholder="Enter phone number"
                          />
                        </div>
                        <div className="mb-4">
                          <label className="form-label fw-bold">Email:</label>
                          <input
                            type="email"
                            className="form-control"
                            value={profileForm.email}
                            onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                            placeholder="Enter email address"
                          />
                        </div>
                        <div className="d-flex gap-2">
                          <button
                            onClick={handleSaveProfile}
                            className="btn btn-success flex-fill"
                          >
                            💾 Save Changes
                          </button>
                          <button
                            onClick={handleCancelProfile}
                            className="btn btn-secondary flex-fill"
                          >
                            ❌ Cancel
                          </button>
                        </div>
                        
                        {/* Debug Information */}
                        <div className="mt-3 p-2 bg-light rounded">
                          <small className="text-muted">
                            <strong>Debug Info:</strong><br />
                            Form Name: {profileForm.patientName}<br />
                            Form Phone: {profileForm.phoneNo}<br />
                            Form Email: {profileForm.email}<br />
                            Current Profile Name: {patientProfile.patientName}<br />
                            Current Profile Phone: {patientProfile.phoneNo}<br />
                            Current Profile Email: {patientProfile.email}<br />
                            Patient ID: {patientProfile.patientId}<br />
                            User ID: {patientProfile.userID}
                          </small>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PatientDashboard;