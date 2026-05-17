using System.Diagnostics.CodeAnalysis;

namespace Backend.Models
{
    public class InventoryLog
    {
        public int Id { get; set; }
        public required DateTime Timestamp { get; set; }
        public required int Quantity { get; set; }

        public required int InventoryItemId { get; set; } // Foreign key to Inventory
        public required InventoryItem InventoryItem { get; set; } // Navigation property to Inventory

        public required int UserId { get; set; } // Foreign key to Student
        public required User User { get; set; } // Navigation property to Student

        public required int UnitId { get; set; } // Foreign key to Unit
        public required Unit Unit { get; set; } // Navigation property to Unit
        
        public string Signature { get; set; }
        public string? Notes { get; set; }
    
    
        [SetsRequiredMembers]
        public InventoryLog(
            DateTime timestamp,
            int quantity,
            int inventoryItemId,
            int userId,
            int unitId,
            string signature)
        {
            Timestamp = timestamp;
            Quantity = quantity;
            InventoryItemId = inventoryItemId;
            UserId = userId;
            UnitId = unitId;
            Signature = signature;
        }
    }
}
