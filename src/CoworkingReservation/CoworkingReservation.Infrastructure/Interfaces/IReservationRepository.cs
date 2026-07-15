using CoworkingReservation.Domain.Entities;

namespace CoworkingReservation.Infrastructure.Interfaces;

public interface IReservationRepository
{
    Task<IEnumerable<Reservation>> GetAllAsync();
    Task<Reservation?> GetByIdAsync(int id);
    Task<bool> ExistsAsync(int id);

    Task<bool> HasOverlapAsync(
        int spaceId,
        DateTime startTime,
        DateTime endTime,
        int? excludedReservationId = null);

    Task<Reservation> AddAsync(Reservation reservation);
    Task UpdateAsync(Reservation reservation);
    Task DeleteAsync(Reservation reservation);
}