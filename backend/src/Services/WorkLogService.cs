using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;
using Backend.Dtos;

namespace Backend.Services
{
    public class WorkLogService
    {
        private readonly AppDbContext _context;

        public WorkLogService(AppDbContext context)
        {
            _context = context;
        }


        public async Task<List<WorkLog>> GetAllAsync()
        {
            return await _context.WorkLogs
                .OrderBy(i => i.Timestamp)
                .ToListAsync();
        }


        public async Task<bool> DeleteWorkLogAsync(int id)
        {
            var log = await _context.WorkLogs.FindAsync(id);
            if (log == null) return false;

            _context.WorkLogs.Remove(log);
            await _context.SaveChangesAsync();
            return true;
        }


        public async Task<User> ValidateStudentAsync(int scannedId)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(i => i.UserId == scannedId);
            
            return user;
        }


        public async Task<WorkLog> CreateNewLogAsync(
            string notes,
            string batchNumber,
            int userId
        )
        {
            try
            {
                var user = await _context.Users.FirstOrDefaultAsync(user => user.UserId == userId);
                if (user == null) return null;

                var newLog = new WorkLog (
                    DateTime.Now,
                    notes,
                    batchNumber,
                    user.Id
                );

                _context.WorkLogs.Add(newLog);
                await _context.SaveChangesAsync();
                return newLog;
            } 
            catch (Exception ex)
            {
                Console.WriteLine($"Error creating log: {ex.Message}");
                throw;
            }
        }
        // Get all
        // Remove (admin only)
        // User validation
        // Add log (+ user validation connected. Atomic Operation.)
    }
}