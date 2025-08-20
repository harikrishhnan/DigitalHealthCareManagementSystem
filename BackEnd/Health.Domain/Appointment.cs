using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Health.Domain
{
    public class Appointment
    {
        [Key]
        [Column(TypeName = "int")]
        public int AppointmentId { get; set; }

      
        public int? DoctorId { get; set; }

       
        public int? PatientId { get; set; }

        [Required(ErrorMessage = "Appointment date and time are required")]
        public DateTime AppointmentDate { get; set; }

        [Required(ErrorMessage = "Status is required")]
        [StringLength(20)]
        [Column(TypeName = "varchar(20)")]
        [RegularExpression(@"^(Scheduled|Completed|Cancelled)$", ErrorMessage = "Status must be either 'Scheduled', 'Completed', or 'Cancelled'")]
        public string Status { get; set; }
        public virtual Doctor? Doctor { get; set; }
        public virtual Patient? Patient { get; set; }
    }
}