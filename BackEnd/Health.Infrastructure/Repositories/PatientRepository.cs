using Health.Domain;
using Health.Infrastructure.Contracts;
using Health.Infrastructure.DBContext;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Health.Infrastructure.Repositories
{
    // This code is part of the Health.Infrastructure.Repositories namespace, which contains repository classes for data access.
    public class PatientRepository : IPatientContract
    {
        // This class implements the IPatientContract interface for patient-related operations
        private readonly HealthDBContextDbContext _context; //A private, read-only instance of the database context. Used to interact with the database.
        // Constructor initializes the HealthDBContextDbContext instance
        public PatientRepository()
        {
            // Initialize the database context for accessing patient data
            _context = new HealthDBContextDbContext(); //Creates a new instance of the database context.
        }
        // method to get all patients asynchronously
        public async Task<IEnumerable<Domain.Patient>> GetPatientsAsync()
        {
            // Fetch all patients from the database asynchronously
            return await _context.Patients.ToListAsync();
        }
        // Method to get a patient by ID asynchronously
        public async Task<Domain.Patient> GetPatientByIdAsync(int id)
        {
            // Fetch a patient by ID from the database asynchronously
            return await _context.Patients.FindAsync(id);
        }
        // Method to add a new patient asynchronously
        public async Task<Domain.Patient> AddPatientAsync(Domain.Patient patient)
        {
            // Validate the patient object before adding it to the database
            _context.Patients.Add(patient);
            await _context.SaveChangesAsync();
            return patient;
        }
        // Method to update an existing patient asynchronously
        public async Task<Domain.Patient> UpdatePatientAsync(Domain.Patient patient)
        {
            // Validate the patient object before updating it in the database
            _context.Patients.Update(patient);
            await _context.SaveChangesAsync();
            return patient;
        }
        // Method to delete a patient by ID asynchronously
        public async Task<bool> DeletePatientAsync(int id)
        {
            // Validate the ID and remove the patient from the database if it exists
            var patient = await GetPatientByIdAsync(id);
            if (patient == null) return false;
            _context.Patients.Remove(patient);
            await _context.SaveChangesAsync();
            return true;
        }
        public async Task<Patient> GetPatientByUserIdAsync(string userId)
        {
            return await _context.Patients
                .FirstOrDefaultAsync(p => p.UserID == userId);
        }
    }
}
