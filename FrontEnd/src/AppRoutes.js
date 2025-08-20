import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Import all your components from their correct locations
//Login
import HealthCareLogin from './components/Login/HealthCareLogin';
//Register
import DoctorRegister from './components/Doctor/DoctorRegister';
import PatientRegister from './components/Patient/PatientRegister';
import AdminRegister from './components/Admin/AdminRegister';
// Admin Routes
import AdminDash from './components/Admin/AdminDash';
import GetDoctor from './components/Doctor/GetDoctor';
import GetAdmin from './components/Admin/GetAdmin';
import GetPatient from './components/Patient/GetPatient';
import GetAppointment from './components/Appointment/GetAppointment';
import GetMedicalRecord from './components/MedicalRecord/GetMedicalRecord';
import GetUser from './components/User/GetUser';
// Doctor Routes
import DoctorDash from './components/Doctor/DoctorDash';
import DoctorAppointments from './components/Appointment/DoctorAppointments';
import DoctorMedical from './components/MedicalRecord/DoctorMedical';
//Patient Routes
import PatientDashboard from './components/Patient/PatientDashboard';
import PatientAppointment from './components/Appointment/PatientAppointment';
import PatientMedical from './components/MedicalRecord/PatientMedical';
import DoctorSearch from './components/Doctor/DoctorSearchcopy';

// This is a placeholder for your actual dashboard page
const DashboardPage = () => <h2>Welcome to the Dashboard!</h2>;

const AppRoutes = () => {
  return (
    <Routes>
      {/* Registration Routes */}
      <Route path="/register/admin" element={<AdminRegister />} />
      <Route path="/register/doctor" element={<DoctorRegister />} />
      <Route path="/register/patient" element={<PatientRegister />} />
      
      {/* Main App Routes */}
      <Route path="/login" element={<HealthCareLogin />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      {/*Patient Routes*/}
      <Route path="/patient-dashboard" element={<PatientDashboard />} />
      <Route path="/patient-appointments" element={<PatientAppointment />} />
      <Route path="/patient-medical" element={<PatientMedical />} />
      <Route path="/doctor-search" element={<DoctorSearch />} />
      {/*Doctor Routes*/}
      <Route path="/doctor-dash" element={<DoctorDash />} />
      <Route path="/doctor-appointments" element={<DoctorAppointments />} />
      <Route path="/doctor-medical" element={<DoctorMedical/>}/>
      
      {/*Admin Routes*/}
      <Route path="/admin-dash" element={<AdminDash />} /> {/* Add AdminDash route */}
      <Route path="/Get-Admin" element={<GetAdmin />} />
      <Route path="/Get-Doctor" element={<GetDoctor />} />
      <Route path="/Get-Patient" element={<GetPatient />} />
      <Route path="/Get-Appointment" element={<GetAppointment />} />
      <Route path="/Get-MedicalRecord" element={<GetMedicalRecord />} />
      <Route path="/Get-User" element={<GetUser />} />  
      {/* Default route */}
      <Route path="/" element={<HealthCareLogin />} />
    </Routes>
  );
};

export default AppRoutes;