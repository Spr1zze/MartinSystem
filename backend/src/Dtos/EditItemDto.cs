namespace Backend.Dtos
{
    public class EditItemDto
    {
        public string ItemName { get; set; }
        public string BatchNumber { get; set; }
        public int Quantity { get; set; }
        public int UnitId { get; set; }
        public int MinQuantity { get; set; }
        public DateTime BestBefore { get; set; }
    }
}