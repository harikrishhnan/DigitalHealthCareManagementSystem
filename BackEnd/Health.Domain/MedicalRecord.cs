using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Health.Domain
{
    public class MedicalRecord
    {
        [Key]
        [Column(TypeName = "int")]
        public int RecordId { get; set; }

     
        public int? PatientId { get; set; }
        
        public int? DoctorId { get; set; }

        [Required(ErrorMessage = "Diagnosis is required")]
        [StringLength(500)]
        [Column(TypeName = "nvarchar(500)")]
        public string Diagnosis { get; set; }

        [Required(ErrorMessage = "Treatment is required")]
        [StringLength(500)]
        [Column(TypeName = "nvarchar(500)")]
        public string Treatment { get; set; }

        [Required(ErrorMessage = "Date is required")]
        public DateTime Date { get; set; }

        public virtual Patient? Patient { get; set; }
        public virtual Doctor? Doctor { get; set; }
    }
}