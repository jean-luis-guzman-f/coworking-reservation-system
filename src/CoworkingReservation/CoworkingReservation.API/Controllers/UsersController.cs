using CoworkingReservation.API.Models.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace CoworkingReservation.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private static readonly List<UserDto> Users =
    [
        new UserDto
        {
            Id = 1,
            FullName = "Demo User",
            Email = "demo@coworking.com",
            PhoneNumber = "809-000-0000",
            CreatedAt = DateTime.UtcNow
        }
    ];

    private static int _nextId = 2;

    [HttpGet]
    public ActionResult<IEnumerable<UserDto>> GetAll()
    {
        return Ok(Users);
    }

    [HttpGet("{id:int}")]
    public ActionResult<UserDto> GetById(int id)
    {
        var user = Users.FirstOrDefault(user => user.Id == id);

        if (user is null)
        {
            return NotFound();
        }

        return Ok(user);
    }

    [HttpPost]
    public ActionResult<UserDto> Create(UserDto userDto)
    {
        userDto.Id = _nextId++;
        userDto.CreatedAt = DateTime.UtcNow;

        Users.Add(userDto);

        return CreatedAtAction(nameof(GetById), new { id = userDto.Id }, userDto);
    }

    [HttpPut("{id:int}")]
    public IActionResult Update(int id, UserDto userDto)
    {
        var user = Users.FirstOrDefault(user => user.Id == id);

        if (user is null)
        {
            return NotFound();
        }

        user.FullName = userDto.FullName;
        user.Email = userDto.Email;
        user.PhoneNumber = userDto.PhoneNumber;

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public IActionResult Delete(int id)
    {
        var user = Users.FirstOrDefault(user => user.Id == id);

        if (user is null)
        {
            return NotFound();
        }

        Users.Remove(user);

        return NoContent();
    }
}