using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Health.Domain
{
    public class Doctor
    { // Represents a doctor in the health system
        // Each doctor is associated with a user account
        [Key]
        [Column(TypeName = "int")]
        public int DoctorId { get; set; }

        [Required(ErrorMessage = "User ID is required")]
        [Column(TypeName = "varchar(10)")]
        [ForeignKey("User")]
        public string UserID { get; set; }

        [Required(ErrorMessage = "Name is required")]
        [StringLength(50)]
        [Column(TypeName = "nvarchar(50)")]
        public string Name { get; set; }

        [Required(ErrorMessage = "Phone number is required")]
        [RegularExpression(@"^\d{10}$", ErrorMessage = "Phone number must be exactly 10 digits")]
        [StringLength(15)]
        [Column(TypeName = "varchar(15)")]
        public string PhoneNo { get; set; }

        [Required(ErrorMessage = "Speciality is required")]
        [StringLength(100)]
        [Column(TypeName = "nvarchar(100)")]
        public string Speciality { get; set; }

        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Invalid email format")]
        [StringLength(80)]
        [Column(TypeName = "varchar(80)")]
        public string Email { get; set; }

        public virtual User User { get; set; }
    }
}