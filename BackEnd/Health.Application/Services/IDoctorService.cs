using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Health.Application.DTO;
namespace Health.Application.Services
{
    public interface IDoctorService
    {   // Interface for Doctor service
        // Defines methods for managing doctor entities in the application layer.
        Task<IEnumerable<DoctorDTO>> GetDoctorsAsync();
        Task<DoctorDTO> GetDoctorByIdAsync(int DocId);
        Task AddDoctorAsync(DoctorDTO doctor);
        Task UpdateDoctorAsync(DoctorDTO doctor);
        Task DeleteDoctorAsync(int DocId);
        Task<IEnumerable<AppointmentDTO>> GetAppointmentsByDoctorIdAsync(int DocId);
    }
}
