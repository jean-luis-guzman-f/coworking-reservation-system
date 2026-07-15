using CoworkingReservation.Infrastructure.Context;
using CoworkingReservation.Infrastructure.Models;
using CoworkingReservation.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CoworkingReservation.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReservationsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ReservationsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ReservationDto>>> GetAll()
    {
        var reservations = await _context.Reservation
            .Select(reservation => new ReservationDto
            {
                Id = reservation.Id,
                UserId = reservation.UserId,
                SpaceId = reservation.SpaceId,
                StartTime = reservation.StartTime,
                EndTime = reservation.EndTime,
                Status = reservation.Status.ToString(),
                TotalAmount = reservation.TotalAmount,
                CreatedAt = reservation.CreatedAt
            })
            .ToListAsync();

        return Ok(reservations);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ReservationDto>> GetById(int id)
    {
        var reservation = await _context.Reservation
            .Where(reservation => reservation.Id == id)
            .Select(reservation => new ReservationDto
            {
                Id = reservation.Id,
                UserId = reservation.UserId,
                SpaceId = reservation.SpaceId,
                StartTime = reservation.StartTime,
                EndTime = reservation.EndTime,
                Status = reservation.Status.ToString(),
                TotalAmount = reservation.TotalAmount,
                CreatedAt = reservation.CreatedAt
            })
            .FirstOrDefaultAsync();

        if (reservation is null)
        {
            return NotFound();
        }

        return Ok(reservation);
    }

    [HttpPost]
    public async Task<ActionResult<ReservationDto>> Create(ReservationDto reservationDto)
    {
        var userExists = await _context.Users.AnyAsync(user => user.Id == reservationDto.UserId);

        if (!userExists)
        {
            return BadRequest("The selected user does not exist.");
        }

        var spaceExists = await _context.Spaces.AnyAsync(space => space.Id == reservationDto.SpaceId);

        if (!spaceExists)
        {
            return BadRequest("The selected space does not exist.");
        }

        if (reservationDto.EndTime <= reservationDto.StartTime)
        {
            return BadRequest("End time must be greater than start time.");
        }

        if (!Enum.TryParse<ReservationStatus>(reservationDto.Status, true, out var reservationStatus))
        {
            return BadRequest("Invalid reservation status.");
        }

        var reservation = new Reservation
        {
            UserId = reservationDto.UserId,
            SpaceId = reservationDto.SpaceId,
            StartTime = reservationDto.StartTime,
            EndTime = reservationDto.EndTime,
            Status = reservationStatus,
            TotalAmount = reservationDto.TotalAmount,
            CreatedAt = DateTime.UtcNow
        };

        _context.Reservation.Add(reservation);
        await _context.SaveChangesAsync();

        reservationDto.Id = reservation.Id;
        reservationDto.Status = reservation.Status.ToString();
        reservationDto.CreatedAt = reservation.CreatedAt;

        return CreatedAtAction(nameof(GetById), new { id = reservationDto.Id }, reservationDto);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, ReservationDto reservationDto)
    {
        var reservation = await _context.Reservation.FindAsync(id);

        if (reservation is null)
        {
            return NotFound();
        }

        var userExists = await _context.Users.AnyAsync(user => user.Id == reservationDto.UserId);

        if (!userExists)
        {
            return BadRequest("The selected user does not exist.");
        }

        var spaceExists = await _context.Spaces.AnyAsync(space => space.Id == reservationDto.SpaceId);

        if (!spaceExists)
        {
            return BadRequest("The selected space does not exist.");
        }

        if (reservationDto.EndTime <= reservationDto.StartTime)
        {
            return BadRequest("End time must be greater than start time.");
        }

        if (!Enum.TryParse<ReservationStatus>(reservationDto.Status, true, out var reservationStatus))
        {
            return BadRequest("Invalid reservation status.");
        }

        reservation.UserId = reservationDto.UserId;
        reservation.SpaceId = reservationDto.SpaceId;
        reservation.StartTime = reservationDto.StartTime;
        reservation.EndTime = reservationDto.EndTime;
        reservation.Status = reservationStatus;
        reservation.TotalAmount = reservationDto.TotalAmount;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var reservation = await _context.Reservation.FindAsync(id);

        if (reservation is null)
        {
            return NotFound();
        }

        _context.Reservation.Remove(reservation);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}