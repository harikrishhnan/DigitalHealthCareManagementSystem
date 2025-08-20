using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Health.Application.DTO;

namespace Health.Application.Services
{
    // This interface defines the contract for Patient-related operations
    public interface IPatientService
    {
        //Asynchronously retrieves all patients, returning them as DTOs.
        Task<IEnumerable<PatientDTO>> GetPatientsAsync();
        //Asynchronously retrieves a single patient by ID, returning it as a DTO.
        Task<PatientDTO> GetPatientByIdAsync(int id);
        //Asynchronously adds a new patient. Takes a PatientDTO as input.
        Task AddPatientAsync(DTO.PatientDTO patient);
        //Asynchronously updates an existing patient. Takes a PatientDTO as input.
        Task UpdatePatientAsync(PatientDTO patient);
        Task DeletePatientAsync(int id);
        //Asynchronously retrieves appointments for a specific patient.
        // Takes the patient's ID as input and returns a collection of AppointmentDTOs.
        Task<IEnumerable<AppointmentDTO>> GetAppointmentsByPatientIdAsync(int patientId); // Retrieves appointments for a specific patient
    }
}
