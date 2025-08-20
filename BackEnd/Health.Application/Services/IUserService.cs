using Health.Application.DTO;
using Health.Domain;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Health.Application.Services
{
    // This interface defines the contract for User-related operations
    public interface IUserService
    {
        Task<IEnumerable<UserDTO>> GetUsersAsync();
        Task<UserDTO?> GetUserByIdAsync(string id);
        Task AddUserAsync(UserDTO user);
        Task UpdateUserAsync(UserDTO user);
        Task DeleteUserAsync(string id);

        // This methods for authentication
        Task<(bool, string)> RegisterUserAsync(RegisterDto model);
        Task<User?> AuthenticateAsync(string email, string password);
        Task<int?> GetEntityIdByUserIdAsync();
    }
}