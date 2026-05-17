using System.Diagnostics.CodeAnalysis;

namespace Backend.Models
{
    public class User
    {
        public int Id { get; set; }
        public required string UserName { get; set; }
        public required int UserId { get; set; }
        public int? GroupId { get; set; } // Foreign key to Group
        public Group? Group { get; set; } // Navigation property to Group

        public bool? IsAdmin { get; set; }
        public string? AdminPassword { get; set; }



        [SetsRequiredMembers]
        public User (
            string userName,
            int userId,
            int? groupId = null,
            bool? isAdmin = null,
            string? adminPassword = null            
        )
        {
            UserName = userName;
            UserId = userId;
            GroupId = groupId;
            IsAdmin = isAdmin;
            AdminPassword = adminPassword;
        }
    }
}