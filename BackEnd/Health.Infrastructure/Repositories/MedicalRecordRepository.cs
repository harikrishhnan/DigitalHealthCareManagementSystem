using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Health.Infrastructure.Contracts;
using Health.Infrastructure.DBContext;
using Microsoft.EntityFrameworkCore;

namespace Health.Infrastructure.Repositories
{
    // This code is part of the Health.Infrastructure.Repositories namespace, which contains repository classes for data access.
    public class MedicalRecordRepository : IMedicalRecordContract
    {
        // This class implements the IMedicalRecordContract interface for medical record-related operations
        private readonly HealthDBContextDbContext _context;
        // Constructor initializes the HealthDBContextDbContext instance    
        public MedicalRecordRepository()
        {
            // Initialize the database context for accessing medical record data
            _context = new HealthDBContextDbContext();
        }
        // method to get all medical records asynchronously
        public async Task<IEnumerable<Domain.MedicalRecord>> GetMedicalRecordsAsync()
        {
            // Fetch all medical records from the database asynchronously
            return await _context.MedicalRecords.ToListAsync();
        }
        public async Task<IEnumerable<Domain.MedicalRecord>> GetMedicalRecordByIdAsync(int MRID)
        {
            // Fetch all medical records for a given MRID from the database asynchronously
            return await _context.MedicalRecords.Where(m => m.RecordId == MRID).ToListAsync();
        }
        // Method to get a medical record by Patient ID asynchronously
        public async Task<IEnumerable<Domain.MedicalRecord>> GetMedicalRecordByPatientIdAsync(int PatientId)
        {
            // Fetch all medical records for a given PatientId from the database asynchronously
            return await _context.MedicalRecords.Where(m => m.PatientId == PatientId).ToListAsync();
        }
        // Method to add a new medical record asynchronously
        public async Task<Domain.MedicalRecord> AddMedicalRecordAsync(Domain.MedicalRecord medicalRecord)
        {
            // Validate the medical record object before adding it to the database
            _context.MedicalRecords.Add(medicalRecord);
            await _context.SaveChangesAsync();
            return medicalRecord;
        }
        // Method to update an existing medical record asynchronously
        public async Task<Domain.MedicalRecord> UpdateMedicalRecordAsync(Domain.MedicalRecord medicalRecord)
        {
            // Validate the medical record object before updating it in the database
            _context.MedicalRecords.Update(medicalRecord);
            await _context.SaveChangesAsync();
            return medicalRecord;
        }
        // Method to delete a medical record by Patient ID asynchronously
        public async Task<bool> DeleteMedicalRecordAsync(int MRID)
        {
            // Validate the ID and remove the medical record from the database if it exists
            var medicalRecords = await GetMedicalRecordByIdAsync(MRID);
            if (medicalRecords == null || !medicalRecords.Any()) return false;
            _context.MedicalRecords.RemoveRange(medicalRecords);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
