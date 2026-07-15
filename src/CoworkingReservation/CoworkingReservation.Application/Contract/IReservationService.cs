using CoworkingReservation.Application.Dtos;

namespace CoworkingReservation.Application.Contract;

public interface IReservationService
{
    Task<IEnumerable<ReservationDto>> GetAllAsync();

    Task<ReservationDto?> GetByIdAsync(int id);

    Task<ReservationDto> CreateAsync(ReservationDto reservationDto);

    Task<bool> UpdateAsync(int id, ReservationDto reservationDto);

    Task<bool> DeleteAsync(int id);
}