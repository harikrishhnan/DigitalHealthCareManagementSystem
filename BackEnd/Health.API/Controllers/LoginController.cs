using Health.Application.DTO;
using Health.Application.Services;
using Health.Domain;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Health.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LoginController : ControllerBase
    {
        // This controller handles user authentication and issues JSON Web Tokens (JWTs).
        private readonly IConfiguration _configuration;
        private readonly IUserService _userService;

        /// <summary>
        /// Initializes a new instance of the LoginController.
        /// </summary>
        /// <param name="configuration">The application configuration for accessing JWT settings.</param>
        /// <param name="userService">The user service for handling authentication logic.</param>
        public LoginController(IConfiguration configuration, IUserService userService)
        {
            _configuration = configuration;
            _userService = userService;
        }

        /// <summary>
        /// Authenticates a user based on email and password.
        /// </summary>
        /// <param name="model">The login data transfer object containing the user's credentials.</param>
        /// <returns>An OK result with the JWT if successful, or an Unauthorized result if credentials are invalid.</returns>
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto model)
        {
            // Attempt to authenticate the user using the provided credentials.
            var user = await _userService.AuthenticateAsync(model.Email, model.Password);

            // If authentication fails (user is null), return a 401 Unauthorized response.
            if (user == null)
            {
                return Unauthorized("Invalid credentials.");
            }

            // If authentication is successful, generate a JWT for the user.
            var token = GenerateJwtToken(user);

            // Return the generated token in the response.
            return Ok(new { token });
        }

        /// <summary>
        /// Generates a JSON Web Token for the authenticated user.
        /// </summary>
        /// <param name="user">The authenticated user object.</param>
        /// <returns>A string representation of the JWT.</returns>
        private string GenerateJwtToken(User user)
        {
            // Retrieve the secret key from app configuration and create signing credentials.
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            // Create the claims for the token payload. These claims represent the user's identity and permissions.
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.UserId), // Standard claim for the subject (user ID).
                new Claim(JwtRegisteredClaimNames.Email, user.Email), // Standard claim for the user's email.
                new Claim(ClaimTypes.Role, user.Role), // Custom claim for the user's role.
                new Claim("uid", user.UserId), // Custom claim for user ID, often for easier access on the client.
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()) // Standard claim for a unique token identifier.
            };

            // Define the JWT's properties, including issuer, audience, claims, expiration, and signing credentials.
            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddHours(1), // Set the token to expire in 1 hour.
                signingCredentials: credentials);

            // Serialize the token object into a string.
            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}