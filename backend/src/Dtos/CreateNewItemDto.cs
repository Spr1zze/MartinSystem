namespace Backend.Dtos
{
    public class CreateNewItemDto
    {
        public string ItemName { get; set; }
        public int Quantity { get; set; }
        public int UnitId { get; set; }
        public int ItemTypeId { get; set; }
        public int MinQuantity { get; set; }
        public DateTime LastUsed { get; set; }
        public DateTime CreatedDate { get; set; }
        public string BatchNumber { get; set; }
        public int Barcode { get; set; }
        public DateTime BestBefore { get; set; }
    }
}