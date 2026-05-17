namespace Backend.Dtos
{
    public class AdminInventoryLogDto
    {
        public int Id { get; set; }
        public DateTime Timestamp { get; set; }
        public int Quantity { get; set; }
        public int InventoryItemId { get; set; }
        public string InventoryItemName { get; set; } = string.Empty;
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public int UnitId { get; set; }
        public string Signature { get; set; }
        public string? Notes { get; set; }
    }
}
