using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Health.Domain
{
    public class User
    {
        [Key]
        [Column(TypeName = "varchar(10)")]
        public string UserId { get; set; }

        [Required(ErrorMessage = "Password is required")]
        [StringLength(256)]
        [Column(TypeName = "nvarchar(256)")]
        public string PasswordHash { get; set; }

        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Invalid email format")]
        [StringLength(80)]
        [Column(TypeName = "varchar(80)")]
        public string Email { get; set; }

        [StringLength(50)]
        [Column(TypeName = "nvarchar(50)")]
        [EnumDataType(typeof(UserRole))]
        public string Role { get; set; }
    }

    public enum UserRole
    {
        Doctor,
        Patient,
        Admin
    }
}