using Health.Domain;
using Health.Infrastructure.Contracts;
using Health.Infrastructure.DBContext;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Health.Infrastructure.Repositories
{
    // This code is part of the Health.Infrastructure.Repositories namespace, which contains repository classes for data access.
    public class AppointmentRepository : IAppointmentContract
    {
        private readonly HealthDBContextDbContext _context;

        // Constructor initializes the HealthDBContextDbContext instance
        public AppointmentRepository()
        {
            _context = new HealthDBContextDbContext();
        }

        // Method to get all appointments asynchronously
        public async Task<IEnumerable<Appointment>> GetAppointmentsAsync()
        {
            // Fetch all appointments (tracking enabled by default)
            return await _context.Appointments.ToListAsync();
        }

        // Method to get an appointment by ID asynchronously
        public async Task<Appointment> GetAppointmentByIdAsync(int id)
        {
            // Fetch an appointment by ID (AsNoTracking ensures read-only query)
            return await _context.Appointments
                .AsNoTracking()
                .FirstOrDefaultAsync(a => a.AppointmentId == id);
        }

        // Method to add a new appointment asynchronously
        public async Task<Appointment> AddAppointmentAsync(Appointment appointment)
        {
            _context.Appointments.Add(appointment);
            await _context.SaveChangesAsync();
            return appointment;
        }

        // Method to update an existing appointment asynchronously
        public async Task<Appointment> UpdateAppointmentAsync(Appointment appointment)
        {
            // Load the existing appointment (tracked entity)
            var existingAppointment = await _context.Appointments
                .FirstOrDefaultAsync(a => a.AppointmentId == appointment.AppointmentId);

            if (existingAppointment == null)
                return null;

            // Update only the changed fields
            existingAppointment.PatientId = appointment.PatientId;
            existingAppointment.DoctorId = appointment.DoctorId;
            existingAppointment.AppointmentDate = appointment.AppointmentDate;
            existingAppointment.Status = appointment.Status;

            await _context.SaveChangesAsync();
            return existingAppointment;
        }

        // Method to delete an appointment by ID asynchronously
        public async Task<bool> DeleteAppointmentAsync(int id)
        {
            var appointment = await _context.Appointments
                .FirstOrDefaultAsync(a => a.AppointmentId == id);

            if (appointment == null) return false;

            _context.Appointments.Remove(appointment);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
