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
    public class ExtraListController : ControllerBase
    {
        private readonly ExtraListService _extraListService;

        public ExtraListController (ExtraListService extraListService)
        {
            _extraListService = extraListService;
        }


        [HttpGet]
        public async Task<IActionResult> GetAllSupply()
        {
            var lowSupply = await _extraListService.GetAllLowSupplyAsync();
            return Ok(lowSupply);
        }

        [HttpGet("best-before-expired")]
        public async Task<IActionResult> GetAllBestBefore()
        {
            var bestBefore = await _extraListService.GetAllBestBeforeAsync();
            return Ok(bestBefore);
        }
    }
}
