using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Health.Domain
{
    public class Patient
    {
        [Key] //Designates PatientId as the primary key for the database table.
        [Column(TypeName = "int")]
        public int PatientId { get; set; } //Unique identifier for the patient.

        [Required(ErrorMessage = "User ID is required")]
        [Column(TypeName = "varchar(10)")]
        [ForeignKey("User")]
        public string UserID { get; set; } //Foreign key linking to the associated User account (for login).

        [Required(ErrorMessage = "Name is required")]
        [StringLength(50)]
        [Column(TypeName = "nvarchar(50)")]
        public string PatientName { get; set; }

        [Required(ErrorMessage = "Phone number is required")]
        [RegularExpression(@"^\d{10}$", ErrorMessage = "Phone number must be exactly 10 digits")] //Validates phone number format (exactly 10 digits).
        [StringLength(15)]
        [Column(TypeName = "varchar(15)")]
        public string PhoneNo { get; set; }

        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Invalid email format")]
        [StringLength(80)]
        [Column(TypeName = "varchar(80)")]
        public string Email { get; set; }
        public virtual User User { get; set; } // Navigation property to the associated User entity.
    }
}