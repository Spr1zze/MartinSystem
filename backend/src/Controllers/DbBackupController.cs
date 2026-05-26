using Backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controller
{
    [ApiController]
    [Route("api/[controller]")]
    public class DbBackupController : ControllerBase
    {
        private readonly DbBackupService _backupService;

        public DbBackupController (DbBackupService dbBackup)
        {
            _backupService = dbBackup;
        }

        [HttpGet("backup-status")]
        public IActionResult GetBackupStatus()
        {
            return Ok(new
            {
                success = _backupService.LastSuccess,
                error = _backupService.LastError
            });
        }
    }
}