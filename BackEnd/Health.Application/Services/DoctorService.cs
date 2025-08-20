using Health.Application.DTO;
using Health.Domain;
using Health.Infrastructure.Contracts;
using System.Collections.Generic;
using System.Linq;
using System.Numerics;
using System.Threading.Tasks;
using Health.Application.Services;
namespace Health.Application.Services
{
    public class DoctorService : IDoctorService
    { // This class implements the IDoctorService interface and provides methods for managing doctor entities.
        private readonly IDoctorContract _doctorRepository;
        private readonly IUserService _userService;
        private readonly IAppointmentService _appointmentService;
        private readonly IMedicalRecordService _medicalRecordService;
        // Inject dependencies through the constructor 
        public DoctorService(IDoctorContract doctorRepository, IUserService userService, IAppointmentService appointmentService, IMedicalRecordService medicalRecordService)
        { // Initialize the repository and services
            _doctorRepository = doctorRepository;
            _userService = userService;
            _appointmentService = appointmentService;
            _medicalRecordService = medicalRecordService;
        }

        /// <summary>
        /// Gets all doctors from the repository and maps them to DoctorDTOs.
        /// </summary>
        /// <returns>All Doctor Details</returns>
        public async Task<IEnumerable<DoctorDTO>> GetDoctorsAsync()
        {
            var doctors = await _doctorRepository.GetDoctorsAsync();
            var doctorDTOs = doctors.Select(d => new DoctorDTO
            {
                DoctorId = d.DoctorId,
                UserID = d.UserID,
                DocName = d.Name,
                PhoneNo = d.PhoneNo,
                Speciality = d.Speciality,
                Email = d.Email
            });
            return doctorDTOs;
        }
        /// <summary>
        /// Gets a doctor by their ID.
        /// </summary>
        /// <param name="DocId">Doctor Id used to retrieve the doctor</param>
        /// <returns>Doctor Details</returns>
        /// <exception cref="System.Exception">Thrown when the doctor with the specified ID is not found</exception>
        public async Task<DoctorDTO> GetDoctorByIdAsync(int DocId)
        {
            var doctorDomain = await _doctorRepository.GetDoctorByIdAsync(DocId);
            if (doctorDomain == null)
            {
                throw new Exception($"Doctor with ID {DocId} not found.");

            }
            var doctorDto = new DoctorDTO
            {
                DoctorId = doctorDomain.DoctorId,
                UserID = doctorDomain.UserID,
                DocName = doctorDomain.Name,
                PhoneNo = doctorDomain.PhoneNo,
                Speciality = doctorDomain.Speciality,
                Email = doctorDomain.Email
            };
            return doctorDto;
        }

        /// <summary>
        /// Adds a new doctor.
        /// </summary>
        /// <param name="doctor"></param>
        /// <returns></returns>
        /// <exception cref="System.ArgumentNullException"></exception>
        public async Task AddDoctorAsync(DoctorDTO doctor)
        {
            if (doctor == null)
            {
                throw new System.ArgumentNullException(nameof(doctor), "Doctor cannot be null");
            }
            var doctorDomain = new Doctor
            {
                DoctorId = doctor.DoctorId,
                UserID = doctor.UserID,
                Name = doctor.DocName,
                PhoneNo = doctor.PhoneNo,
                Speciality = doctor.Speciality,
                Email = doctor.Email
            };
            await _doctorRepository.AddDoctorAsync(doctorDomain);
        }

        /// <summary>
        /// updates an existing doctor's information.
        /// </summary>
        /// <param name="doctor"></param>
        /// <returns> Updated doctor details </returns>
        /// <exception cref="System.ArgumentNullException"></exception>
        public async Task UpdateDoctorAsync(DoctorDTO doctor)
        {
          
            var doctorUpdate = new Doctor
            {
                DoctorId = doctor.DoctorId,
                UserID = doctor.UserID,
                Name = doctor.DocName,
                PhoneNo = doctor.PhoneNo,
                Speciality = doctor.Speciality,
                Email = doctor.Email
            };
            await _doctorRepository.UpdateDoctorAsync(doctorUpdate);
        }

        /// <summary>
        /// deletes a doctor by their ID and also deletes the associated user.
        /// </summary>
        /// <param name="DocId"></param>
        /// <returns></returns>
        /// <exception cref="Exception">Thrown when the doctor with the specified ID is not found</exception>
        public async Task DeleteDoctorAsync(int DocId)
        {
            var doctor = await _doctorRepository.GetDoctorByIdAsync(DocId);
            if (doctor == null)
            {
                throw new Exception($"Doctor with ID {DocId} not found.");
            }
            await _doctorRepository.DeleteDoctorAsync(DocId);
            await _userService.DeleteUserAsync(doctor.UserID);

        }


        /// <summary>
        /// gets all upcoming appointments for a specific doctor by their ID.
        /// </summary>
        /// <param name="DocId">Doctor ID</param>
        /// <returns>List of upcoming appointments for the specified doctor</returns>
        /// <exception cref="Exception">Thrown when no upcoming appointments are found for the specified doctor</exception>
        public async Task<IEnumerable<AppointmentDTO>> GetAppointmentsByDoctorIdAsync(int DocId)
        { // Retrieves all appointments and filters them by the specified doctor's ID
            var appointments = await _appointmentService.GetAppointmentsAsync();
            var doctorAppointments = appointments.Where(a => a.DoctorId == DocId ).ToList();
            if (doctorAppointments == null || !doctorAppointments.Any())
            {
                throw new Exception($"No upcoming appointments found for Doctor with ID {DocId}.");
            }
            else
            {
                return doctorAppointments.Select(a => new AppointmentDTO
                {   DoctorId = a.DoctorId,
                    AppointmentId = a.AppointmentId,
                    PatientId = a.PatientId,
                    AppointmentDate = a.AppointmentDate,
                    Status = a.Status
                });
            }
        }
       

    }
}