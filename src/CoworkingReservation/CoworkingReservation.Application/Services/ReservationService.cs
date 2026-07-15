using CoworkingReservation.Application.Contract;
using CoworkingReservation.Application.Dtos;
using CoworkingReservation.Domain.Entities;
using CoworkingReservation.Infrastructure.Interfaces;

namespace CoworkingReservation.Application.Services;

public class ReservationService : IReservationService
{
    private readonly IReservationRepository _reservationRepository;
    private readonly IUserRepository _userRepository;
    private readonly ISpaceRepository _spaceRepository;

    public ReservationService(
        IReservationRepository reservationRepository,
        IUserRepository userRepository,
        ISpaceRepository spaceRepository)
    {
        _reservationRepository = reservationRepository;
        _userRepository = userRepository;
        _spaceRepository = spaceRepository;
    }

    public async Task<IEnumerable<ReservationDto>> GetAllAsync()
    {
        var reservations = await _reservationRepository.GetAllAsync();

        return reservations.Select(reservation => new ReservationDto
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
    }

    public async Task<ReservationDto?> GetByIdAsync(int id)
    {
        if (id <= 0)
        {
            throw new ArgumentException(
                "Reservation id must be greater than zero.");
        }

        var reservation = await _reservationRepository.GetByIdAsync(id);

        if (reservation is null)
        {
            return null;
        }

        return new ReservationDto
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
    }

    public async Task<ReservationDto> CreateAsync(
        ReservationDto reservationDto)
    {
        ValidateReservation(reservationDto);

        var user = await _userRepository.GetByIdAsync(
            reservationDto.UserId);

        if (user is null)
        {
            throw new ArgumentException(
                "The selected user does not exist.");
        }

        var space = await _spaceRepository.GetByIdAsync(
            reservationDto.SpaceId);

        if (space is null)
        {
            throw new ArgumentException(
                "The selected space does not exist.");
        }

        if (!space.IsAvailable)
        {
            throw new ArgumentException(
                "The selected space is not available.");
        }

        if (!Enum.TryParse<ReservationStatus>(
                reservationDto.Status,
                true,
                out var reservationStatus))
        {
            throw new ArgumentException(
                "Invalid reservation status.");
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

        return reservationDto;
    }

    public async Task<bool> UpdateAsync(
        int id,
        ReservationDto reservationDto)
    {
        if (id <= 0)
        {
            throw new ArgumentException(
                "Reservation id must be greater than zero.");
        }

        ValidateReservation(reservationDto);

        var reservation = await _reservationRepository.GetByIdAsync(id);

        if (reservation is null)
        {
            return false;
        }

        var user = await _userRepository.GetByIdAsync(
            reservationDto.UserId);

        if (user is null)
        {
            throw new ArgumentException(
                "The selected user does not exist.");
        }

        var space = await _spaceRepository.GetByIdAsync(
            reservationDto.SpaceId);

        if (space is null)
        {
            throw new ArgumentException(
                "The selected space does not exist.");
        }

        if (!space.IsAvailable)
        {
            throw new ArgumentException(
                "The selected space is not available.");
        }

        if (!Enum.TryParse<ReservationStatus>(
                reservationDto.Status,
                true,
                out var reservationStatus))
        {
            throw new ArgumentException(
                "Invalid reservation status.");
        }

        reservation.UserId = reservationDto.UserId;
        reservation.SpaceId = reservationDto.SpaceId;
        reservation.StartTime = reservationDto.StartTime;
        reservation.EndTime = reservationDto.EndTime;
        reservation.Status = reservationStatus;
        reservation.TotalAmount = reservationDto.TotalAmount;

        await _reservationRepository.UpdateAsync(reservation);

        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        if (id <= 0)
        {
            throw new ArgumentException(
                "Reservation id must be greater than zero.");
        }

        var reservation = await _reservationRepository.GetByIdAsync(id);

        if (reservation is null)
        {
            return false;
        }

        await _reservationRepository.DeleteAsync(reservation);

        return true;
    }

    private static void ValidateReservation(
        ReservationDto reservationDto)
    {
        if (reservationDto is null)
        {
            throw new ArgumentNullException(nameof(reservationDto));
        }

        if (reservationDto.UserId <= 0)
        {
            throw new ArgumentException(
                "User id must be greater than zero.");
        }

        if (reservationDto.SpaceId <= 0)
        {
            throw new ArgumentException(
                "Space id must be greater than zero.");
        }

        if (reservationDto.StartTime == default)
        {
            throw new ArgumentException(
                "Start time is required.");
        }

        if (reservationDto.EndTime == default)
        {
            throw new ArgumentException(
                "End time is required.");
        }

        if (reservationDto.EndTime <= reservationDto.StartTime)
        {
            throw new ArgumentException(
                "End time must be later than start time.");
        }

        if (string.IsNullOrWhiteSpace(reservationDto.Status))
        {
            throw new ArgumentException(
                "Reservation status is required.");
        }

        if (reservationDto.TotalAmount <= 0)
        {
            throw new ArgumentException(
                "Total amount must be greater than zero.");
        }
    }
}