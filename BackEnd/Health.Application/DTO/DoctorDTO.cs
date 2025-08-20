using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Health.Application.DTO
{
    public class DoctorDTO
    { // This class represents a Data Transfer Object (DTO) for Doctor entity.
        [Required(ErrorMessage = "Enter the Doctor ID")]
        public int DoctorId { get; set; } // Unique identifier for the doctor
        [Required(ErrorMessage = "User ID is required")]
        public string UserID { get; set; } // Foreign key to the User entity
        [Required(ErrorMessage = "Name is required")]
        public string DocName { get; set; }// Name of the doctor
        [Required(ErrorMessage = "Phone number is required")]
        [RegularExpression(@"^\d{10}$", ErrorMessage ="Pls Enter Valid Phone Number")] 
        public string PhoneNo { get; set; }// Phone number of the doctor
        [Required(ErrorMessage = "Speciality is required")]
        public string Speciality { get; set; }// Speciality of the doctor

        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Invalid email format")]
        public string Email { get; set; }// Email address of the doctor

    }
}
