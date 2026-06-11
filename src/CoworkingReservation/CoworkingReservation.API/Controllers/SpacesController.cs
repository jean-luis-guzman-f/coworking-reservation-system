using CoworkingReservation.API.Models.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace CoworkingReservation.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SpacesController : ControllerBase
{
    private static readonly List<SpaceDto> Spaces =
    [
        new SpaceDto
        {
            Id = 1,
            Name = "Shared Desk A1",
            Description = "Individual desk in the shared coworking area.",
            Type = "Desk",
            Capacity = 1,
            HourlyRate = 250,
            IsAvailable = true,
            CreatedAt = DateTime.UtcNow
        }
    ];

    private static int _nextId = 2;

    [HttpGet]
    public ActionResult<IEnumerable<SpaceDto>> GetAll()
    {
        return Ok(Spaces);
    }

    [HttpGet("{id:int}")]
    public ActionResult<SpaceDto> GetById(int id)
    {
        var space = Spaces.FirstOrDefault(space => space.Id == id);

        if (space is null)
        {
            return NotFound();
        }

        return Ok(space);
    }

    [HttpPost]
    public ActionResult<SpaceDto> Create(SpaceDto spaceDto)
    {
        spaceDto.Id = _nextId++;
        spaceDto.CreatedAt = DateTime.UtcNow;

        Spaces.Add(spaceDto);

        return CreatedAtAction(nameof(GetById), new { id = spaceDto.Id }, spaceDto);
    }

    [HttpPut("{id:int}")]
    public IActionResult Update(int id, SpaceDto spaceDto)
    {
        var space = Spaces.FirstOrDefault(space => space.Id == id);

        if (space is null)
        {
            return NotFound();
        }

        space.Name = spaceDto.Name;
        space.Description = spaceDto.Description;
        space.Type = spaceDto.Type;
        space.Capacity = spaceDto.Capacity;
        space.HourlyRate = spaceDto.HourlyRate;
        space.IsAvailable = spaceDto.IsAvailable;

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public IActionResult Delete(int id)
    {
        var space = Spaces.FirstOrDefault(space => space.Id == id);

        if (space is null)
        {
            return NotFound();
        }

        Spaces.Remove(space);

        return NoContent();
    }
}