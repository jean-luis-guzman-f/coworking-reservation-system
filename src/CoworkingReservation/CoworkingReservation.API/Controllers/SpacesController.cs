using CoworkingReservation.Application.Contract;
using CoworkingReservation.Application.Dtos;
using Microsoft.AspNetCore.Mvc;

namespace CoworkingReservation.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SpacesController : ControllerBase
{
    private readonly ISpaceService _spaceService;

    public SpacesController(ISpaceService spaceService)
    {
        _spaceService = spaceService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<SpaceDto>>> GetAll()
    {
        var spaces = await _spaceService.GetAllAsync();

        return Ok(spaces);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<SpaceDto>> GetById(int id)
    {
        try
        {
            var space = await _spaceService.GetByIdAsync(id);

            if (space is null)
            {
                return NotFound();
            }

            return Ok(space);
        }
        catch (ArgumentException exception)
        {
            return BadRequest(exception.Message);
        }
    }

    [HttpPost]
    public async Task<ActionResult<SpaceDto>> Create(SpaceDto spaceDto)
    {
        try
        {
            var createdSpace = await _spaceService.CreateAsync(spaceDto);

            return CreatedAtAction(
                nameof(GetById),
                new { id = createdSpace.Id },
                createdSpace);
        }
        catch (ArgumentException exception)
        {
            return BadRequest(exception.Message);
        }
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, SpaceDto spaceDto)
    {
        try
        {
            var updated = await _spaceService.UpdateAsync(id, spaceDto);

            if (!updated)
            {
                return NotFound();
            }

            return NoContent();
        }
        catch (ArgumentException exception)
        {
            return BadRequest(exception.Message);
        }
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var deleted = await _spaceService.DeleteAsync(id);

            if (!deleted)
            {
                return NotFound();
            }

            return NoContent();
        }
        catch (ArgumentException exception)
        {
            return BadRequest(exception.Message);
        }
    }
}