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
    public class DoctorRepository: IDoctorContract
{
    // Repository for managing Doctor entities
    private readonly HealthDBContextDbContext _context;
        public DoctorRepository()
        {
            _context = new HealthDBContextDbContext();
        }

        // Get all doctors
        /// <summary>
        /// gets all doctors from the database asynchronously.
        /// </summary>
        /// <returns>A list of doctors.</returns>
        public async Task<IEnumerable<Domain.Doctor>> GetDoctorsAsync()
        {
            // Fetch all doctors from the database asynchronously
            return await _context.Doctors.ToListAsync();
        }

        //Get a doctor by ID
        /// <summary>
        /// Gets a doctor by their ID asynchronously.
        /// </summary>
        /// <param name="Docid">The ID of the doctor to retrieve.</param>
        /// <returns>The doctor with the specified ID, or null if not found.</returns>
        public async Task<Domain.Doctor> GetDoctorByIdAsync(int Docid)
        {
            // Fetch a doctor by ID from the database asynchronously
            return await _context.Doctors.FindAsync(Docid); 
        }

        // Add a new doctor
        /// <summary>
        /// adds a new doctor to the database asynchronously.
        /// </summary>
        /// <param name="doctor"></param>
        /// <returns>Added Doctor details</returns>
        public async Task<Domain.Doctor> AddDoctorAsync(Domain.Doctor doctor)
        {
            // Validate the doctor object before adding it to the database
            _context.Doctors.Add(doctor);
            await _context.SaveChangesAsync();
            return doctor;
        }

        /// <summary>
        /// updates an existing doctor in the database asynchronously.
        /// </summary>
        /// <param name="doctor">The doctor to update.</param>
        /// <returns>The updated doctor details.</returns>
        // Update an existing doctor
        public async Task<Domain.Doctor> UpdateDoctorAsync(Domain.Doctor doctor)
        {
            // Validate the doctor object before updating it in the database
            _context.Doctors.Update(doctor);
            await _context.SaveChangesAsync();
            return doctor;
        }

        // Delete a doctor by ID
        /// <summary>
        /// Deletes a doctor by their ID asynchronously.
        /// </summary>
        /// <param name="Docid">The ID of the doctor to delete.</param>
        /// <returns>True if the doctor was deleted, false if not found.</returns>
        public async Task<bool> DeleteDoctorAsync(int Docid)
        {
            // Validate the ID and remove the doctor from the database if it exists
            var doctor = await GetDoctorByIdAsync(Docid);
            if (doctor == null) return false;
            _context.Doctors.Remove(doctor);
            await _context.SaveChangesAsync();
            return true;
        }
        /// <summary>
        /// Retrieves a doctor associated with the specified user ID.
        /// </summary>
        /// <param name="userId">The unique identifier of the user whose associated doctor is to be retrieved. Cannot be null or empty.</param>
        /// <returns>A <see cref="Domain.Doctor"/> object representing the doctor associated with the specified user ID,  or <see
        /// langword="null"/> if no matching doctor is found.</returns>
        public async Task<Domain.Doctor> GetDoctorByUserIdAsync(string userId)
        {
            return await _context.Doctors
                .FirstOrDefaultAsync(d => d.UserID == userId);
        }
    }
}
