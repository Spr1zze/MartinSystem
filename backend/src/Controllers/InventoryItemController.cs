using Microsoft.AspNetCore.Mvc;
using Backend.Models;
using Backend.Dtos;
using Backend.Services;
using Microsoft.AspNetCore.Razor.Hosting;
using SQLitePCL;
using Backend.Data;
using Microsoft.EntityFrameworkCore;



namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InventoryController : ControllerBase
    {
        private readonly InventoryItemService _inventoryItemService;
        private readonly AppDbContext _context;
        public InventoryController (InventoryItemService inventoryItemService, AppDbContext context) 
        {
            _inventoryItemService = inventoryItemService;
            _context = context;
        }


        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var items = await _inventoryItemService.GetAllItemsAsync();
            return Ok(items);
        } 


        [HttpPost]
        public async Task<IActionResult> CreateNewItem([FromBody] CreateNewItemDto newItemRequest)
        {
            var newItem = await _inventoryItemService.CreateNewItemAsync(
                newItemRequest.ItemName,
                newItemRequest.Quantity,
                newItemRequest.UnitId,
                newItemRequest.ItemTypeId,
                newItemRequest.MinQuantity,
                newItemRequest.LastUsed,
                newItemRequest.CreatedDate,
                newItemRequest.BatchNumber,
                newItemRequest.Barcode,
                newItemRequest.BestBefore
            );

            if (newItem == null)
            {
                return BadRequest("Unit or ItemType not found");   
            }

            return CreatedAtAction(nameof(GetAll), new { id = newItem.Id }, newItem);
        }


        [HttpPut("{id}")]
        public async Task<IActionResult> EditItem([FromRoute] int id, [FromBody] EditItemDto editRequest)
        {
            var updatedItem = await _inventoryItemService.EditItemAsync(
                id,
                editRequest.ItemName,
                editRequest.BatchNumber,
                editRequest.Quantity,
                editRequest.UnitId,
                editRequest.MinQuantity,
                editRequest.BestBefore
            );

            if (updatedItem == null)
            {
                return NotFound();
            }

            return Ok(updatedItem);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteItem([FromRoute] int id)
        {
            var wasDeleted = await _inventoryItemService.DeleteInventoryItemAsync(id);

            if (!wasDeleted)
            {
                return NotFound();
            }

            return Ok();
        }


        [HttpGet("search")]
        public async Task<IActionResult> GetSearchItem(
            [FromQuery] string? searchTerm,
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate,
            [FromQuery] int? typeId,
            [FromQuery] bool? lowStock
        )
        {
            var items = await _inventoryItemService.GetSearchItemsAsync(
                searchTerm, startDate, endDate, typeId, lowStock
            );

            return Ok(items);
        }


        [HttpGet("types")]
        public async Task<IActionResult> GetAllTypes()
        {
            var types = await _context.ItemTypes.ToListAsync();
            return Ok(types);
        }

        [HttpGet("units")]
        public async Task<IActionResult> GetAllUnits()
        {
            var units = await _context.Units.ToListAsync();
            return Ok(units);
        }
    }
}
