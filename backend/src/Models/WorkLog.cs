using System.Diagnostics.CodeAnalysis;

namespace Backend.Models
{
    public class WorkLog
    {
        public int Id { get; set; }
        public required DateTime Timestamp { get; set; }
        public required string Notes { get; set; }
        public required string BatchNumber { get; set; }
        public required int UserId { get; set; } // Foreign key to Student
        public required User User { get; set; } // Navigation property to Student


        [SetsRequiredMembers]
        public WorkLog(
            DateTime timestamp,
            string notes,
            string batchNumber,
            int userId
        )
        {
            Timestamp = timestamp;
            Notes = notes;
            BatchNumber = batchNumber;
            UserId = userId;
        }
    }
}