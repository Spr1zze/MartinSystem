namespace Backend.Dtos
{
    public class SearchItem
    {
        public string SearchTerm { get; set; }

        public DateTime StartDate { get; set; }

        public DateTime EndDate { get; set; }

        public int TypeId { get; set; }

        public bool LowStock { get; set; }
    }
}