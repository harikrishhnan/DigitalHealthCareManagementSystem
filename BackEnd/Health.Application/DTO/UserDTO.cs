using System.ComponentModel.DataAnnotations;

namespace Health.Application.DTO
{
    /// <summary>
    /// Data Transfer Object for creating a new user.
    /// </summary>
    public class UserDTO
    {
        [Required(ErrorMessage = "User ID is required")]
        public string UserId { get; set; } // The unique identifier for the user.

        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Invalid email format")]
        public string Email { get; set; } // The user's email address, used for login and communication.

        [Required(ErrorMessage = "Role is required")]
        public string Role { get; set; } // The role assigned to the user (e.g., "Admin", "Patient", "Doctor").

        [Required(ErrorMessage = "Password is required")]
        public string Password { get; set; }
    }
}