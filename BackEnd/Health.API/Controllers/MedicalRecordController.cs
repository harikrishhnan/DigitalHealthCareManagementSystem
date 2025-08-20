using Health.Application.DTO;
using Health.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Health.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
   
    public class MedicalRecordController : ControllerBase
    {
        // This controller handles the creation, retrieval, update, and deletion of medical records.
        private readonly IMedicalRecordService _medicalRecordService;
        private readonly IDoctorService _doctorService;
        private readonly IPatientService _patientService;
        /// <summary>
        /// Initializes a new instance of the MedicalRecordController class.
        /// </summary>
        /// <param name="medicalRecordService">The medical record service injected via dependency injection.</param>
        public MedicalRecordController(IMedicalRecordService medicalRecordService, IDoctorService doctorService, IPatientService patientService)
        {
            _medicalRecordService = medicalRecordService;
            _doctorService = doctorService;
            _patientService = patientService;
        }

        /// <summary>
        /// Retrieves all medical records in the system.
        /// </summary>
        /// <returns>A list of all medical records.</returns>
        // This endpoint is restricted to users with the 'Admin' role for oversight.
        [HttpGet("GetAllMedicalRecords")]
        [Authorize(Roles = "Admin, Doctor")]
        public async Task<IActionResult> GetAllMedicalRecords()
        {
            try
            {
                var records = await _medicalRecordService.GetMedicalRecordsAsync();
                var recordDetails = new List<object>();

                foreach (var record in records)
                {
                    var doctor = await _doctorService.GetDoctorByIdAsync(record.DoctorId);
                    var patient = await _patientService.GetPatientByIdAsync(record.PatientId);

                    recordDetails.Add(new
                    {
                        recordId = record.RecordId,
                        diagnosis = record.Diagnosis,
                        treatment = record.Treatment,
                        recordDate = record.Date,
                        patientId = record.PatientId,
                        patientName = patient?.PatientName ?? "Unknown",
                        doctorId = record.DoctorId,
                        doctorName = doctor?.DocName ?? "Unknown",
                        specialization = doctor?.Speciality ?? "Unknown"
                    });
                }

                return Ok(recordDetails);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    $"Error retrieving medical records: {ex.Message}");
            }
        }

        /// <summary>
        /// Retrieves all medical records for a specific patient.
        /// </summary>
        /// <param name="patientId">The ID of the patient.</param>
        /// <returns>A list of medical records for the specified patient, or NotFound if none exist.</returns>
        // Patients can view their own records; Doctors can view their patients' records.
        [HttpGet("GetByPatientId/{patientId}")]
        [Authorize(Roles = "Admin, Doctor, Patient")]
        public async Task<IActionResult> GetMedicalRecordsByPatientId(int patientId)
        {
            var records = await _medicalRecordService.GetMedicalRecordByPatientIdAsync(patientId);

            if (records == null || !records.Any())
            {
                return NotFound($"No medical records found for patient with ID {patientId}.");
            }

            var result = new List<object>();

            foreach (var record in records)
            {
                var doctor = await _doctorService.GetDoctorByIdAsync(record.DoctorId);

                result.Add(new
                {
                    Record = record,
                    Doctor = doctor
                });
            }

            return Ok(result);
        }



        /// <summary>
        /// Creates a new medical record.
        /// </summary>
        /// <param name="dto">The MedicalRecordDTO containing the new record's information.</param>
        /// <returns>A CreatedAtAction result pointing to the new record.</returns>
        // Typically performed by a Doctor after a consultation.
        [HttpPost("CreateMedicalRecord")]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> CreateMedicalRecord([FromBody] MedicalRecordDTO dto)
        {   
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            await _medicalRecordService.AddMedicalRecordAsync(dto);
            return CreatedAtAction(nameof(GetMedicalRecordsByPatientId), new { patientId = dto.PatientId }, dto);
        }

        /// <summary>
        /// Updates an existing medical record.
        /// </summary>
        /// <param name="recordId">The ID of the medical record to update.</param>
        /// <param name="dto">The MedicalRecordDTO with the updated information.</param>
        /// <returns>A NoContent result on successful update.</returns>
        // Allows a Doctor to modify an existing medical record.
        [HttpPut("UpdateMedicalRecord/{recordId}")]
        [Authorize(Roles = "Admin,Doctor")]
        public async Task<IActionResult> UpdateMedicalRecord(int recordId, [FromBody] MedicalRecordDTO dto)
        {
            if (recordId != dto.RecordId)
            {
                return BadRequest("Record ID in URL must match Record ID in the body.");
            }
            await _medicalRecordService.UpdateMedicalRecordAsync(dto);
            return NoContent();
        }

        /// <summary>
        /// Deletes a specific medical record by its ID.
        /// </summary>
        /// <param name="recordId">The ID of the medical record to delete.</param>
        /// <returns>A NoContent result on successful deletion.</returns>
        // This is a sensitive operation and is restricted to Admin users.
        [HttpDelete("DeleteMedicalRecord/{recordId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteMedicalRecord(int recordId)
        {
            await _medicalRecordService.DeleteMedicalRecordAsync(recordId);
            return NoContent();
        }
    }
}