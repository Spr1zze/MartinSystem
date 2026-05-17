namespace Backend.Dtos
{
    public class CreateWorkLogRequestDto
    {
        public string Notes { get; set; }
        public int UserId { get; set; }
        public string BatchNumber { get; set; }
    }
}