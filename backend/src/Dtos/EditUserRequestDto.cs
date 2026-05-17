namespace Backend.Dtos
{
    public class EditUserRequest
    {
        public string? UserName { get; set; }
        public int? GroupId { get; set; }
        public bool? IsAdmin { get; set; }
        public string? AdminPassword { get; set; }
    }
}