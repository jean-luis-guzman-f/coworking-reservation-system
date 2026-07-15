using CoworkingReservation.Domain.Entities;
using CoworkingReservation.Infrastructure.Interfaces;
using CoworkingReservation.Infrastructure.Models;
using Microsoft.AspNetCore.Mvc;

namespace CoworkingReservation.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserRepository _userRepository;

    public UsersController(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetAll()
    {
        var users = await _userRepository.GetAllAsync();

        var userDtos = users.Select(user => new UserDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            PhoneNumber = user.PhoneNumber,
            CreatedAt = user.CreatedAt
        });

        return Ok(userDtos);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<UserDto>> GetById(int id)
    {
        var user = await _userRepository.GetByIdAsync(id);

        if (user is null)
        {
            return NotFound();
        }

        var userDto = new UserDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            PhoneNumber = user.PhoneNumber,
            CreatedAt = user.CreatedAt
        };

        return Ok(userDto);
    }

    [HttpPost]
    public async Task<ActionResult<UserDto>> Create(UserDto userDto)
    {
        var user = new User
        {
            FullName = userDto.FullName,
            Email = userDto.Email,
            PhoneNumber = userDto.PhoneNumber,
            CreatedAt = DateTime.UtcNow
        };

        await _userRepository.AddAsync(user);

        userDto.Id = user.Id;
        userDto.CreatedAt = user.CreatedAt;

        return CreatedAtAction(nameof(GetById), new { id = userDto.Id }, userDto);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, UserDto userDto)
    {
        var user = await _userRepository.GetByIdAsync(id);

        if (user is null)
        {
            return NotFound();
        }

        user.FullName = userDto.FullName;
        user.Email = userDto.Email;
        user.PhoneNumber = userDto.PhoneNumber;

        await _userRepository.UpdateAsync(user);

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var user = await _userRepository.GetByIdAsync(id);

        if (user is null)
        {
            return NotFound();
        }

        await _userRepository.DeleteAsync(user);

        return NoContent();
    }
}