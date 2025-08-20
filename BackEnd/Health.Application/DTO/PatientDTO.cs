using Azure.Core;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory.Model;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace Health.Application.DTO
{
    /// <summary>
    /// Data Transfer Object for patient information.
    /// </summary>
    public class PatientDTO
    {
        //Data annotations for validation when this DTO is used as input(e.g., in an API request body).
        [Required(ErrorMessage = "Enter the Patient ID")]
        public int PatientId { get; set; } // The unique identifier for the patient record.

        [Required(ErrorMessage = "User ID is required")]
        public string? UserID { get; set; } // Foreign key linking to the associated user account.

        [Required(ErrorMessage = "Name is required")]
        public string PatientName { get; set; } // The full name of the patient.

        [Required(ErrorMessage = "Phone number is required")]
        [RegularExpression(@"^[7-9]{1}\d{9}$", ErrorMessage = "Please enter a valid 10-digit phone number starting with 7, 8, or 9")]
        public string PhoneNo { get; set; } // The patient's contact phone number.

        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Invalid email format")]
        public string Email { get; set; } // The patient's email address for communication.
    }
}