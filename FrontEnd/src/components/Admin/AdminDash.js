import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Import useNavigate for logout redirect
import GetDoctor from "../Doctor/GetDoctor";
import GetAdmin from "./GetAdmin";
import GetPatient from "../Patient/GetPatient";
import GetAppointment from "../Appointment/GetAppointment";
import GetMedicalRecord from "../MedicalRecord/GetMedicalRecord";
import GetUser from "../User/GetUser";
// import AnalyticsDashboard from "./AnalyticsDashboard";

/**
 * AdminDash Component - Comprehensive admin dashboard with Bootstrap styling
 * 
 * This component provides a complete admin interface with:
 * - Welcome message with admin name from API
 * - Current statistics (doctors, patients, appointments, admins)
 * - Navigation tabs to manage different entities
 * - Dashboard overview with quick access cards
 * - Profile management with edit functionality
 * - Logout functionality
 * - Responsive design using Bootstrap 5 classes
 * - Improved visual consistency with other components
 */
function AdminDash() {
  const navigate = useNavigate(); // Hook for navigation
  
  // State management for component data and UI
  const [adminProfile, setAdminProfile] = useState(null); // Admin profile data from API
  const [loading, setLoading] = useState(true); // Loading state for API calls
  const [error, setError] = useState(null); // Error message display
  const [activeTab, setActiveTab] = useState("dashboard"); // Currently active navigation tab
  const [showProfile, setShowProfile] = useState(false); // Profile modal visibility
  const [isEditingProfile, setIsEditingProfile] = useState(false); // Profile edit mode toggle
  
  // Statistics state
  const [stats, setStats] = useState({
    activeDoctors: 0,
    activePatients: 0,
    totalAppointments: 0,
    totalAdmins: 0,
    totalMedicalRecords: 0
  });
  
  // Form state for editing admin profile details
  const [profileForm, setProfileForm] = useState({
    name: "",
    phoneNo: "",
    email: "",
  });

  // Fetch admin profile and statistics when component mounts
  useEffect(() => {
    fetchAdminProfile();
    fetchStatistics();
  }, []);

  /**
   * Fetch admin profile from the backend API
   * Uses JWT token for authentication
   * Handles different error scenarios (401, 403, etc.)
   */
  const fetchAdminProfile = () => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      setError("You must be logged in as an Admin to view this page.");
      setLoading(false);
      return;
    }

    axios
      .get("http://localhost:5043/api/Admin/GetAdminProfile", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setAdminProfile(response.data);
        setLoading(false);
        setError(null); // Clear error if data is available
      })
      .catch((error) => {
        console.error("Error fetching admin profile:", error);
        if (error.response?.status === 403) {
          setError("Access denied. Admin role required.");
        } else if (error.response?.status === 401) {
          setError("Unauthorized. Please log in again.");
        } else if (error.response?.status === 404) {
          setError("Admin profile API endpoint not found. Please check the backend configuration.");
        } else if (error.response?.status === 500) {
          setError("Backend server error. Please try again later.");
        } else {
          setError("Failed to load admin profile. Please try again.");
        }
        setLoading(false);
      });
  };

  /**
   * Fetch dashboard statistics from the backend API
   * This would typically call separate endpoints for each statistic
   */
  const fetchStatistics = () => {
    const token = sessionStorage.getItem("token");
    if (!token) return;

    // Get actual doctor count
    axios
      .get("http://localhost:5043/api/Doctor/GetAllDoctor", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setStats(prevStats => ({
          ...prevStats,
          activeDoctors: response.data.length
        }));
      })
      .catch((error) => {
        console.error("Error fetching doctors:", error);
        setStats(prevStats => ({
          ...prevStats,
          activeDoctors: 0
        }));
      });

    // Get actual admin count
    axios
      .get("http://localhost:5043/api/Admin/GetAllAdmin", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setStats(prevStats => ({
          ...prevStats,
          totalAdmins: response.data.length
        }));
      })
      .catch((error) => {
        console.error("Error fetching admins:", error);
        setStats(prevStats => ({
          ...prevStats,
          totalAdmins: 0
        }));
      });

    // Get actual patient count
    axios
      .get("http://localhost:5043/api/Patient/GetAllPatient", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setStats(prevStats => ({
          ...prevStats,
          activePatients: response.data.length
        }));
      })
      .catch((error) => {
        console.error("Error fetching patients:", error);
        setStats(prevStats => ({
          ...prevStats,
          activePatients: 0
        }));
      });

    // Get today's active appointments count
    axios
      .get("http://localhost:5043/api/Appointment/GetAppointments", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        // Filter appointments for today's date
        const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
        const todaysAppointments = response.data.filter(appointment => {
          // Check if appointment date matches today
          const appointmentDate = new Date(appointment.appointmentDate).toISOString().split('T')[0];
          return appointmentDate === today;
        });
        
        setStats(prevStats => ({
          ...prevStats,
          totalAppointments: todaysAppointments.filter((apt) => apt.status === "Scheduled").length
        }));
      })
      .catch((error) => {
        console.error("Error fetching appointments:", error);
        setStats(prevStats => ({
          ...prevStats,
          totalAppointments: 0
        }));
      });

    // Get medical records count 
    axios
      .get("http://localhost:5043/api/MedicalRecord/GetAllMedicalRecords", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        console.log("Medical Records Count:", response.data.length);
        setStats(prevStats => ({
          ...prevStats,
          totalMedicalRecords: response.data.length
        }));
      })
      .catch((error) => {
        console.error("Error fetching medical records:", error);
        setStats(prevStats => ({
          ...prevStats,
          totalMedicalRecords: 0
        }));
      });
  };

  /**
   * Handle logout functionality
   * Clears session storage and redirects to login page
   */
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      // Clear session storage
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("userRole");
      sessionStorage.removeItem("userName");
      
      // Show logout message
      alert("Logged out successfully!");
      
      // Redirect to login page
      navigate("/login");
    }
  };

  /**
   * Handle profile edit button click
   * Populates the edit form with current profile data
   * Switches to edit mode
   */
  const handleEditProfile = () => {
    if (adminProfile) {
      setProfileForm({
        name: adminProfile.name || "",
        phoneNo: adminProfile.phoneNo || "",
        email: adminProfile.email || "",
      });
      setIsEditingProfile(true);
    }
  };

  /**
   * Save the updated profile details
   * Sends PUT request to update admin profile
   * Refreshes profile data after successful update
   */
  const handleSaveProfile = () => {
    const token = sessionStorage.getItem("token");
    axios
      .put(
        `http://localhost:5043/api/Admin/UpdateAdmin/${adminProfile.adminId}`,
        {
          adminId: adminProfile.adminId,
          userID: adminProfile.userID,
          name: profileForm.name,
          phoneNo: profileForm.phoneNo,
          email: profileForm.email,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        alert("Profile updated successfully.");
        setIsEditingProfile(false);
        fetchAdminProfile(); // Refresh profile data
      })
      .catch((error) => {
        console.error("Error updating profile:", error);
        alert("Failed to update profile.");
      });
  };

  /**
   * Cancel profile editing
   * Resets the edit state without saving changes
   */
  const handleCancelProfile = () => {
    setIsEditingProfile(false);
  };

  // Show loading indicator while fetching data
  if (loading) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading admin dashboard...</p>
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
          <button className="btn btn-outline-danger" onClick={fetchAdminProfile}>
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      {/* Header Section - Bootstrap: bg-primary, text-white, shadow */}
      <div className="bg-primary text-white p-4 shadow">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            {/* Bootstrap: h3 for smaller heading, mb-1 for margin bottom */}
            <h1 className="h3 mb-1">👨‍💼 Admin Dashboard</h1>
            {adminProfile && (
              <p className="mb-0">Welcome back, <strong>{adminProfile.name}</strong>!</p>
            )}
          </div>
          <div className="d-flex gap-2">
            {/* Bootstrap: btn btn-outline-light for outlined button */}
            <button
              onClick={() => setShowProfile(true)}
              className="btn btn-outline-light"
            >
              👤 My Profile
            </button>
            {/* Bootstrap: btn btn-danger for logout button */}
            <button
              onClick={handleLogout}
              className="btn btn-danger"
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Section - Bootstrap: bg-white, border-bottom, flex-wrap */}
      <div className="bg-white p-3 border-bottom shadow-sm">
        <div className="d-flex flex-wrap gap-2">
          {/* Navigation tabs array - mapped to reduce repetitive code */}
          {[
            { id: "dashboard", label: "📊 Dashboard", color: "primary" },
            // { id: "analytics", label: "📈 Analytics", color: "primary" },
            { id: "doctors", label: "👨‍⚕️ Manage Doctors", color: "primary" },
            { id: "admins", label: "👨‍💼 Manage Admins", color: "primary" },
            { id: "patients", label: "👥 Manage Patients", color: "primary" },
            { id: "appointments", label: "📅 Manage Appointments", color: "primary" },
            { id: "medical-history", label: "📋 Medical History", color: "primary" },
            { id: "users", label: "👤 Manage Users", color: "primary" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`btn btn-${activeTab === tab.id ? tab.color : 'outline-secondary'} shadow-sm`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Section - Bootstrap: p-4 for padding */}
      <div className="p-4">
        {/* Dashboard Overview Tab */}
        {activeTab === "dashboard" && (
          <div>
            {/* Bootstrap: mb-4 for margin bottom */}
            <div className="row mb-4">
              <div className="col-12">
                <h2 className="text-center text-primary mb-3">📊 Dashboard Overview</h2>
                <p className="text-center text-muted">Monitor key metrics and access management functions</p>
              </div>
            </div>
            
            {/* Statistics Cards */}
            <div className="row g-4 mb-5">
              <div className="col-md-3">
                <div className="card bg-primary text-white text-center shadow h-100">
                  <div className="card-body">
                    <h3 className="display-6 mb-3">👨‍⚕️</h3>
                    <h4 className="card-title h5">Active Doctors</h4>
                    <p className="display-4 fw-bold mb-0">{stats.activeDoctors}</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card bg-success text-white text-center shadow h-100">
                  <div className="card-body">
                    <h3 className="display-6 mb-3">👥</h3>
                    <h4 className="card-title h5">Active Patients</h4>
                    <p className="display-4 fw-bold mb-0">{stats.activePatients}</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card bg-warning text-white text-center shadow h-100">
                  <div className="card-body">
                    <h3 className="display-6 mb-3">📅</h3>
                    <h4 className="card-title h5">Today's Active Appointments</h4>
                    <p className="display-4 fw-bold mb-0">{stats.totalAppointments}</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card bg-info text-white text-center shadow h-100">
                  <div className="card-body">
                    <h3 className="display-6 mb-3">👨‍💼</h3>
                    <h4 className="card-title h5">Active Admins</h4>
                    <p className="display-4 fw-bold mb-0">{stats.totalAdmins}</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card bg-secondary text-white text-center shadow h-100">
                  <div className="card-body">
                    <h3 className="display-6 mb-3">📋</h3>
                    <h4 className="card-title h5">Medical Records</h4>
                    <p className="display-4 fw-bold mb-0">{stats.totalMedicalRecords || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Access Cards */}
            <div className="row mb-4">
              <div className="col-12">
                <h3 className="text-center text-primary mb-4">🚀 Quick Access</h3>
              </div>
            </div>
            <div className="row g-4">
              {/* Dashboard cards array - mapped for consistency */}
              {[
                // { id: "analytics", title: "Analytics", icon: "📈", color: "primary", description: "View detailed analytics and insights" },
                { id: "doctors", title: "Doctors", icon: "👨‍⚕️", color: "success", description: "Manage doctor profiles and specializations" },
                { id: "admins", title: "Admins", icon: "👨‍💼", color: "warning", description: "Manage administrative accounts" },
                { id: "patients", title: "Patients", icon: "👥", color: "info", description: "View and manage patient records" },
                { id: "appointments", title: "Appointments", icon: "📅", color: "secondary", description: "Schedule and track appointments" },
                { id: "medical-history", title: "Medical History", icon: "📋", color: "dark", description: "Access medical records and history" },
                { id: "users", title: "Users", icon: "👤", color: "danger", description: "Manage user accounts and permissions" },
              ].map((card) => (
                /* Bootstrap: col-md-6 col-lg-4 for responsive columns */
                <div key={card.id} className="col-md-6 col-lg-4">
                  {/* Bootstrap: card, text-center, h-100, shadow-sm */}
                  <div className="card text-center h-100 shadow-sm border-0">
                    <div className="card-body d-flex flex-column">
                      {/* Bootstrap: display-6 for large icon, mb-3 for margin */}
                      <h3 className="display-6 mb-3">{card.icon}</h3>
                      <h5 className="card-title text-primary">{card.title}</h5>
                      {/* Bootstrap: fw-bold for font weight, fs-4 for font size */}
                      <p className="card-text text-muted mb-4 flex-grow-1">{card.description}</p>
                      {/* Bootstrap: Dynamic button color based on card type */}
                      <button
                        onClick={() => setActiveTab(card.id)}
                        className={`btn btn-${card.color} shadow-sm`}
                      >
                        Manage {card.title}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content Tabs - Render different components based on active tab */}
        {/* {activeTab === "analytics" && <AnalyticsDashboard />} */}
        {activeTab === "doctors" && <GetDoctor />}
        {activeTab === "admins" && <GetAdmin />}
        {activeTab === "patients" && <GetPatient />}
        {activeTab === "appointments" && <GetAppointment />}
        {activeTab === "medical-history" && <GetMedicalRecord />}
        {activeTab === "users" && <GetUser />}
      </div>

      {/* Profile Modal - Bootstrap Modal Classes */}
      {showProfile && (
        /* Bootstrap: modal show d-block for visible modal, custom background overlay */
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          {/* Bootstrap: modal-dialog modal-dialog-centered for centered positioning */}
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow">
              {/* Modal Header - Bootstrap: modal-header */}
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">👤 My Profile</h5>
                {/* Bootstrap: btn-close for close button */}
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => {
                    setShowProfile(false);
                    setIsEditingProfile(false);
                  }}
                ></button>
              </div>
              {/* Modal Body - Bootstrap: modal-body */}
              <div className="modal-body">
                {adminProfile && (
                  <div>
                    {/* Conditional rendering: View Profile vs Edit Profile */}
                    {!isEditingProfile ? (
                      // View Profile Mode
                      <div>
                        {/* Profile information display - Bootstrap: mb-3 for spacing */}
                        <div className="row mb-3">
                          <div className="col-4 fw-bold text-primary">Admin ID:</div>
                          <div className="col-8">{adminProfile.adminId}</div>
                        </div>
                        <div className="row mb-3">
                          <div className="col-4 fw-bold text-primary">User ID:</div>
                          <div className="col-8">{adminProfile.userID}</div>
                        </div>
                        <div className="row mb-3">
                          <div className="col-4 fw-bold text-primary">Name:</div>
                          <div className="col-8">{adminProfile.name}</div>
                        </div>
                        <div className="row mb-3">
                          <div className="col-4 fw-bold text-primary">Phone:</div>
                          <div className="col-8">{adminProfile.phoneNo}</div>
                        </div>
                        <div className="row mb-4">
                          <div className="col-4 fw-bold text-primary">Email:</div>
                          <div className="col-8">{adminProfile.email}</div>
                        </div>
                        {/* Bootstrap: btn btn-primary for primary button */}
                        <div className="text-center">
                          <button
                            onClick={handleEditProfile}
                            className="btn btn-primary btn-lg"
                          >
                            ✏️ Edit Profile
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Edit Profile Mode
                      <div>
                        {/* Form fields - Bootstrap: mb-3, form-label, form-control */}
                        <div className="mb-3">
                          <label className="form-label fw-bold text-primary">Name:</label>
                          <input
                            type="text"
                            className="form-control form-control-lg"
                            value={profileForm.name}
                            onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label fw-bold text-primary">Phone:</label>
                          <input
                            type="text"
                            className="form-control form-control-lg"
                            value={profileForm.phoneNo}
                            onChange={(e) => setProfileForm({ ...profileForm, phoneNo: e.target.value })}
                          />
                        </div>
                        <div className="mb-4">
                          <label className="form-label fw-bold text-primary">Email:</label>
                          <input
                            type="email"
                            className="form-control form-control-lg"
                            value={profileForm.email}
                            onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                          />
                        </div>
                        {/* Action buttons - Bootstrap: d-flex gap-2 for button spacing */}
                        <div className="d-flex gap-3 justify-content-center">
                          {/* Bootstrap: btn btn-success for success button */}
                          <button
                            onClick={handleSaveProfile}
                            className="btn btn-success btn-lg"
                          >
                            💾 Save Changes
                          </button>
                          {/* Bootstrap: btn btn-secondary for secondary button */}
                          <button
                            onClick={handleCancelProfile}
                            className="btn btn-secondary btn-lg"
                          >
                            ❌ Cancel
                          </button>
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

export default AdminDash;
