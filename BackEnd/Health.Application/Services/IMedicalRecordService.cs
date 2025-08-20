using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Health.Application.DTO;

namespace Health.Application.Services
{
    public interface IMedicalRecordService
    {
        Task<IEnumerable<MedicalRecordDTO>> GetMedicalRecordsAsync();
        Task<IEnumerable<MedicalRecordDTO>> GetMedicalRecordByPatientIdAsync(int PatientId);
        Task AddMedicalRecordAsync(MedicalRecordDTO medicalRecord);
        Task UpdateMedicalRecordAsync(MedicalRecordDTO medicalRecord);
        Task DeleteMedicalRecordAsync(int PatientId);
    }
}
