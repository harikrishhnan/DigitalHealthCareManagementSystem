using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Health.Domain;

namespace Health.Infrastructure.Contracts
{
    public interface IPatientContract
    {
        // Method Signature: Asynchronously retrieves all patient entities.
        // Returns: A task that represents the asynchronous operation, containing an enumerable collection of Patient entities.
        Task<IEnumerable<Patient>> GetPatientsAsync();
        //Method Signature: Asynchronously retrieves a single patient entity by its ID.
        // Returns: A task that represents the asynchronous operation, containing the Patient entity or null if not found.
        Task<Patient> GetPatientByIdAsync(int id);
        // Method Signature: Asynchronously adds a new patient entity to the database.
        Task<Patient> AddPatientAsync(Patient patient);
        // Method Signature: Asynchronously updates an existing patient entity in the database.
        Task<Patient> UpdatePatientAsync(Patient patient);
        // Method Signature: Asynchronously deletes a patient entity by its ID.
        // Returns: A task that represents the asynchronous operation, containing a boolean indicating success or failure.
        Task<bool> DeletePatientAsync(int id);
        // Method Signature: Asynchronously retrieves a patient entity by its associated user ID.
        // Returns: A task that represents the asynchronous operation, containing the Patient entity or null if not found.
        Task<Patient> GetPatientByUserIdAsync(string userId);
    }
}
