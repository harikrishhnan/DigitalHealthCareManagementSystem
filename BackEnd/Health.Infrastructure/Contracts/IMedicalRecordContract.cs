using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Health.Domain;

namespace Health.Infrastructure.Contracts
{
    public interface IMedicalRecordContract
    {
        Task<IEnumerable<MedicalRecord>> GetMedicalRecordsAsync();
        Task<IEnumerable<MedicalRecord>> GetMedicalRecordByPatientIdAsync(int PatientId);
        Task<MedicalRecord> AddMedicalRecordAsync(MedicalRecord medicalRecord);
        Task<MedicalRecord> UpdateMedicalRecordAsync(MedicalRecord medicalRecord);
        Task<bool> DeleteMedicalRecordAsync(int PatientId);
    }
}
