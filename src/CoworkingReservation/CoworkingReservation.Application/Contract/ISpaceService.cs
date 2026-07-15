using CoworkingReservation.Application.Dtos;

namespace CoworkingReservation.Application.Contract;

public interface ISpaceService
{
    Task<IEnumerable<SpaceDto>> GetAllAsync();

    Task<SpaceDto?> GetByIdAsync(int id);

    Task<SpaceDto> CreateAsync(SpaceDto spaceDto);

    Task<bool> UpdateAsync(int id, SpaceDto spaceDto);

    Task<bool> DeleteAsync(int id);
}