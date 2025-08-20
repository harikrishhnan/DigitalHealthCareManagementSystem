using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Health.Application.DTO;
using Health.Application.Services;
using Health.Domain;
using Microsoft.AspNetCore.Authorization;

namespace Health.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        // This controller manages user-related operations like registration, retrieval, and profile management.
        private readonly IUserService _userService;

        /// <summary>
        /// Initializes a new instance of the UserController class.
        /// </summary>
        /// <param name="userService">The user service injected via dependency injection.</param>
        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        /// <summary>
        /// Gets a list of all users.
        /// </summary>
        /// <returns>An enumerable collection of UserDTO.</returns>
        // This endpoint is restricted to users with the 'Admin' role.
        [HttpGet("GetAllUser")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<UserDTO>>> GetAllUsers()
        {
            var users = await _userService.GetUsersAsync();
            return Ok(users);
        }

        /// <summary>
        /// Retrieves a specific user by their unique ID.
        /// </summary>
        /// <param name="id">The unique identifier of the user.</param>
        /// <returns>The user data transfer object (UserDTO) if found; otherwise, a NotFound result.</returns>
        // Accessible by all authenticated roles. The service layer handles logic for non-admins viewing only their own profile.
        [HttpGet("GetUserByID/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<UserDTO>> GetUserById(string id)
        {
            var user = await _userService.GetUserByIdAsync(id);
            if (user == null) return NotFound();
            return Ok(user);
        }

        /// <summary>
        /// Creates a new user.
        /// </summary>
        /// <param name="user">The UserDTO containing the new user's information.</param>
        /// <returns>A CreatedAtAction result with the newly created user's data.</returns>
        // Corresponds to "Register a New Patient" or "Add User" by an Admin.
        [HttpPost("AddUser")]
        [Authorize(Roles = "Admin,Patient")]
        public async Task<ActionResult> AddUser([FromBody] UserDTO user)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            await _userService.AddUserAsync(user);
            return CreatedAtAction(nameof(GetUserById), new { id = user.UserId }, user);
        }

        /// <summary>
        /// Updates an existing user's profile information.
        /// </summary>
        /// <param name="id">The ID of the user to be updated.</param>
        /// <param name="user">The UserDTO with the updated information.</param>
        /// <returns>A NoContent result on successful update.</returns>
        // All authenticated users can update their own profile. Admins can update any.
        [HttpPut("UpdateUser/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> UpdateUser(string id, [FromBody] UserDTO user)
        {
            if (id != user.UserId) return BadRequest("User ID mismatch.");
            if (!ModelState.IsValid) return BadRequest(ModelState);
            await _userService.UpdateUserAsync(user);
            return NoContent();
        }

        /// <summary>
        /// Deletes a user account from the system.
        /// </summary>
        /// <param name="id">The ID of the user to delete.</param>
        /// <returns>A NoContent result on successful deletion.</returns>
        // Corresponds to "Delete User Accounts" and is restricted to Admin users.
        [HttpDelete("DeleteUser/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> DeleteUser(string id)
        {
            try
            {
                await _userService.DeleteUserAsync(id);
                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}