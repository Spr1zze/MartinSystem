using Microsoft.EntityFrameworkCore;
using Backend.Data;

namespace Backend.Services
{
    public class DbBackupService
    {
        private readonly AppDbContext _context;

        public DbBackupService (AppDbContext dbContext)
        {
            _context = dbContext;
        }


        // copy the current DB
        // save at new location
        // send success or error.
    }    
}