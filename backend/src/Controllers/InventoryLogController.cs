using Microsoft.AspNetCore.Mvc;
using Backend.Models;
using Backend.Services;
using Backend.Data;
using Backend.Dtos;


namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InventoryLogController : ControllerBase
    {
        private readonly InventoryLogService _inventoryLogService;
        public InventoryLogController (InventoryLogService inventoryLogService)
        {
            _inventoryLogService = inventoryLogService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllLogs()
        {
            var logs = await _inventoryLogService.GetAllLogsAsync();
            return Ok(logs);
        }


        // These 3 methods are 1 process.
        [HttpGet("validate-student/{studentId}")]
        public async Task<IActionResult> ValidateStudent(int studentId)
        {
            var student = await _inventoryLogService.ValidateStudentAsync(studentId);
            if (student == null) return NotFound();
            return Ok(student);
        }

        [HttpGet("validate-barcode/{scannedBarcode}")]
        public async Task<IActionResult> ValidateBarcode(string scannedBarcode)
        {
            var item = await _inventoryLogService.ValidateBarcodeAsync(scannedBarcode);
            if (item == null) return NotFound();
            return Ok(item);
        }

        [HttpPost("create-checkout")]
        public async Task<IActionResult> CreateCheckout([FromBody] CreateCheckoutRequest request)
        {
            var newLog = await _inventoryLogService.CreateCheckoutAsync(
                request.ItemId,
                request.StudentId,
                request.QuantityTaken,
                request.Signature
            );

            if (newLog == null) return BadRequest("Checkout Failed!");
            return Ok(newLog);
        }
    }
}
