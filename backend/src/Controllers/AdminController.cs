using Microsoft.AspNetCore.Mvc;
using Backend.Services;
using Backend.Models;
using Backend.Dtos;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdminController : ControllerBase
    {
        private readonly AdminService _adminService;
        private readonly InventoryItemService _inventoryItemService;
        private readonly InventoryLogService _inventoryLogService;
        private readonly UserService _userService;
        private readonly WorkLogService _workLogService;

        public AdminController(
            AdminService adminService,
            InventoryItemService inventoryItemService,
            InventoryLogService inventoryLogService,
            UserService userService,
            WorkLogService workLogService
        )
        {
            _adminService = adminService;
            _inventoryItemService = inventoryItemService;
            _inventoryLogService = inventoryLogService;
            _userService = userService;
            _workLogService = workLogService;
        }

        [HttpGet("dashboard-stats")]
        public async Task<IActionResult> GetDashboardStats()
        {
            var stats = await _adminService.GetDashboardStatsAsync();
            return Ok(stats);
        }


        // Inventory log delete
        [HttpDelete("inventory-logs/{id}")]
        public async Task<IActionResult> DeleteInventoryLog(int id)
        {
            var wasDeleted = await _inventoryLogService.DeleteInventoryLogAsync(id);

            if (!wasDeleted)
            {
                return NotFound();
            }

            return Ok();
        }


        // Work log delete
        [HttpDelete("work-log/{id}")]
        public async Task<IActionResult> DeleteWorkLog(int id)
        {
            var wasDeleted = await _workLogService.DeleteWorkLogAsync(id);
            if (!wasDeleted)
                return NotFound();
            
            return Ok();
        }


        // All student endpoints below.
        [HttpGet("students")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _userService.GetAllAsync();
            return Ok(users);
        }

        [HttpPost("students")]
        public async Task<IActionResult> AddNewUser([FromBody] CreateStudentRequest request)
        {
            try
            {
                var newUser = await _userService.AddNewUserAsync(request);
                return Ok(newUser);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message, innerError = ex.InnerException?.Message });
            }
        }

        [HttpPut("edit-student/{userId}")]
        public async Task<IActionResult> EditUser([FromRoute] int userId, [FromBody] EditUserRequest request)
        {
            var updatedUser = await _userService.EditUserAsync(userId, request);

            if (updatedUser == null)
                return NotFound();

            return Ok(updatedUser);
        }

        [HttpDelete("students/{userId}")]
        public async Task<IActionResult> DeleteUser([FromRoute] int userId)
        {
            var user = await _userService.DeleteUserAsync(userId);
            if (!user)
                return NotFound();

            return Ok();
        }
    }
}
