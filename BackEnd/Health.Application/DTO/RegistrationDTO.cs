using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
namespace Health.API.Controllers
{ // This namespace contains DTOs for user registration
    public class AdminRegDTO
    { // This DTO is used for registering an admin
        [EmailAddress]
        public string Email { get; set; } // Email address of the admin
        [Required]
        [MinLength(8)]
        public string Password { get; set; }// Password for the admin account
        [Required]
        public string Name { get; set; }// Name of the admin
        [Required]
        [Phone]
        public string PhoneNo { get; set; }// Phone number of the admin


    }
    public class DoctorRegDTO
    { // This DTO is used for registering a doctor

        [EmailAddress]
        public string Email { get; set; }// Email address of the doctor

        [Required]
        [MinLength(8)]
        public string Password { get; set; }// Password for the doctor account

        [Required]
        public string Name { get; set; }// Name of the doctor

        [Required]
        [Phone]
        public string PhoneNo { get; set; }// Phone number of the doctor

        [Required]
        public string Speciality { get; set; }// Speciality of the doctor
    }
    public class PatientRegDTO
    { // This DTO is used for registering a patient
        [EmailAddress]
        public string Email { get; set; }   // Email address of the patient
        [Required]
        [MinLength(8)]
        public string Password { get; set; }   // Password for the patient account
        [Required]
        public string Name { get; set; }   // Name of the patient
        [Required]
        [Phone]
        public string PhoneNo { get; set; }   // Phone number of the patient
    }
}