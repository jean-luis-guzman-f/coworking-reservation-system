using CoworkingReservation.Domain.Entities;
using CoworkingReservation.Infrastructure.Interfaces;
using CoworkingReservation.Application.Dtos;
using Microsoft.AspNetCore.Mvc;

namespace CoworkingReservation.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReservationsController : ControllerBase
{
    private readonly IReservationRepository _reservationRepository;
    private readonly IUserRepository _userRepository;
    private readonly ISpaceRepository _spaceRepository;

    public ReservationsController(
        IReservationRepository reservationRepository,
        IUserRepository userRepository,
        ISpaceRepository spaceRepository)
    {
        _reservationRepository = reservationRepository;
        _userRepository = userRepository;
        _spaceRepository = spaceRepository;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ReservationDto>>> GetAll()
    {
        var reservations = await _reservationRepository.GetAllAsync();

        var reservationDtos = reservations.Select(reservation => new ReservationDto
        {
            Id = reservation.Id,
            UserId = reservation.UserId,
            SpaceId = reservation.SpaceId,
            StartTime = reservation.StartTime,
            EndTime = reservation.EndTime,
            Status = reservation.Status.ToString(),
            TotalAmount = reservation.TotalAmount,
            CreatedAt = reservation.CreatedAt
        });

        return Ok(reservationDtos);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ReservationDto>> GetById(int id)
    {
        var reservation = await _reservationRepository.GetByIdAsync(id);

        if (reservation is null)
        {
            return NotFound();
        }

        var reservationDto = new ReservationDto
        {
            Id = reservation.Id,
            UserId = reservation.UserId,
            SpaceId = reservation.SpaceId,
            StartTime = reservation.StartTime,
            EndTime = reservation.EndTime,
            Status = reservation.Status.ToString(),
            TotalAmount = reservation.TotalAmount,
            CreatedAt = reservation.CreatedAt
        };

        return Ok(reservationDto);
    }

    [HttpPost]
    public async Task<ActionResult<ReservationDto>> Create(ReservationDto reservationDto)
    {
        var userExists = await _userRepository.ExistsAsync(reservationDto.UserId);

        if (!userExists)
        {
            return BadRequest("The selected user does not exist.");
        }

        var spaceExists = await _spaceRepository.ExistsAsync(reservationDto.SpaceId);

        if (!spaceExists)
        {
            return BadRequest("The selected space does not exist.");
        }

        if (reservationDto.EndTime <= reservationDto.StartTime)
        {
            return BadRequest("End time must be greater than start time.");
        }

        if (!Enum.TryParse<ReservationStatus>(
                reservationDto.Status,
                true,
                out var reservationStatus))
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

        await _reservationRepository.AddAsync(reservation);

        reservationDto.Id = reservation.Id;
        reservationDto.Status = reservation.Status.ToString();
        reservationDto.CreatedAt = reservation.CreatedAt;

        return CreatedAtAction(
            nameof(GetById),
            new { id = reservationDto.Id },
            reservationDto);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, ReservationDto reservationDto)
    {
        var reservation = await _reservationRepository.GetByIdAsync(id);

        if (reservation is null)
        {
            return NotFound();
        }

        var userExists = await _userRepository.ExistsAsync(reservationDto.UserId);

        if (!userExists)
        {
            return BadRequest("The selected user does not exist.");
        }

        var spaceExists = await _spaceRepository.ExistsAsync(reservationDto.SpaceId);

        if (!spaceExists)
        {
            return BadRequest("The selected space does not exist.");
        }

        if (reservationDto.EndTime <= reservationDto.StartTime)
        {
            return BadRequest("End time must be greater than start time.");
        }

        if (!Enum.TryParse<ReservationStatus>(
                reservationDto.Status,
                true,
                out var reservationStatus))
        {
            return BadRequest("Invalid reservation status.");
        }

        reservation.UserId = reservationDto.UserId;
        reservation.SpaceId = reservationDto.SpaceId;
        reservation.StartTime = reservationDto.StartTime;
        reservation.EndTime = reservationDto.EndTime;
        reservation.Status = reservationStatus;
        reservation.TotalAmount = reservationDto.TotalAmount;

        await _reservationRepository.UpdateAsync(reservation);

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var reservation = await _reservationRepository.GetByIdAsync(id);

        if (reservation is null)
        {
            return NotFound();
        }

        await _reservationRepository.DeleteAsync(reservation);

        return NoContent();
    }
}