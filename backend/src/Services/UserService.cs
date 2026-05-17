using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;
using Backend.Dtos;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Backend.Services
{
    public class UserService
    {
        private readonly AppDbContext _context;

        public UserService(AppDbContext context)
        {
            _context = context;
        }


        // Used in Admin Controller
        public async Task<List<User>> GetAllAsync()
        {
            return await _context.Users
                .OrderBy(i => i.UserName)
                .ToListAsync();
        }


        // Used in Admin Controller
        public async Task<User> AddNewUserAsync(CreateStudentRequest request)
        {
            var newUser = new User
            (
                request.UserName,
                request.UserId,
                request.GroupId
            );

            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();
            return newUser;
        }


        public async Task<User> EditUserAsync(int userId, EditUserRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(user => user.UserId == userId);
            if (user == null)
                return null;
        
            if (!String.IsNullOrEmpty(request.UserName))
                user.UserName = request.UserName;
        
            if (request.GroupId.HasValue)
                user.GroupId = request.GroupId.Value;

            if (request.IsAdmin == true)
                user.IsAdmin = request.IsAdmin.Value;

            if (!String.IsNullOrEmpty(request.AdminPassword))
                user.AdminPassword = request.AdminPassword;

            await _context.SaveChangesAsync();
            return user;
        }
        
        // Used in Admin Controller
        public async Task<bool> DeleteUserAsync(
            int userId
        )
        {
            var user = await _context.Users.FirstOrDefaultAsync(user => user.UserId == userId);
            if (user == null) return false;

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
