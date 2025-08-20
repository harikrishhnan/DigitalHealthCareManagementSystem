using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Health.Application.DTO;
using Health.Infrastructure.Contracts;
using Health.Infrastructure.Repositories;
using Health.Domain;

namespace Health.Application.Services
{
    /// <summary>
    /// Handles business logic for medical records.
    /// </summary>
    public class MedicalRecordService : IMedicalRecordService
    {
        public readonly IMedicalRecordContract _medicalRecordRepository;

        // Initializes the service and creates an instance of the repository.
        public MedicalRecordService()
        {
            _medicalRecordRepository = new MedicalRecordRepository();
        }

        /// <summary>
        /// Retrieves all medical records.
        /// </summary>
        /// <returns>A collection of all medical records as DTOs.</returns>
        public async Task<IEnumerable<MedicalRecordDTO>> GetMedicalRecordsAsync()
        {
            var medicalRecords = await _medicalRecordRepository.GetMedicalRecordsAsync();

            // Convert the MedicalRecord domain objects to DTOs.
            var medicalRecordDTOs = medicalRecords.Select(m => new MedicalRecordDTO
            {
                RecordId = m.RecordId,
                PatientId = m.PatientId ?? 0,
                DoctorId = m.DoctorId ?? 0,
                Diagnosis = m.Diagnosis,
                Treatment = m.Treatment,
                Date = m.Date
            });
            return medicalRecordDTOs;
        }

        /// <summary>
        /// Retrieves all medical records for a specific patient.
        /// </summary>
        /// <param name="PatientId">The ID of the patient to find records for.</param>
        /// <returns>A collection of the patient's medical records, or null if none are found.</returns>
        public async Task<IEnumerable<MedicalRecordDTO>> GetMedicalRecordByPatientIdAsync(int PatientId)
        {
            var medicalRecords = await _medicalRecordRepository.GetMedicalRecordByPatientIdAsync(PatientId);
            if (medicalRecords == null)
            {
                return null;
            }

            // Convert the found records to DTOs.
            var medicalRecordDTOs = medicalRecords.Select(m => new MedicalRecordDTO
            {
                RecordId = m.RecordId,
                PatientId = m.PatientId ?? 0,
                DoctorId = m.DoctorId ?? 0,
                Diagnosis = m.Diagnosis,
                Treatment = m.Treatment,
                Date = m.Date
            });
            return medicalRecordDTOs;
        }

        /// <summary>
        /// Adds a new medical record to the database.
        /// </summary>
        /// <param name="medicalRecord">The record details to add.</param>
        public async Task AddMedicalRecordAsync(MedicalRecordDTO medicalRecord)
        {
            // Convert the DTO to a MedicalRecord domain object.
            var medicalRecordDomain = new MedicalRecord
            {
                RecordId = medicalRecord.RecordId,
                PatientId = medicalRecord.PatientId,
                DoctorId = medicalRecord.DoctorId,
                Diagnosis = medicalRecord.Diagnosis,
                Treatment = medicalRecord.Treatment,
                Date = medicalRecord.Date
            };
            // Pass the domain object to the repository to be saved.
            await _medicalRecordRepository.AddMedicalRecordAsync(medicalRecordDomain);
        }

        /// <summary>
        /// Updates an existing medical record.
        /// </summary>
        /// <param name="medicalRecord">The record with updated details.</param>
        public Task UpdateMedicalRecordAsync(MedicalRecordDTO medicalRecord)
        {
            // Convert the DTO to a MedicalRecord domain object for the update.
            var medicalRecordDomain = new MedicalRecord
            {
                RecordId = medicalRecord.RecordId,
                PatientId = medicalRecord.PatientId,
                DoctorId = medicalRecord.DoctorId,
                Diagnosis = medicalRecord.Diagnosis,
                Treatment = medicalRecord.Treatment,
                Date = medicalRecord.Date
            };
            // Pass the domain object to the repository to be updated.
            return _medicalRecordRepository.UpdateMedicalRecordAsync(medicalRecordDomain);
        }

        /// <summary>
        /// Deletes all medical records for a specific patient.
        /// </summary>
        /// <param name="patientId">The ID of the patient whose records will be deleted.</param>
        /// <exception cref="Exception">Throws if no records are found for the patient.</exception>
        public async Task DeleteMedicalRecordAsync(int MRID)
        {
            // Find all records belonging to the patient.
            
            // Loop through the patient's records and delete each one.
           
                await _medicalRecordRepository.DeleteMedicalRecordAsync(MRID);
            
        }
    }
}