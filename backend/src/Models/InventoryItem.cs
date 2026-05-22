using System.Diagnostics.CodeAnalysis;

namespace Backend.Models
{
    public class InventoryItem
    {
        public int Id { get; set; }
        public required string ItemName { get; set; }
        public required int Quantity { get; set; }

        public required int UnitId { get; set; } // Foreign key to Unit
        public required Unit Unit { get; set; } // Class defined elsewhere

        public required int ItemTypeId { get; set; } // Foreign key to ItemType
        public required ItemType ItemType { get; set; } // Class defined elsewhere

        public required int MinQuantity { get; set; }
        public required DateTime LastUsed { get; set; }
        public required string BatchNumber { get; set; }
        public required DateTime CreatedDate { get; set; }
        public string? Notes { get; set; }
        public required string Barcode { get; set; }
        public required DateTime BestBefore { get; set; }



        // This essentially just tells the compiler "Don't worry, all required members are set" 
         [SetsRequiredMembers]
        public InventoryItem(
            string itemName,
            int quantity,
            int unitId,
            int itemTypeId,
            int minQuantity,
            DateTime lastUsed,
            DateTime createdDate,
            string batchNumber,
            string barcode,
            DateTime bestBefore)
        {
            ItemName = itemName;
            Quantity = quantity;
            UnitId = unitId;
            ItemTypeId = itemTypeId;
            MinQuantity = minQuantity;
            LastUsed = lastUsed;
            BatchNumber = batchNumber;
            CreatedDate = createdDate;
            Barcode = barcode;
            BestBefore = bestBefore;
        }
    }
}
