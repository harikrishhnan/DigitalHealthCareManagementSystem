using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Health.Application.DTO;

namespace Health.Application.Services
{
    public interface IAdminService
    { // This interface defines the contract for Admin-related operations
        Task<IEnumerable<AdminDTO>> GetAdminsAsync();
        Task<AdminDTO> GetAdminByIdAsync(int id);
        Task AddAdminAsync(AdminDTO admin);
        Task UpdateAdminAsync(AdminDTO admin);
        Task DeleteAdminAsync(int id);
    }
}