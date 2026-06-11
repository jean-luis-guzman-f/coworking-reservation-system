using CoworkingReservation.API.Models.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace CoworkingReservation.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReservationsController : ControllerBase
{
    private static readonly List<ReservationDto> Reservations =
    [
        new ReservationDto
        {
            Id = 1,
            UserId = 1,
            SpaceId = 1,
            StartTime = DateTime.UtcNow.AddHours(1),
            EndTime = DateTime.UtcNow.AddHours(3),
            Status = "Pending",
            TotalAmount = 500,
            CreatedAt = DateTime.UtcNow
        }
    ];

    private static int _nextId = 2;

    [HttpGet]
    public ActionResult<IEnumerable<ReservationDto>> GetAll()
    {
        return Ok(Reservations);
    }

    [HttpGet("{id:int}")]
    public ActionResult<ReservationDto> GetById(int id)
    {
        var reservation = Reservations.FirstOrDefault(reservation => reservation.Id == id);

        if (reservation is null)
        {
            return NotFound();
        }

        return Ok(reservation);
    }

    [HttpPost]
    public ActionResult<ReservationDto> Create(ReservationDto reservationDto)
    {
        reservationDto.Id = _nextId++;
        reservationDto.CreatedAt = DateTime.UtcNow;

        Reservations.Add(reservationDto);

        return CreatedAtAction(nameof(GetById), new { id = reservationDto.Id }, reservationDto);
    }

    [HttpPut("{id:int}")]
    public IActionResult Update(int id, ReservationDto reservationDto)
    {
        var reservation = Reservations.FirstOrDefault(reservation => reservation.Id == id);

        if (reservation is null)
        {
            return NotFound();
        }

        reservation.UserId = reservationDto.UserId;
        reservation.SpaceId = reservationDto.SpaceId;
        reservation.StartTime = reservationDto.StartTime;
        reservation.EndTime = reservationDto.EndTime;
        reservation.Status = reservationDto.Status;
        reservation.TotalAmount = reservationDto.TotalAmount;

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public IActionResult Delete(int id)
    {
        var reservation = Reservations.FirstOrDefault(reservation => reservation.Id == id);

        if (reservation is null)
        {
            return NotFound();
        }

        Reservations.Remove(reservation);

        return NoContent();
    }
}