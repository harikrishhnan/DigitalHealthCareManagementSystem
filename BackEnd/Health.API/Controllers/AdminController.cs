using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Health.Application.DTO;
using Health.Application.Services;
using Microsoft.AspNetCore.Authorization;

namespace Health.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly IAdminService _adminService;
        private readonly IUserService _userService;
        // Dependency injection via constructor
        public AdminController(IAdminService adminService, IUserService userService)
        {
            _adminService = adminService;
            _userService = userService;
        }
  
        /// <summary>
        /// Gets all admins.    
        /// </summary>
        /// <returns>List of admins</returns>
        // GET: api/admin/GetAllAdmin
        [HttpGet("GetAllAdmin")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<AdminDTO>>> GetAllAdmins()
        {
            try
            {
                var admins = await _adminService.GetAdminsAsync();
                return Ok(admins);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Error retrieving admins: {ex.Message}");
            }
        }

        /// <summary>
        /// Gets an admin by their ID.
        /// </summary>
        /// <param name="AdminId">The ID of the admin.</param>
        /// <returns>The admin with the specified ID.</returns>
        // GET: api/admin/GetAdminByID/{AdminId}
        [HttpGet("GetAdminByID/{AdminId}")]
        public async Task<ActionResult<AdminDTO>> GetAdminById([FromRoute] int AdminId)
        {
            try
            {
                var admin = await _adminService.GetAdminByIdAsync(AdminId);
                if (admin == null)
                {
                    return NotFound($"Admin with ID {AdminId} not found.");
                }
                return Ok(admin);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Error retrieving admin: {ex.Message}");
            }
        }

        /// <summary>
        ///  Adds a new admin.
        /// </summary>
        /// <param name="AdminId">The ID of the admin.</param>
        /// <param name="admin">The admin data.</param>
        /// <returns></returns>
        // PUT: api/admin/UpdateAdmin/{AdminId}
        [HttpPut("UpdateAdmin/{AdminId}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> UpdateAdmin([FromRoute] int AdminId, [FromBody] AdminDTO admin)
        {
            try
            {
                if (AdminId != admin.AdminId)
                {
                    return BadRequest("Admin ID mismatch.");
                }
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }
                await _adminService.UpdateAdminAsync(admin);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Error updating admin: {ex.Message}");
            }
        }

        /// <summary>
        ///  deletes an admin by their ID.
        /// </summary>
        /// <param name="AdminId">The ID of the admin.</param>
        /// <returns></returns>
        // DELETE: api/admin/DeleteAdmin/{AdminId}
        [HttpDelete("DeleteAdmin/{AdminId}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> DeleteAdmin([FromRoute] int AdminId)
        {
            try
            {
                await _adminService.DeleteAdminAsync(AdminId);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Error deleting admin: {ex.Message}");
            }
        }
    

        /// <summary>
        /// Retrieves the profile of the authenticated Admin.
        /// </summary>
        /// <returns>The Admin's profile information.</returns>
        [HttpGet("GetAdminProfile")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAdminProfile()
        {
            // Extract UserId from JWT

            try
            {
                int? adminId = await _userService.GetEntityIdByUserIdAsync();
                // Get the AdminId using UserId
                if (adminId == null)
                {
                    return NotFound($"No admin found.");
                }

                // Fetch the admin's profile using AdminId
                var admin = await _adminService.GetAdminByIdAsync(adminId.Value);
                if (admin == null)
                {
                    return NotFound("Admin profile not found.");
                }

                return Ok(admin);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Error retrieving admin profile: {ex.Message}");
            }
        }
    }
}