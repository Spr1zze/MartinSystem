using Microsoft.AspNetCore.Mvc;
using Backend.Models;
using Backend.Services;
using Backend.Dtos;

namespace Backend.Controller
{
    [ApiController]
    [Route("api/[controller]")]
    public class WorkLogController : ControllerBase
    {
        private readonly WorkLogService _workLogService;

        public WorkLogController(WorkLogService WorkLogService)
        {
            _workLogService = WorkLogService;
        }


        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var logs = await _workLogService.GetAllAsync();
            return Ok(logs);
        }

        [HttpPost("create-log")]
        public async Task<IActionResult> CreateNewLog([FromBody] CreateWorkLogRequestDto request)
        {
            try
            {
                var newLog = await _workLogService.CreateNewLogAsync(
                    request.Notes,
                    request.BatchNumber,
                    request.UserId
                );

                return Ok(newLog);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // Get all
        // Remove (admin only)
        // User validation
        // Add log (+ user validation connected. Atomic Operation.)
    }
}