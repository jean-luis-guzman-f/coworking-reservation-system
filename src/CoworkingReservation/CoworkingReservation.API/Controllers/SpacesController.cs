using CoworkingReservation.Domain.Entities;
using CoworkingReservation.Infrastructure.Interfaces;
using CoworkingReservation.Application.Dtos;
using Microsoft.AspNetCore.Mvc;

namespace CoworkingReservation.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SpacesController : ControllerBase
{
    private readonly ISpaceRepository _spaceRepository;

    public SpacesController(ISpaceRepository spaceRepository)
    {
        _spaceRepository = spaceRepository;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<SpaceDto>>> GetAll()
    {
        var spaces = await _spaceRepository.GetAllAsync();

        var spaceDtos = spaces.Select(space => new SpaceDto
        {
            Id = space.Id,
            Name = space.Name,
            Description = space.Description,
            Type = space.Type.ToString(),
            Capacity = space.Capacity,
            HourlyRate = space.HourlyRate,
            IsAvailable = space.IsAvailable,
            CreatedAt = space.CreatedAt
        });

        return Ok(spaceDtos);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<SpaceDto>> GetById(int id)
    {
        var space = await _spaceRepository.GetByIdAsync(id);

        if (space is null)
        {
            return NotFound();
        }

        var spaceDto = new SpaceDto
        {
            Id = space.Id,
            Name = space.Name,
            Description = space.Description,
            Type = space.Type.ToString(),
            Capacity = space.Capacity,
            HourlyRate = space.HourlyRate,
            IsAvailable = space.IsAvailable,
            CreatedAt = space.CreatedAt
        };

        return Ok(spaceDto);
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

        await _spaceRepository.AddAsync(space);

        spaceDto.Id = space.Id;
        spaceDto.Type = space.Type.ToString();
        spaceDto.CreatedAt = space.CreatedAt;

        return CreatedAtAction(nameof(GetById), new { id = spaceDto.Id }, spaceDto);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, SpaceDto spaceDto)
    {
        var space = await _spaceRepository.GetByIdAsync(id);

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

        await _spaceRepository.UpdateAsync(space);

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var space = await _spaceRepository.GetByIdAsync(id);

        if (space is null)
        {
            return NotFound();
        }

        await _spaceRepository.DeleteAsync(space);

        return NoContent();
    }
}