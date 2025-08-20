using System;
using System.ComponentModel.DataAnnotations;

namespace Health.Application.DTO
{
    public class AdminDTO
    {
        [Required(ErrorMessage = "Admin ID is required")]
        public int AdminId { get; set; } // Unique identifier for the admin

        [Required(ErrorMessage = "User ID is required")]
        [StringLength(10, ErrorMessage = "User ID must be 10 characters")]
        public string UserID { get; set; }// Foreign key to the User entity

        [Required(ErrorMessage = "Name is required")]
        [StringLength(50, ErrorMessage = "Name too long")]
        public string Name { get; set; }// Name of the admin

        [Required(ErrorMessage = "Phone number is required")]
        [RegularExpression(@"^[7-9]{1}\d{9}$", ErrorMessage = "Invalid phone number (must start with 7-9 and be 10 digits)")]
        public string PhoneNo { get; set; }// Phone number of the admin

        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Invalid email format")]
        [StringLength(80, ErrorMessage = "Email too long")]
        public string Email { get; set; }// Email address of the admin

    }
}