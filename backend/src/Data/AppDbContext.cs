using Microsoft.EntityFrameworkCore;
using Backend.Models;

namespace Backend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Group> Groups { get; set; }
        public DbSet<InventoryItem> InventoryItems { get; set; }
        public DbSet<InventoryLog> InventoryLogs { get; set; }
        public DbSet<WorkLog> WorkLogs { get; set; }  
        public DbSet<User> Users { get; set; }
        public DbSet<Unit> Units { get; set; }
        public DbSet<ItemType> ItemTypes { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            // Seed Units
            modelBuilder.Entity<Unit>().HasData(
                new Unit { Id = 1, Symbol = "Kilogram" },
                new Unit { Id = 2, Symbol = "Gram" },
                new Unit { Id = 3, Symbol = "Milliliter" },
                new Unit { Id = 4, Symbol = "Liter" },
                new Unit { Id = 5, Symbol = "Stykker"}
            );
            
            // Seed ItemTypes
            modelBuilder.Entity<ItemType>().HasData(
                new ItemType { Id = 1, Type = "Basis malt" },
                new ItemType { Id = 2, Type = "Specielt malt" },
                new ItemType { Id = 3, Type = "Gær" },
                new ItemType { Id = 4, Type = "Humle" },
                new ItemType { Id = 5, Type = "Div. ingredienser" },
                new ItemType { Id = 6, Type = "Div." },
                new ItemType { Id = 7, Type = "Bønner" }
            );


            // User mock data.
            // modelBuilder.Entity<User>().HasData(
            //     new User { Id = 1, UserName = "Alice", UserId = 1001, GroupId = 1},
            //     new User { Id = 2, UserName = "Bob", UserId = 1002, GroupId = 1},
            //     new User { Id = 3, UserName = "Charlie", UserId = 1003, GroupId = 2},
            //     new User { Id = 4, UserName = "Admin", UserId = 1003, IsAdmin = true }
            // );
            
            // Seed Groups (if not already seeded)
            // modelBuilder.Entity<Group>().HasData(
            //     new Group { Id = 1, GroupName = "Class A" },
            //     new Group { Id = 2, GroupName = "Class B" }
            // );
        }
    }
}
