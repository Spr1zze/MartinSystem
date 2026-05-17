using Microsoft.EntityFrameworkCore;
using Backend.Data;

namespace Backend.Services
{
    public class AdminService
    {
        private readonly AppDbContext _context;

        public AdminService (AppDbContext dbContext)
        {
            _context = dbContext;
        }

        public async Task<object> GetDashboardStatsAsync()
        {
            var totalGroups = await _context.Groups.AsNoTracking().CountAsync();
            var lowStockItems = await _context.InventoryItems
                .AsNoTracking()
                .CountAsync(item => item.Quantity <= item.MinQuantity);
            var inventoryLogCount = await _context.InventoryLogs.AsNoTracking().CountAsync();
            var processLogCount = await _context.WorkLogs.AsNoTracking().CountAsync();

            return new
            {
                totalGroups,
                lowStockItems,
                totalLogFiles = inventoryLogCount + processLogCount,
            };
        }
    }
}
