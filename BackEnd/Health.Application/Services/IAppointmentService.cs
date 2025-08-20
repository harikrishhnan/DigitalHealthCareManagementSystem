using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Health.Application.DTO;

namespace Health.Application.Services // Services for managing appointments in the health application
{
    public interface IAppointmentService // Interface for appointment management services
    {
        Task<IEnumerable<AppointmentDTO>> GetAppointmentsAsync(); // Retrieves all appointments asynchronously
        Task<AppointmentDTO> GetAppointmentByIdAsync(int id); // Retrieves a specific appointment by ID asynchronously
        Task AddAppointmentAsync(DTO.AppointmentDTO appointment); // Adds a new appointment asynchronously
        Task<bool> CheckAppointmentConflictAsync(int doctorId, DateTime appointmentDate, int? excludeAppointmentId = null);

        Task UpdateAppointmentAsync(AppointmentDTO appointment); // Updates an existing appointment asynchronously
        Task DeleteAppointmentAsync(int id); // Deletes an appointment by ID asynchronously
    }
}