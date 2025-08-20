using Health.Application.DTO;
using Health.Domain;
using Health.Infrastructure.Contracts;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Health.Application.Services
{
    public class AdminService : IAdminService
    {
        private readonly IAdminContract _adminRepository;
        private readonly IUserService _userService;

        // Inject dependencies through the constructor
        public AdminService(IAdminContract adminRepository, IUserService userService)
        {
            _adminRepository = adminRepository;
            _userService = userService;
        }
        /// <summary>
        /// gets all admins from the repository and maps them to AdminDTOs.
        /// </summary>
        /// <returns>List of AdminDTOs</returns>
        public async Task<IEnumerable<AdminDTO>> GetAdminsAsync()
        {
            var admins = await _adminRepository.GetAdminsAsync();
            return admins.Select(a => new AdminDTO
            {
                AdminId = a.AdminId,
                UserID = a.UserID,
                Name = a.Name,
                PhoneNo = a.PhoneNo,
                Email = a.Email
            });
        }
        /// <summary>
        /// gets an admin by their ID.
        /// </summary>
        /// <param name="AdminId"></param>
        /// <returns>Admin Details</returns>
        public async Task<AdminDTO> GetAdminByIdAsync(int AdminId)
        {
            var admin = await _adminRepository.GetAdminByIdAsync(AdminId);
            if (admin == null) return null;

            return new AdminDTO
            {
                AdminId = admin.AdminId,
                UserID = admin.UserID,
                Name = admin.Name,
                PhoneNo = admin.PhoneNo,
                Email = admin.Email
            };
        }
        /// <summary>
        /// saves a new admin to the repository.
        /// </summary>
        /// <param name="adminDto"></param>
        /// <returns></returns>
        public async Task AddAdminAsync(AdminDTO adminDto)
        {
            var admin = new Admin
            {
                AdminId = adminDto.AdminId,
                UserID = adminDto.UserID,
                Name = adminDto.Name,
                PhoneNo = adminDto.PhoneNo,
                Email = adminDto.Email
            };
            await _adminRepository.AddAdminAsync(admin);
        }
        /// <summary>
        /// updates an existing admin in the repository.
        /// </summary>
        /// <param name="adminDto"></param>
        /// <returns></returns>
        public async Task UpdateAdminAsync(AdminDTO adminDto)
        {
            var admin = new Admin
            {
                AdminId = adminDto.AdminId,
                UserID = adminDto.UserID,
                Name = adminDto.Name,
                PhoneNo = adminDto.PhoneNo,
                Email = adminDto.Email
            };
            await _adminRepository.UpdateAdminAsync(admin);
        }
        /// <summary>
        /// deletes an admin by their ID.
        /// </summary>
        /// <param name="AdminId"></param>
        /// <returns></returns>
        /// <exception cref="System.ArgumentException"></exception>
        public async Task DeleteAdminAsync(int AdminId)
        {
            var admin = await _adminRepository.GetAdminByIdAsync(AdminId);
            if (admin == null)
            {
                throw new Exception($"Admin with ID {AdminId} does not exist.");
            }

            await _adminRepository.DeleteAdminAsync(AdminId);
            await _userService.DeleteUserAsync(admin.UserID);
        }
    }
}