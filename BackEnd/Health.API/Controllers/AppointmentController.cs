using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Health.Application.DTO;
using Health.Application.Services;
using Microsoft.AspNetCore.Authorization;

namespace Health.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AppointmentController : ControllerBase
    { //this controller handles operations related to appointments in the health application.
        private readonly IAppointmentService _appointmentService;
        private readonly IDoctorService _doctorService;
        private readonly IPatientService _patientService;
        public AppointmentController(IAppointmentService appointmentService, IDoctorService doctorService, IPatientService patientService)
        {
            this._appointmentService = appointmentService;
            this._doctorService = doctorService;
            this._patientService = patientService;
        }
        /// <summary>
        /// Gets all appointments.    
        /// </summary>
        /// <returns>list of all appointments</returns>
        // Corresponds to "View List of Appointments" for Admin, Doctor, and Patient roles
        [HttpGet("GetAppointments")]
        [Authorize(Roles = "Admin,Doctor,Patient")]
        public async Task<ActionResult<IEnumerable<object>>> GetAllAppointments()
        {
            try
            {
                var appointments = await _appointmentService.GetAppointmentsAsync();

                var appointmentDetails = new List<object>();

                foreach (var appointment in appointments)
                {
                    var doctor = await _doctorService.GetDoctorByIdAsync(appointment.DoctorId);
                    var patient = await _patientService.GetPatientByIdAsync(appointment.PatientId);

                    appointmentDetails.Add(new
                    {
                        appointmentId = appointment.AppointmentId,
                        appointmentDate = appointment.AppointmentDate,
                        status = appointment.Status,
                        patientId = appointment.PatientId,
                        patientName = patient?.PatientName ?? "Unknown",
                        doctorId = appointment.DoctorId,
                        doctorName = doctor?.DocName ?? "Unknown",
                        specialization = doctor?.Speciality ?? "Unknown" 
                    });
                }

                return Ok(appointmentDetails);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    $"Error retrieving appointments: {ex.Message}");
            }
        }
        /// <summary>
        /// gets an appointment by its ID.
        /// </summary>
        /// <param name="id">The Id of appointment</param>
        /// <returns>it used to get appointment by it's id</returns>
        // corresponds to "View Appointment Details" for Admin, Doctor, and Patient roles

        [HttpGet("GetAppointmentbyId/{id}")]
        [Authorize(Roles = "Admin,Doctor,Patient")]
        public async Task<ActionResult<AppointmentDTO>> GetAppointmentById(int id)
        {
            try
            {
                var appointment = await _appointmentService.GetAppointmentByIdAsync(id);
                if (appointment == null)
                {
                    return NotFound($"Appointment with ID {id} not found.");
                }
                return Ok(appointment);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Error retrieving appointment: {ex.Message}");
            }
        }
        /// <summary>
        /// adds a new appointment.
        /// </summary>
        /// <param name="appointment"></param>
        /// <returns>returns status code</returns>
        // Corresponds to "Create New Appointment" for Patient role
        [HttpPost("CreateAppointment")]
        [Authorize(Roles = "Patient")]
        public async Task<ActionResult<AppointmentDTO>> CreateAppointment([FromBody] AppointmentDTO appointment)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                //  Check for overlapping appointments within 30 minutes for the same doctor
                var conflictExists = await _appointmentService.CheckAppointmentConflictAsync(
                    appointment.DoctorId,
                    appointment.AppointmentDate
                );

                if (conflictExists)
                {
                    return Conflict($"An appointment already exists for Doctor ID {appointment.DoctorId} within 30 minutes of {appointment.AppointmentDate}.");
                }

                await _appointmentService.AddAppointmentAsync(appointment);
                return CreatedAtAction(nameof(GetAppointmentById), new { id = appointment.AppointmentId }, appointment);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Error creating appointment: {ex.Message}");
            }
        }

        /// <summary>
        /// Changes an existing appointment.
        /// </summary>
        [HttpPut("UpdateAppointment/{id}")]
        [Authorize(Roles = "Admin,Doctor,Patient")]
        public async Task<ActionResult> UpdateAppointment(int id, [FromBody] AppointmentDTO appointment)
        {
            try
            {
                if (id != appointment.AppointmentId)
                {
                    return BadRequest("Appointment ID mismatch.");
                }
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var existingAppointment = await _appointmentService.GetAppointmentByIdAsync(id);
                if (existingAppointment == null)
                {
                    return NotFound($"Appointment with ID {id} not found.");
                }

                // Check for overlapping appointments within 30 minutes for the same doctor
                var conflictExists = await _appointmentService.CheckAppointmentConflictAsync(
                    appointment.DoctorId,
                    appointment.AppointmentDate,
                    id // exclude the current appointment when updating
                );

                if (conflictExists)
                {
                    return Conflict($"An appointment already exists for Doctor ID {appointment.DoctorId} within 30 minutes of {appointment.AppointmentDate}.");
                }

                await _appointmentService.UpdateAppointmentAsync(appointment);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Error updating appointment: {ex.Message}");
            }
        }
        /// <summary>
        ///  deletes an appointment by its ID.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        // Corresponds to "Delete Appointment" for Admin and Doctor roles
        [HttpDelete("DeleteAppointment/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> DeleteAppointment(int id)
        {
            try
            {
                var existingAppointment = await _appointmentService.GetAppointmentByIdAsync(id);
                if (existingAppointment == null)
                {
                    return NotFound($"Appointment with ID {id} not found.");
                }
                await _appointmentService.DeleteAppointmentAsync(id);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Error deleting appointment: {ex.Message}");
            }
        }
    }
}