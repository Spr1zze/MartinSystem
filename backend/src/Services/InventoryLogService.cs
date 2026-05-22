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
    public class InventoryLogService
    {
        private readonly AppDbContext _context;

        public InventoryLogService(AppDbContext context)
        {
            _context = context;
        }

        // For admin page, to keep track of all logs.
        public async Task<List<AdminInventoryLogDto>> GetAllLogsAsync()
        {
            var users = await _context.Users
                .AsNoTracking()
                .Select(user => new
                {
                    user.Id,
                    user.UserId,
                    user.UserName,
                })
                .ToListAsync();

            var inventoryItems = await _context.InventoryItems
                .AsNoTracking()
                .Select(item => new
                {
                    item.Id,
                    item.ItemName,
                })
                .ToListAsync();

            var logs = await _context.InventoryLogs
                .AsNoTracking()
                .OrderByDescending(i => i.Timestamp)
                .ToListAsync();

            return logs.Select(log =>
            {
                var matchedUser = users.FirstOrDefault(user => user.Id == log.UserId)
                    ?? users.FirstOrDefault(user => user.UserId == log.UserId);
                var matchedItem = inventoryItems.FirstOrDefault(item => item.Id == log.InventoryItemId);

                return new AdminInventoryLogDto
                {
                    Id = log.Id,
                    Timestamp = log.Timestamp,
                    Quantity = log.Quantity,
                    InventoryItemId = log.InventoryItemId,
                    InventoryItemName = matchedItem?.ItemName ?? $"Vare #{log.InventoryItemId}",
                    UserId = log.UserId,
                    UserName = matchedUser?.UserName ?? $"User {log.UserId}",
                    UnitId = log.UnitId,
                    Signature = log.Signature,
                    Notes = log.Notes,
                };
            }).ToList();
        }


        // Call this when student ID is scanned for inv log
        // aka step 1 in inv logging
        public async Task<User> ValidateStudentAsync(int scannedId)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(i => i.UserId == scannedId);
            
            return user;
        }

        // Call this when item barcode is scanned for inv log
        // aka step 2 in inv logging
        public async Task<InventoryItem> ValidateBarcodeAsync(string scannedBarcode)
        {
            var item = await _context.InventoryItems
                .FirstOrDefaultAsync(i => i.Barcode == scannedBarcode);
            
            return item;
        }


        public async Task<InventoryLog> CreateCheckoutAsync(
            int itemId,
            int studentId,
            int quantityTaken,
            string signature
        )
        {
            var item = await _context.InventoryItems
                .Include(currentItem => currentItem.Unit)
                .FirstOrDefaultAsync(currentItem => currentItem.Id == itemId);
            var user = await _context.Users.FirstOrDefaultAsync(currentUser => currentUser.UserId == studentId);
            var signerId = int.TryParse(signature?.Trim(), out var parsedSignerId) ? parsedSignerId : (int?)null;
            var signer = signerId.HasValue
                ? await _context.Users.FirstOrDefaultAsync(currentUser => currentUser.UserId == signerId.Value)
                : null;

            if (item == null) return null;
            if (user == null) return null;
            if (string.IsNullOrWhiteSpace(signature)) return null;
            if (signer == null) return null;
            if (signer.UserId == user.UserId) return null;
            if (quantityTaken <= 0) return null;
            if (quantityTaken > item.Quantity) return null;

            item.Quantity -= quantityTaken;


            var newLog = new InventoryLog (
                DateTime.Now,
                quantityTaken,
                item.Id,
                user.Id,
                item.UnitId,
                signature
            );
            newLog.InventoryItem = item;
            newLog.User = user;
            newLog.Unit = item.Unit;
            newLog.Signature = signer.UserName;

            _context.InventoryLogs.Add(newLog);
            await _context.SaveChangesAsync();

            return newLog;
        }

 
        public async Task<bool> DeleteInventoryLogAsync(
            int id
        )
        {
            var log = await _context.InventoryLogs.FindAsync(id);
            if (log == null) return false;

            _context.InventoryLogs.Remove(log);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
