using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Health.Domain;
namespace Health.Infrastructure.Contracts
{
	public interface IDoctorContract
    {   // Interface for Doctor repository
        // Defines methods for managing doctor entities in the repository.
        // These methods will be implemented in the DoctorRepository class.

        // Get All Doctors
        Task<IEnumerable<Doctor>> GetDoctorsAsync();
        // Get Doctor by ID
        Task<Doctor> GetDoctorByIdAsync(int docid);
        // Add a new Doctor
        Task<Doctor> AddDoctorAsync(Doctor doctor);
        // Update an existing Doctor
        Task<Doctor> UpdateDoctorAsync(Doctor doctor);
        // Delete a Doctor by ID
        Task<bool> DeleteDoctorAsync(int docid);

        Task<Doctor> GetDoctorByUserIdAsync(string userId);
    } 
}
