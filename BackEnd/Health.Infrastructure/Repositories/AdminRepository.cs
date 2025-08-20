using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Health.Infrastructure.Contracts;
using Health.Infrastructure.DBContext;
using Microsoft.EntityFrameworkCore;

// This code is part of the Health.Infrastructure.Repositories namespace, which contains repository classes for data access.
namespace Health.Infrastructure.Repositories
{
    // AdminRepository class implements the IAdminContract interface for admin-related operations.
    public class AdminRepository : IAdminContract
    { // This class implements the IAdminContract interface for admin-related operations
        private readonly HealthDBContextDbContext _context;

        // Constructor initializes the HealthDBContextDbContext instance
        public AdminRepository()
        {
            // Initialize the database context for accessing admin data
            _context = new HealthDBContextDbContext();
        }

        /// <summary>
        /// gets all admins from the database asynchronously.
        /// </summary>
        /// <returns>List of Admin objects</returns>
        // method to get all admins asynchronously
        public async Task<IEnumerable<Domain.Admin>> GetAdminsAsync()
        {
            // Fetch all admins from the database asynchronously
            return await _context.Admins.ToListAsync();
        }

        /// <summary>
        ///  Gets an admin by their ID asynchronously.
        /// </summary>
        /// <param name="AdminId">The ID of the admin to retrieve.</param>
        /// <returns>The admin with the specified ID, or null if not found.</returns>
        // Method to get an admin by ID asynchronously
        public async Task<Domain.Admin> GetAdminByIdAsync(int AdminId)
        {
            // Fetch an admin by ID from the database asynchronously
            return await _context.Admins.FindAsync(AdminId);
        }

        /// <summary>
        /// Adds a new admin to the database asynchronously.
        /// </summary>
        /// <param name="admin">The admin object to add.</param>
        /// <returns>The added admin object.</returns>
        // Method to add a new admin asynchronously
        public async Task<Domain.Admin> AddAdminAsync(Domain.Admin admin)
        {
            // Validate the admin object before adding it to the database
            _context.Admins.Add(admin);
            await _context.SaveChangesAsync();
            return admin;
        }

        /// <summary>
        /// updates an existing admin in the database asynchronously.
        /// </summary>
        /// <param name="admin">The admin object to update.</param>
        /// <returns>The updated admin object.</returns>
        // Method to update an existing admin asynchronously
        public async Task<Domain.Admin> UpdateAdminAsync(Domain.Admin admin)
        {
            // Validate the admin object before updating it in the database
            _context.Admins.Update(admin);
            await _context.SaveChangesAsync();
            return admin;
        }

        /// <summary>
        /// deletes an admin by their ID asynchronously.
        /// </summary>
        /// <param name="AdminId">The ID of the admin to delete.</param>
        /// <returns>True if the admin was deleted successfully, otherwise false.</returns>
        // Method to delete an admin by ID asynchronously
        public async Task<bool> DeleteAdminAsync(int AdminId)
        {
            // Validate the ID and remove the admin from the database if it exists
            var admin = await GetAdminByIdAsync(AdminId);
            if (admin == null) return false;
            _context.Admins.Remove(admin);
            await _context.SaveChangesAsync();
            return true;
        }
        /// <summary>
        /// Retrieves a Admin associated with the specified user ID.
        /// </summary>
        /// <param name="userId">The unique identifier of the user whose associated admin is to be retrieved. Cannot be null or empty.</param>
        /// <returns>A <see cref="Domain.Admin"/> object representing the admin associated with the specified user ID,  or <see
        /// langword="null"/> if no matching admin  is found.</returns>
        public async Task<Domain.Admin> GetAdminByUserIdAsync(string userId)
        {
            return await _context.Admins
                .FirstOrDefaultAsync(d => d.UserID == userId);
        }
    }
}