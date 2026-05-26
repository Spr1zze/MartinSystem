using Microsoft.EntityFrameworkCore;
using Backend.Data;

namespace Backend.Services
{
    public class DbBackupService
    {
        private readonly string basePath;
        private readonly string dbOriginalPath;
        private readonly string dbBackupPath;
 

        public DbBackupService()
        {
            basePath = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
                "martin-inventory"
            );

            dbOriginalPath = Path.Combine(
                basePath,
                "inventory.db"
            );

            dbBackupPath = Path.Combine(
                basePath,
                "backup-database",
                "inventory-backup.db"
            );

            Directory.CreateDirectory(Path.GetDirectoryName(dbBackupPath)!);
        }


        public string? LastError { get; private set; }
        public bool LastSuccess { get; private set; }

        public void CopyDbFile()
        {
            try
            {
                File.Copy(dbOriginalPath, dbBackupPath, overwrite: true);
                LastSuccess = true;
                LastError = null;

                Console.WriteLine("Success. Data below: ");
                Console.WriteLine(dbOriginalPath);
                Console.WriteLine(dbBackupPath);
            }
            catch (Exception ex)
            {
                LastSuccess = false;
                LastError = ex.ToString();

                Console.WriteLine("Failed. Data below: ");
                Console.WriteLine(LastError);
                Console.WriteLine(dbOriginalPath);
                Console.WriteLine(dbBackupPath);
            }
        }
    }    
}