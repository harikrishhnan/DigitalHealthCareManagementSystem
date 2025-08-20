using Health.Domain;
using Health.Infrastructure.Contracts;
using Health.Infrastructure.DBContext;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Health.Infrastructure.Repositories
{
    public class UserRepository : IUserContract
    {
        private readonly HealthDBContextDbContext _context;

        public UserRepository(HealthDBContextDbContext context)
        {
            _context = context;
        }

        // =================================================================
        // CORRECTED: This is a more robust implementation of the ID generation logic.
        // It fetches all relevant IDs and processes them in-memory to avoid any
        // potential database sorting issues with string-based keys.
        // =================================================================
        public async Task<string> GenerateUserIdAsync(string role)
        {
            
            string prefix = role.ToUpper().Trim() switch
            {
                "ADMIN" => "A",
                "DOCTOR" => "D",
                "PATIENT" => "P",
                _ => role.ToUpper().Trim() // Use full role name for any other roles
            };
            // 1. Fetch all user IDs for the given role into a list.
            var allIdsForRole = await _context.User
                .Where(u => u.UserId.StartsWith(prefix))
                .Select(u => u.UserId)
                .ToListAsync();

            int maxNumber = 0;

            // 2. If any IDs exist, loop through them to find the highest number.
            if (allIdsForRole.Any())
            {
                foreach (var id in allIdsForRole)
                {
                    // Extract only the digits from the ID string.
                    string numberPart = new string(id.Where(char.IsDigit).ToArray());

                    if (int.TryParse(numberPart, out int currentNumber))
                    {
                        if (currentNumber > maxNumber)
                        {
                            maxNumber = currentNumber;
                        }
                    }
                }
            }

            // 3. The next ID is the highest one found, plus one.
            int nextIdNumber = maxNumber + 1;

            // 4. Format the new ID with 3-digit padding (e.g., DOCTOR001, PATIENT012).
            return $"{prefix}{nextIdNumber:D3}";
        }

        public async Task<IEnumerable<User>> GetUsersAsync()
        {
            return await _context.User.ToListAsync();
        }

        public async Task<User> GetUserByIdAsync(string id)
        {
            return await _context.User.FindAsync(id);
        }

        public async Task<User> AddUserAsync(User user)
        {
            _context.User.Add(user);
            await _context.SaveChangesAsync();
            return user;
        }

        public async Task<User> UpdateUserAsync(User user)
        {
            _context.User.Update(user);
            await _context.SaveChangesAsync();
            return user;
        }

        public async Task<bool> DeleteUserAsync(string id)
        {
            var user = await GetUserByIdAsync(id);
            if (user == null) return false;

            _context.User.Remove(user);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<User?> GetUserByEmailAsync(string email)
        {
            return await _context.User.FirstOrDefaultAsync(user => user.Email == email);
        }
    }
}
