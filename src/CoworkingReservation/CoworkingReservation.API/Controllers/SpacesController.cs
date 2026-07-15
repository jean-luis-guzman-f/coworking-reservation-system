using CoworkingReservation.Infrastructure.Context;
using CoworkingReservation.Infrastructure.Models;
using CoworkingReservation.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CoworkingReservation.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SpacesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public SpacesController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<SpaceDto>>> GetAll()
    {
        var spaces = await _context.Spaces
            .Select(space => new SpaceDto
            {
                Id = space.Id,
                Name = space.Name,
                Description = space.Description,
                Type = space.Type.ToString(),
                Capacity = space.Capacity,
                HourlyRate = space.HourlyRate,
                IsAvailable = space.IsAvailable,
                CreatedAt = space.CreatedAt
            })
            .ToListAsync();

        return Ok(spaces);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<SpaceDto>> GetById(int id)
    {
        var space = await _context.Spaces
            .Where(space => space.Id == id)
            .Select(space => new SpaceDto
            {
                Id = space.Id,
                Name = space.Name,
                Description = space.Description,
                Type = space.Type.ToString(),
                Capacity = space.Capacity,
                HourlyRate = space.HourlyRate,
                IsAvailable = space.IsAvailable,
                CreatedAt = space.CreatedAt
            })
            .FirstOrDefaultAsync();

        if (space is null)
        {
            return NotFound();
        }

        return Ok(space);
    }

    [HttpPost]
    public async Task<ActionResult<SpaceDto>> Create(SpaceDto spaceDto)
    {
        if (!Enum.TryParse<SpaceType>(spaceDto.Type, true, out var spaceType))
        {
            return BadRequest("Invalid space type.");
        }

        var space = new Space
        {
            Name = spaceDto.Name,
            Description = spaceDto.Description,
            Type = spaceType,
            Capacity = spaceDto.Capacity,
            HourlyRate = spaceDto.HourlyRate,
            IsAvailable = spaceDto.IsAvailable,
            CreatedAt = DateTime.UtcNow
        };

        _context.Spaces.Add(space);
        await _context.SaveChangesAsync();

        spaceDto.Id = space.Id;
        spaceDto.Type = space.Type.ToString();
        spaceDto.CreatedAt = space.CreatedAt;

        return CreatedAtAction(nameof(GetById), new { id = spaceDto.Id }, spaceDto);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, SpaceDto spaceDto)
    {
        var space = await _context.Spaces.FindAsync(id);

        if (space is null)
        {
            return NotFound();
        }

        if (!Enum.TryParse<SpaceType>(spaceDto.Type, true, out var spaceType))
        {
            return BadRequest("Invalid space type.");
        }

        space.Name = spaceDto.Name;
        space.Description = spaceDto.Description;
        space.Type = spaceType;
        space.Capacity = spaceDto.Capacity;
        space.HourlyRate = spaceDto.HourlyRate;
        space.IsAvailable = spaceDto.IsAvailable;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var space = await _context.Spaces.FindAsync(id);

        if (space is null)
        {
            return NotFound();
        }

        _context.Spaces.Remove(space);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}