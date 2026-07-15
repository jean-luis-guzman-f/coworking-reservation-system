using CoworkingReservation.Domain.Entities;

namespace CoworkingReservation.Infrastructure.Interfaces;

public interface ISpaceRepository
{
    Task<IEnumerable<Space>> GetAllAsync();
    Task<Space?> GetByIdAsync(int id);
    Task<bool> ExistsAsync(int id);
    Task<Space> AddAsync(Space space);
    Task UpdateAsync(Space space);
    Task DeleteAsync(Space space);
}