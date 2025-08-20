using Health.Application.DTO;
using Health.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Health.API.Controllers
{
    [Route("api/[controller]")] // Defines the base route for the controller
    [ApiController] // Indicates that this class is an API controller
    [Authorize(Roles = "Admin, Doctor, Patient")] // Controller-level authorization: All actions require the user to be in at least one of these roles.
    public class PatientController : ControllerBase // Handles HTTP requests related to patients. Inherits from ControllerBase for API controller functionalities.
    {
        private readonly IPatientService patientService; // A private, read-only instance of the patient service (dependency). Used to call business logic.
        private readonly IUserService _userService; // A private, read-only instance of the user service (dependency). Used to manage user-related operations.
        public PatientController(IPatientService patientService, IUserService userService) // Constructor: Injects the IPatientService and IUserService dependencies into the controller.
        {
            this.patientService = patientService; // Assignment: Assigns the injected service to the field.
            this._userService = userService;
        }

        // GET: api/patient/GetAllPatient
        [HttpGet("GetAllPatient")]
        [Authorize(Roles = "Admin, Doctor")] // Only Admins and Doctors can get a list of all patients.
        public async Task<ActionResult<IEnumerable<PatientDTO>>> GetAllPatients() // Method: Handles requests to get all patients.
        {
            try
            {
                var patients = await patientService.GetPatientsAsync(); // Calls the application service to get all patient DTOs.
                return Ok(patients);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Error retrieving patients: {ex.Message}");
            }
        }

        // GET: api/patient/GetPatientByID/{PatientId}
        
        [HttpGet("GetPatientByID/{PatientId}")]
        [Authorize(Roles = "Admin, Doctor, Patient")]
        // Inherits controller-level authorization. Admin, Doctor, or Patient can get a patient's details.
        // Logic to ensure a patient can only get their own profile would be inside the service.
        public async Task<ActionResult<PatientDTO>> GetPatientById(int PatientId)
        {
            try
            {
                var patient = await patientService.GetPatientByIdAsync(PatientId); // Calls the application service to get a patient by ID.
                if (patient == null)
                {
                    return NotFound(); // Returns a 404 Not Found status code if patient doesn't exist.
                }
                return Ok(patient);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Error retrieving patient: {ex.Message}");
            }
        }

        // PUT: api/patient/UpdatePatientByID/{PatientId}
        [HttpPut("UpdatePatientByID/{PatientId}")]
        [Authorize(Roles = "Admin, Patient")]
        // Inherits controller-level authorization. Admin, Doctor, or Patient can update a profile.
        // Logic to ensure a patient can only update their own profile would be inside the service.
        public async Task<IActionResult> UpdatePatient(int PatientId, [FromBody] PatientDTO patient) //Handles requests to update a patient.
        {
            if (PatientId != patient.PatientId)
            {
                return BadRequest("Patient ID mismatch");
            }
            try
            {
                await patientService.UpdatePatientAsync(patient);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Error updating patient: {ex.Message}");
            }
        }

       

        // DELETE: api/patient/DeletePatient/{PatientId}
        [HttpDelete("DeletePatient/{PatientId}")]
        [Authorize(Roles = "Admin")] // Only an Admin can delete a patient account.
        public async Task<IActionResult> DeletePatient(int PatientId)
        {
            try
            {
                var patient = await patientService.GetPatientByIdAsync(PatientId);
                if (patient == null)
                {
                    return NotFound();
                }
                await patientService.DeletePatientAsync(PatientId);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Error deleting patient: {ex.Message}");
            }
        }
        // GET: api/patient/GetPatientProfile
        [HttpGet("GetPatientProfile")]
        [Authorize(Roles = " Patient")] // Allows  Patients to access their own profile.
        public async Task<IActionResult> GetPatientProfile()
        {
            // Extract UserId from JWT

            try
            {
                int? patientId = await _userService.GetEntityIdByUserIdAsync();
                // Get the AdminId using UserId
                if (patientId == null)
                {
                    return NotFound($"No patient found.");
                }

                // Fetch the patient's profile using PatientId
                var patient = await patientService.GetPatientByIdAsync(patientId.Value);
                if (patient == null)
                {
                    return NotFound("Patient profile not found.");
                }

                return Ok(patient);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Error retrieving patient profile: {ex.Message}");
            }
        }
        // GET: api/patient/GetAppointmentsByPatient/{PatientId}

        [HttpGet("GetAppointmentsByPatient/{PatientId}")]
        [Authorize(Roles = " Patient")]
        // Inherits controller-level authorization. Admin, Doctor, or Patient can view appointments.
        // Logic to ensure a patient can only view their own appointments would be inside the service.
        public async Task<ActionResult<IEnumerable<AppointmentDTO>>> GetAppointmentsByPatientId()
        {

            try
            {
                int? PatientId = await _userService.GetEntityIdByUserIdAsync();
                if (PatientId == null)
                {
                    return NotFound("Patient not found.");
                }
                else
                {
                    int PatientIdValue = PatientId.Value;
                    var appointments = await patientService.GetAppointmentsByPatientIdAsync(PatientIdValue);
                    return Ok(appointments);
                }
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Error retrieving appointments: {ex.Message}");
            }
        }
    }
}