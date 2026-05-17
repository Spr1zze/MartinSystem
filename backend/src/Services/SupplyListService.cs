using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;
using System.Reflection.Metadata.Ecma335;

namespace Backend.Services
{
    public class SupplyListService
    {
        private readonly AppDbContext _dbContext;

        public SupplyListService (AppDbContext dbContext)
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
    }
}