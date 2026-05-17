namespace Backend.Dtos
{
    public class CreateStudentRequest
    {
        public string UserName { get; set; } = string.Empty;
        public int UserId { get; set; }
        public int? GroupId { get; set; }
    }
}
