using Health.Application.DTO;
using Health.Application.Services;
using Health.Infrastructure.Contracts;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

// REMOVED: using BCrypt.Net; - This is no longer needed here.

namespace Health.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RegistrationController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IDoctorService _doctorService;
        private readonly IUserContract _userContract;
        private readonly IAdminService _adminService;
        private readonly IPatientService _patientService;

        public RegistrationController(IUserService userService, IDoctorService doctorService, IUserContract userContract, IAdminService adminService, IPatientService patientService)
        {
            _userService = userService;
            _doctorService = doctorService;
            _userContract = userContract;
            _adminService = adminService;
            _patientService = patientService;
        }
        /// <summary>
        ///  Registers a new doctor in the system.
        /// </summary>
        /// <param name="registrationDto">The registration data for the doctor.</param>
        /// <returns>201 if registration is successful, 400 if model state is invalid, 409 if user already exists</returns>
        [HttpPost("RegisterDoctor")]
        public async Task<ActionResult> RegisterDoctor([FromBody] DoctorRegDTO registrationDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var existingUser = await _userContract.GetUserByEmailAsync(registrationDto.Email);
            if (existingUser != null)
            {
                return Conflict(new { message = "A user with this email address already exists." });
            }

            string userId = await _userContract.GenerateUserIdAsync("DOCTOR");

            // --- CORRECTED ---
            // Create the UserDTO with the PLAIN-TEXT password.
            // The UserService will handle the hashing.
            var userDto = new UserDTO
            {
                UserId = userId,
                Email = registrationDto.Email,
                Password = registrationDto.Password, // Pass the plain-text password
                Role = "Doctor"
            };
            await _userService.AddUserAsync(userDto);

            var doctorDto = new DoctorDTO
            {
                UserID = userId,
                DocName = registrationDto.Name,
                PhoneNo = registrationDto.PhoneNo,
                Speciality = registrationDto.Speciality,
                Email = registrationDto.Email
            };
            await _doctorService.AddDoctorAsync(doctorDto);

            return StatusCode(201, new { message = "Doctor registration successful.", data = doctorDto });
        }
        /// <summary>
        ///  registers a new admin in the system.
        /// </summary>
        /// <param name="registrationDto">The registration data for the admin.</param>
        /// <returns>201 if registration is successful, 400 if model state is invalid, 409 if user already exists</returns>
        [HttpPost("RegisterAdmin")]
        public async Task<ActionResult> RegisterAdmin([FromBody] AdminRegDTO registrationDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var existingUser = await _userContract.GetUserByEmailAsync(registrationDto.Email);
            if (existingUser != null)
            {
                return Conflict(new { message = "A user with this email address already exists." });
            }

            string userId = await _userContract.GenerateUserIdAsync("ADMIN");

            // --- CORRECTED ---
            var userDto = new UserDTO
            {
                UserId = userId,
                Email = registrationDto.Email,
                Password = registrationDto.Password, // Pass the plain-text password
                Role = "Admin"
            };
            await _userService.AddUserAsync(userDto);

            var adminDto = new AdminDTO
            {
                UserID = userId,
                Name = registrationDto.Name,
                PhoneNo = registrationDto.PhoneNo,
                Email = registrationDto.Email
            };
            await _adminService.AddAdminAsync(adminDto);

            return StatusCode(201, new { message = "Admin registration successful.", data = adminDto });
        }
        /// <summary>
        /// registers a new patient in the system.
        /// </summary>
        /// <param name="registrationDto">The registration data for the patient.</param>
        /// <returns>201 if registration is successful, 400 if model state is invalid, 409 if user already exists</returns>
        [HttpPost("RegisterPatient")]
        public async Task<ActionResult> RegisterPatient([FromBody] PatientRegDTO registrationDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var existingUser = await _userContract.GetUserByEmailAsync(registrationDto.Email);
            if (existingUser != null)
            {
                return Conflict(new { message = "A user with this email address already exists." });
            }

            string userId = await _userContract.GenerateUserIdAsync("PATIENT");

            // --- CORRECTED ---
            var userDto = new UserDTO
            {
                UserId = userId,
                Email = registrationDto.Email,
                Password = registrationDto.Password, // Pass the plain-text password
                Role = "Patient"
            };
            await _userService.AddUserAsync(userDto);

            var patientDto = new PatientDTO
            {
                UserID = userId,
                PatientName = registrationDto.Name,
                PhoneNo = registrationDto.PhoneNo,
                Email = registrationDto.Email
            };
            await _patientService.AddPatientAsync(patientDto);

            return StatusCode(201, new { message = "Patient registration successful.", data = patientDto });
        }
    }
}
