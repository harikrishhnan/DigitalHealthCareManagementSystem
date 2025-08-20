using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Health.Application.DTO
{
    /// <summary>
    /// Data Transfer Object for a patient's medical record.
    /// </summary>
    public class MedicalRecordDTO
    {
        [Required(ErrorMessage = "Enter the Record ID")]
        public int RecordId { get; set; } // The unique identifier for the medical record.

        [Required(ErrorMessage = "Patient ID is required")]
        public int PatientId { get; set; } // Foreign key linking to the associated patient.

        [Required(ErrorMessage = "Doctor ID is required")]
        public int DoctorId { get; set; } // Foreign key linking to the doctor who created the record.

        [Required(ErrorMessage = "Diagnosis is required")]
        public string Diagnosis { get; set; } // The diagnosis determined by the doctor.

        [Required(ErrorMessage = "Treatment is required")]
        public string Treatment { get; set; } // The prescribed treatment plan or medication.

        [Required(ErrorMessage = "Date is required")]
        public DateTime Date { get; set; } // The date and time when the record was created.
    }
}