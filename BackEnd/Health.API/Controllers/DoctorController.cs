using Health.Application.DTO;
using Health.Application.Services;
using Health.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Health.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DoctorController : ControllerBase
    {
        private readonly IDoctorService _doctorService;
        private readonly IUserService _userService;
        private readonly IPatientService _patientService;

        public DoctorController(
            IDoctorService doctorService,
            IUserService userService,
            IPatientService patientService)
        {
            _doctorService = doctorService;
            _userService = userService;
            _patientService = patientService;
        }

        /// <summary>
        /// Gets all doctors.
        /// </summary>
        /// <returns>List of doctors</returns>
        [HttpGet("GetAllDoctor")]
        [Authorize(Roles = "Admin,Patient")]
        public async Task<ActionResult<IEnumerable<DoctorDTO>>> GetAllDoctors()
        {
            try
            {
                var doctors = await _doctorService.GetDoctorsAsync();
                return Ok(doctors);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    $"Error retrieving doctors: {ex.Message}");
            }
        }

        /// <summary>
        /// Gets all doctors by their specialization.
        /// </summary>
        /// <param name="specialization">The specialization to filter by.</param>
        /// <returns>List of doctors with the specified specialization.</returns>
        [HttpGet("GetAllDoctorsBySpecialization/{specialization}")]
        [Authorize(Roles = "Admin,Patient")]
        public async Task<ActionResult<IEnumerable<DoctorDTO>>> GetAllDoctorsBySpecialization(string specialization)
        {
            if (string.IsNullOrEmpty(specialization))
            {
                return BadRequest("Specialization cannot be null or empty.");
            }

            try
            {
                var doctors = await _doctorService.GetDoctorsAsync();
                var filteredDoctors = doctors
                    .Where(d => d.Speciality.Equals(specialization, StringComparison.OrdinalIgnoreCase))
                    .ToList();

                return Ok(filteredDoctors);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    $"Error retrieving doctors by specialization: {ex.Message}");
            }
        }

        /// <summary>
        /// Gets a doctor by their ID.
        /// </summary>
        /// <param name="docId">The ID of the doctor.</param>
        /// <returns>The doctor with the specified ID.</returns>
        [HttpGet("GetDoctorByID/{docId}")]
        [Authorize(Roles = "Admin,Doctor,Patient")]
        public async Task<ActionResult<DoctorDTO>> GetDoctorById([FromRoute] int docId)
        {
            try
            {
                var doctor = await _doctorService.GetDoctorByIdAsync(docId);

                if (doctor == null)
                {
                    return NotFound($"Doctor with ID {docId} not found.");
                }

                return Ok(doctor);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    $"Error retrieving doctor: {ex.Message}");
            }
        }

        /// <summary>
        /// Updates a doctor's information by their ID.
        /// </summary>
        /// <param name="docId">The ID of the doctor.</param>
        /// <param name="doctorDto">The updated doctor information.</param>
        /// <returns></returns>
        [HttpPut("UpdateDoctorByID/{docId}")]
        [Authorize(Roles = "Admin,Doctor")]
        public async Task<IActionResult> UpdateDoctor([FromRoute] int docId, [FromBody] DoctorDTO doctorDto)
        {
            if (docId != doctorDto.DoctorId)
            {
                return BadRequest("ID mismatch");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                await _doctorService.UpdateDoctorAsync(doctorDto);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    $"Error updating doctor: {ex.Message}");
            }
        }

        /// <summary>
        /// Deletes a doctor by their ID.
        /// </summary>
        /// <param name="docId">The ID of the doctor.</param>
        /// <returns></returns>
        [HttpDelete("DeleteDoctor/{docId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteDoctor([FromRoute] int docId)
        {
            try
            {
                var doctorExists = await _doctorService.GetDoctorByIdAsync(docId);
                if (doctorExists == null)
                {
                    return NotFound($"Doctor with ID {docId} not found.");
                }

                await _doctorService.DeleteDoctorAsync(docId);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    $"Error deleting doctor: {ex.Message}");
            }
        }

        /// <summary>
        /// Gets all upcoming appointments for the authenticated doctor.
        /// </summary>
        /// <returns>List of appointments with patient details</returns>
         //[HttpGet("GetAppointmentsByDoctor/{docId}")]
        [HttpGet("GetAppointmentsByDoctor")]
        [Authorize(Roles = "Doctor")]
        public async Task<ActionResult<IEnumerable<object>>> GetAppointmentsByDoctorId()
        {
            try
            {
                var docId = await _userService.GetEntityIdByUserIdAsync();
                if (docId == null)
                {
                    return NotFound("Doctor not found.");
                }

                var appointments = await _doctorService.GetAppointmentsByDoctorIdAsync(docId.Value);
               // var appointments = await _doctorService.GetAppointmentsByDoctorIdAsync(docId);
                var appointmentsWithPatients = new List<object>();

                foreach (var appointment in appointments)
                {
                    var patient = await _patientService.GetPatientByIdAsync(appointment.PatientId);
                  
                    appointmentsWithPatients.Add(new
                    {
                        appointmentId = appointment.AppointmentId,
                        appointmentDate = appointment.AppointmentDate,
                        status = appointment.Status,
                        patientName = patient.PatientName ?? "Unknown",
                        patientId = appointment.PatientId,
                        doctorId = appointment.DoctorId,
                    });
                }

                return Ok(appointmentsWithPatients);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    $"Error retrieving appointments: {ex.Message}");
            }
        }

        /// <summary>
        /// Retrieves the profile of the authenticated doctor.
        /// </summary>
        /// <returns>The doctor's profile information.</returns>
        [HttpGet("GetDoctorProfile")]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> GetDoctorProfile()
        {
            try
            {
                var docId = await _userService.GetEntityIdByUserIdAsync();
                if (docId == null)
                {
                    return NotFound("No doctor found for the current user.");
                }

                var doctor = await _doctorService.GetDoctorByIdAsync(docId.Value);
                if (doctor == null)
                {
                    return NotFound("Doctor profile not found.");
                }

                return Ok(doctor);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    $"Error retrieving doctor profile: {ex.Message}");
            }
        }
    }
}