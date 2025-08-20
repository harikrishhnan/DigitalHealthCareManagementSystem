using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Health.Domain;

namespace Health.Infrastructure.Contracts
{
    public interface IUserContract
    {
         Task<string> GenerateUserIdAsync(string role);
        Task<IEnumerable<User>> GetUsersAsync();
        Task<User> GetUserByIdAsync(string userId);
        Task<User> AddUserAsync(User user);
        Task<User> UpdateUserAsync(User user);
        Task<bool> DeleteUserAsync(string userId);
        Task<User?> GetUserByEmailAsync(string email);

       
    }
}