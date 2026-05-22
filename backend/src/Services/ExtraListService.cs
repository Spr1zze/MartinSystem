using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;
using System.Reflection.Metadata.Ecma335;

namespace Backend.Services
{
    public class ExtraListService
    {
        private readonly AppDbContext _dbContext;

        public ExtraListService (AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        
        public async Task<List<InventoryItem>> GetAllLowSupplyAsync()
        {
            return await _dbContext.InventoryItems
                .Where(i => i.Quantity <= i.MinQuantity)
                .OrderBy(i => i.ItemName)
                .ToListAsync();
        }

        public async Task<List<InventoryItem>> GetAllBestBeforeAsync()
        {
            DateTime currentTime = DateTime.UtcNow;
            return await _dbContext.InventoryItems
                .Where(i => i.BestBefore <= currentTime)
                .ToListAsync();
        }
    }
}