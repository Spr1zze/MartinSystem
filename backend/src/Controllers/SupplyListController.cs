using Microsoft.AspNetCore.Mvc;
using Backend.Models;
using Backend.Dtos;
using Backend.Services;
using Microsoft.AspNetCore.Razor.Hosting;
using SQLitePCL;
using Backend.Data;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controller
{
    [ApiController]
    [Route("api/[controller]")]
    public class SupplyListController : ControllerBase
    {
        private readonly SupplyListService _supplyListService;

        public SupplyListController (SupplyListService supplyListService)
        {
            _supplyListService = supplyListService;
        }


        [HttpGet]
        public async Task<IActionResult> GetAllSupply()
        {
            var lowSupply = await _supplyListService.GetAllLowSupplyAsync();
            return Ok(lowSupply);
        }
    }
}