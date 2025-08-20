using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Health.Domain;

namespace Health.Infrastructure.Contracts
{
    public interface IAdminContract
    { // This interface defines the contract for Admin-related operations
        Task<IEnumerable<Admin>> GetAdminsAsync();
        Task<Admin> GetAdminByIdAsync(int adminId);
        Task<Admin> AddAdminAsync(Admin admin);
        Task<Admin> UpdateAdminAsync(Admin admin);
        Task<bool> DeleteAdminAsync(int adminId);
        Task<Admin> GetAdminByUserIdAsync(string userId);
    }
}