using Health.Application.DTO;
using Health.Domain;
using Health.Infrastructure.Contracts;
using Health.Infrastructure.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Health.Application.Services
{
    // This service layer contains business logic for appointments
    public class AppointmentService : IAppointmentService
    {
        private readonly IAppointmentContract _appointmentRepository;

        public AppointmentService()
        {
            _appointmentRepository = new AppointmentRepository();
        }

        public async Task<IEnumerable<AppointmentDTO>> GetAppointmentsAsync()
        {
            var appointments = await _appointmentRepository.GetAppointmentsAsync();
            return appointments.Select(a => new AppointmentDTO
            {
                AppointmentId = a.AppointmentId,
                PatientId = (int)a.PatientId,
                DoctorId = (int)a.DoctorId,
                AppointmentDate = a.AppointmentDate,
                Status = a.Status
            });
        }

        public async Task<AppointmentDTO> GetAppointmentByIdAsync(int id)
        {
            var appointment = await _appointmentRepository.GetAppointmentByIdAsync(id);
            if (appointment == null)
                return null;

            return new AppointmentDTO
            {
                AppointmentId = appointment.AppointmentId,
                PatientId = (int)appointment.PatientId,
                DoctorId = (int)appointment.DoctorId,
                AppointmentDate = appointment.AppointmentDate,
                Status = appointment.Status
            };
        }

        public async Task AddAppointmentAsync(AppointmentDTO appointment)
        {
            var appointmentDomain = new Appointment
            {
                AppointmentId = appointment.AppointmentId,
                PatientId = appointment.PatientId,
                DoctorId = appointment.DoctorId,
                AppointmentDate = appointment.AppointmentDate,
                Status = appointment.Status
            };
            await _appointmentRepository.AddAppointmentAsync(appointmentDomain);
        }

        public async Task UpdateAppointmentAsync(AppointmentDTO appointment)
        {
            var appointmentDomain = new Appointment
            {
                AppointmentId = appointment.AppointmentId,
                PatientId = appointment.PatientId,
                DoctorId = appointment.DoctorId,
                AppointmentDate = appointment.AppointmentDate,
                Status = appointment.Status
            };
            await _appointmentRepository.UpdateAppointmentAsync(appointmentDomain);
        }

        public async Task DeleteAppointmentAsync(int id)
        {
            await _appointmentRepository.DeleteAppointmentAsync(id);
        }

        /// <summary>
        /// Checks if an appointment exists for the same doctor within ±30 minutes of the given time.
        /// </summary>
        public async Task<bool> CheckAppointmentConflictAsync(int doctorId, DateTime appointmentDate, int? excludeAppointmentId = null)
        {
            var appointments = await _appointmentRepository.GetAppointmentsAsync();

            return appointments.Any(a =>
                a.DoctorId == doctorId &&
                (!excludeAppointmentId.HasValue || a.AppointmentId != excludeAppointmentId.Value) &&
                Math.Abs((a.AppointmentDate - appointmentDate).TotalMinutes) < 30
            );
        }
    }
}
