using Health.Application.DTO;
using Health.Domain;
using Health.Infrastructure.Contracts;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Health.Application.Services
{
    public class PatientService : IPatientService
    {
        private readonly IPatientContract _patientRepository; //A private, read-only instance of the patient repository (dependency). Used to access patient data.
        private readonly IUserService _userService; //A private, read-only instance of the user service (dependency). Used for user-related operations (e.g., deleting associated user).
        private readonly IAppointmentService _appointmentService; //A private, read-only instance of the appointment service (dependency). Used to get patient appointments.

        public PatientService(IPatientContract patientRepository, IUserService userService, IAppointmentService appointmentService) // Constructor: Injects dependencies (repository and other services)
        {
            _patientRepository = patientRepository;
            _userService = userService;
            _appointmentService = appointmentService;
        }

        public async Task<IEnumerable<PatientDTO>> GetPatientsAsync()
        {
            var patients = await _patientRepository.GetPatientsAsync(); //Fetches domain Patient entities from the database.
            return patients.Select(p => new PatientDTO //// LINQ Method: Maps each Patient domain entity to a PatientDTO
            {
                PatientId = p.PatientId,
                UserID = p.UserID,
                PatientName = p.PatientName,
                PhoneNo = p.PhoneNo,
                Email = p.Email
            });
        }

        public async Task<PatientDTO> GetPatientByIdAsync(int id)
        {
            var patient = await _patientRepository.GetPatientByIdAsync(id); //Fetches a single Patient domain entity.
            if (patient == null)
            {
                return null;
            }
            return new PatientDTO // Maps the found Patient domain entity to a PatientDTO.
            {
                PatientId = patient.PatientId,
                UserID = patient.UserID,
                PatientName = patient.PatientName,
                PhoneNo = patient.PhoneNo,
                Email = patient.Email
            };
        }

        public async Task AddPatientAsync(PatientDTO patient)
        {
            var patientDomain = new Patient //Creates a new Patient domain entity from the PatientDTO
            {
                PatientId = patient.PatientId, //PatientId for new patient should ideally be set by DB or removed from input DTO.
                UserID = patient.UserID,
                PatientName = patient.PatientName,
                PhoneNo = patient.PhoneNo,
                Email = patient.Email
            };
            await _patientRepository.AddPatientAsync(patientDomain);
        }

        public async Task UpdatePatientAsync(PatientDTO patient)
        {
            var patientUpdate = new Patient //Creates a Patient domain entity from the DTO.
            {
                PatientId = patient.PatientId,
                UserID = patient.UserID,
                PatientName = patient.PatientName,
                PhoneNo = patient.PhoneNo,
                Email = patient.Email
            };
            await _patientRepository.UpdatePatientAsync(patientUpdate);
        }

        public async Task DeletePatientAsync(int id)
        {
            var patient = await _patientRepository.GetPatientByIdAsync(id);
            if (patient == null)
            {
                throw new KeyNotFoundException($"Patient with ID {id} not found.");
            }
            await _patientRepository.DeletePatientAsync(id);
            await _userService.DeleteUserAsync(patient.UserID); //Deletes the associated user account. 
        }



        /// <summary>
        /// Retrieves all appointments for a specific patient.
        /// </summary>
        /// <param name="PatientId">The ID of the patient to retrieve appointments for.</param>
        /// <returns>A list of appointment DTOs for the specified patient.</returns>
        /// <exception cref="KeyNotFoundException">Thrown if no appointments are found for the patient.</exception>
        public async Task<IEnumerable<AppointmentDTO>> GetAppointmentsByPatientIdAsync(int PatientId)
        {
            var appointments = await _appointmentService.GetAppointmentsAsync();
            var patientAppointments = appointments.Where(a => a.PatientId == PatientId).ToList(); // Filters appointments by PatientId.
            if (!patientAppointments.Any())
            {
                throw new KeyNotFoundException($"No appointments found for Patient with ID {PatientId}.");
            }
            return patientAppointments.Select(a => new AppointmentDTO  // LINQ Method: Maps found appointments to AppointmentDTOs.
            {
                AppointmentId = a.AppointmentId,
                PatientId = a.PatientId,
                DoctorId = a.DoctorId,
                AppointmentDate = a.AppointmentDate,
                Status = a.Status
            });
        }
    }
}