using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;
using SQLitePCL;

namespace Backend.Services
{
    public class InventoryItemService
    {

        private readonly AppDbContext _context;

        public InventoryItemService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<InventoryItem>> GetAllItemsAsync()
        {
            return await _context.InventoryItems
                .OrderBy(i => i.ItemType)
                .ThenBy(i => i.ItemName)
                .ToListAsync();
        }

        public async Task<InventoryItem> CreateNewItemAsync(
            string itemName,
            int quantity,
            int unitId,
            int itemTypeId,
            int minQuantity,
            DateTime lastUsed,
            DateTime createdDate,
            string batchNumber,
            string barcode,
            DateTime bestBefore
        )
        {
            var unit = await _context.Units.FindAsync(unitId);
            var itemType = await _context.ItemTypes.FindAsync(itemTypeId);
            
            if (unit == null || itemType == null)
                return null;

            var newItem = new InventoryItem
            (
                itemName, 
                quantity, 
                unitId,
                itemTypeId,
                minQuantity, 
                lastUsed, 
                createdDate, 
                batchNumber, 
                barcode,
                bestBefore
            );

            newItem.Unit = unit;
            newItem.ItemType = itemType;

            _context.InventoryItems.Add(newItem);
            await _context.SaveChangesAsync();
            return newItem;
        }


        public async Task<InventoryItem> EditItemAsync(
            int id,
            string? itemName,
            string? batchNumber,
            int? quantity,
            int? unitId,
            int? minQuantity,
            DateTime? bestBefore
        )
        {
            // Find item in DB
            var existingItem = await _context.InventoryItems.FindAsync(id);
            // Check if item exists
            if (existingItem == null) 
            {
                return null;
            }


            if (!String.IsNullOrEmpty(itemName))
            {
                existingItem.ItemName = itemName;
            }

            if (!String.IsNullOrEmpty(batchNumber))
            {
                existingItem.BatchNumber = batchNumber;
            }

            if (quantity != null)
            {
                existingItem.Quantity = quantity.Value;
            }

            if (unitId != null)
            {
                existingItem.UnitId = unitId.Value;
            }

            if (minQuantity != null)
            {
                existingItem.MinQuantity = minQuantity.Value;
            }

            if (bestBefore != null)
            {
                existingItem.BestBefore = bestBefore.Value;
            }


            await _context.SaveChangesAsync();
            return existingItem;
        }



        public async Task<bool> DeleteInventoryItemAsync(
            int id
        )
        {
            var item = await _context.InventoryItems.FindAsync(id);
            if (item == null) return false;

            _context.InventoryItems.Remove(item);
            await _context.SaveChangesAsync();
            return true;
        }


        public async Task<List<InventoryItem>> GetSearchItemsAsync(
            string? searchTerm,
            DateTime? startDate,
            DateTime? endDate,
            int? typeId,
            bool? lowStock = false 
        )
        {
            var query = _context.InventoryItems.AsQueryable();

            if (!String.IsNullOrEmpty(searchTerm))
            {
                query = query.Where(s => s.ItemName.Contains(searchTerm));
            }

            if (startDate.HasValue) {
                query = query.Where(s => s.LastUsed >= startDate);
            }
            if (endDate.HasValue) {
                query = query.Where(s => s.LastUsed <= endDate);
            }

            if (typeId.HasValue) {
                query = query.Where(s => s.ItemTypeId == typeId);
            }

            if (lowStock == true) {
                query = query.Where(s => s.Quantity <= s.MinQuantity);
            }

            return await query.ToListAsync();
        }
    }
}
