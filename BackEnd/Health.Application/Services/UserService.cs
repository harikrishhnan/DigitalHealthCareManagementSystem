using Health.Application.DTO;
using Health.Domain;
using Health.Infrastructure.Contracts;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity; // For password hashing
using System.Linq;
using System.Threading.Tasks;

namespace Health.Application.Services
{
    public class UserService : IUserService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;// For accessing the current HTTP context, if needed
        private readonly IUserContract _userRepository;// Repository for user data access
        private readonly IPasswordHasher<User> _passwordHasher;// For securely hashing and verifying passwords
        private readonly IDoctorContract _doctorContract;// Contract for doctor-related operations
        private readonly IPatientContract _patientContract;// Contract for patient-related operations
        private readonly IAdminContract _adminContract;// Contract for admin-related operations
        
        // Constructor with dependency injection for the repository and password hasher
        public UserService(IUserContract userRepository, IPasswordHasher<User> passwordHasher,
                           IDoctorContract doctorContract, IPatientContract patientContract, IAdminContract adminContract , IHttpContextAccessor httpContextAccessor)
        {
            _userRepository = userRepository;
            _passwordHasher = passwordHasher;
            _doctorContract = doctorContract;
            _patientContract = patientContract;
            _adminContract = adminContract;
            _httpContextAccessor = httpContextAccessor;
        }

        // --- CORE AUTHENTICATION METHODS ---

        /// <summary>
        /// Authenticates a user by verifying their email and password against the stored hash.
        /// </summary>
        public async Task<User?> AuthenticateAsync(string email, string password)
        {
            // 1. Get the user from the repository by their email.
            var user = await _userRepository.GetUserByEmailAsync(email);

            // 2. If no user is found, authentication fails.
            if (user == null)
            {
                return null;
            }

            // 3. Verify the provided password against the user's stored hash.
            var result = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, password);

            // 4. If the password is correct, return the user. Otherwise, return null.
            return result == PasswordVerificationResult.Success ? user : null;
        }

        /// <summary>
        /// Adds a new user to the system, hashing their password for secure storage.
        /// This is called by your RegistrationController.
        /// </summary>
        public async Task AddUserAsync(UserDTO userDto)
        {
            var user = new User
            {
                UserId = userDto.UserId,
                Email = userDto.Email,
                Role = userDto.Role
                // Note: We get the plain-text password from the DTO
            };

            // Hash the password from the DTO before saving
            user.PasswordHash = _passwordHasher.HashPassword(user, userDto.Password);//the parameter is the plain-text password and the user object

            await _userRepository.AddUserAsync(user);
        }

        /// <summary>
        /// Registers a new user. This method is also now secure.
        /// </summary>
        public async Task<(bool, string)> RegisterUserAsync(RegisterDto model)
        {
            var existingUser = await _userRepository.GetUserByEmailAsync(model.Email);
            if (existingUser != null)
            {
                return (false, "A user with this email already exists.");
            }

            var user = new User
            {
                UserId = model.UserId,
                Email = model.Email,
                Role = model.Role,
            };

            // Securely hash the password before creating the user
            user.PasswordHash = _passwordHasher.HashPassword(user, model.Password);

            await _userRepository.AddUserAsync(user);
            return (true, "User registered successfully.");
        }
        /// <summary>
        /// Gets the currently logged-in user's ID from JWT claims.
        /// </summary>
        private string? GetCurrentUserId()
        {
            return _httpContextAccessor.HttpContext?.User.FindFirst("uid")?.Value;
        }
         
        public async Task<int?> GetEntityIdByUserIdAsync()
        {
            string userId = GetCurrentUserId();
            // Determine the user's role and fetch the corresponding entity ID
            var user = await _userRepository.GetUserByIdAsync(userId);
            if (user == null) return null;
            switch (user.Role.ToLower())
            {
                case "doctor":
                    var doctor = await _doctorContract.GetDoctorByUserIdAsync(userId);
                    int doctorId = doctor.DoctorId;
                    return doctorId;
                case "patient":
                    var patient = await _patientContract.GetPatientByUserIdAsync(userId);
                    int patientId = patient.PatientId;
                    return patientId;
                case "admin":
                    var admin = await _adminContract.GetAdminByUserIdAsync(userId);
                    int adminId = admin.AdminId;
                    return adminId;
                default:
                    return null; // Unknown role
            }
        }

        // --- OTHER CRUD METHODS (UNCHANGED) ---

        public async Task<IEnumerable<UserDTO>> GetUsersAsync()
        {
            var users = await _userRepository.GetUsersAsync();
            // IMPORTANT: Never return the password hash in a public DTO.
            return users.Select(u => new UserDTO
            {
                UserId = u.UserId,
                Email = u.Email,
                Role = u.Role
            });
        }

        public async Task<UserDTO?> GetUserByIdAsync(string id)
        {
            var user = await _userRepository.GetUserByIdAsync(id);
            if (user == null) return null;

            // IMPORTANT: Never return the password hash in a public DTO.
            return new UserDTO
            {
                UserId = user.UserId,
                Email = user.Email,
                Role = user.Role
            };
        }

        public async Task UpdateUserAsync(UserDTO userDto)
        {
            // Note: This implementation assumes you are not updating the password here.
            // If you need to update a password, you would need a separate method
            // that specifically handles hashing the new password.
            var user = await _userRepository.GetUserByIdAsync(userDto.UserId);
            if (user != null)
            {
                user.Email = userDto.Email;
                user.Role = userDto.Role;
                user.PasswordHash = _passwordHasher.HashPassword(user, userDto.Password);
                await _userRepository.UpdateUserAsync(user);
            }
        }

        public async Task DeleteUserAsync(string id)
        {
            await _userRepository.DeleteUserAsync(id);

        }
    }
}