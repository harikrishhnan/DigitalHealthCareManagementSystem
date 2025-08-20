using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;

namespace Health.Application.DTO
{
    public class AppointmentDTO
    {
        // Properties for AppointmentDTO
        public int AppointmentId { get; set; } // Unique identifier for the appointment
        [Required(ErrorMessage = "Doctor ID is required")]
        public int DoctorId { get; set; } // ID of the doctor associated with the appointment
        [Required(ErrorMessage = "Patient ID is required")]
        public int PatientId { get; set; } // ID of the patient associated with the appointment
        [Required(ErrorMessage = "Appointment date is required")] 
        public DateTime AppointmentDate { get; set; } // Date and time of the appointment
        [Required(ErrorMessage = "Status is required")]
        [RegularExpression(@"^(Scheduled|Completed|Cancelled)$", ErrorMessage = "Status must be either 'Scheduled', 'Completed', or 'Cancelled'")]
        public string Status { get; set; } // Status of the appointment (Scheduled, Completed, Cancelled)

    }
}
