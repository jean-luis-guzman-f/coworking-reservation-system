using CoworkingReservation.Application.Contract;
using CoworkingReservation.Application.Dtos;
using CoworkingReservation.Domain.Entities;
using CoworkingReservation.Infrastructure.Interfaces;

namespace CoworkingReservation.Application.Services;

public class SpaceService : ISpaceService
{
    private readonly ISpaceRepository _spaceRepository;

    public SpaceService(ISpaceRepository spaceRepository)
    {
        _spaceRepository = spaceRepository;
    }

    public async Task<IEnumerable<SpaceDto>> GetAllAsync()
    {
        var spaces = await _spaceRepository.GetAllAsync();

        return spaces.Select(space => new SpaceDto
        {
            Id = space.Id,
            Name = space.Name,
            Description = space.Description,
            Type = space.Type.ToString(),
            Capacity = space.Capacity,
            HourlyRate = space.HourlyRate,
            IsAvailable = space.IsAvailable,
            CreatedAt = space.CreatedAt
        });
    }

    public async Task<SpaceDto?> GetByIdAsync(int id)
    {
        if (id <= 0)
        {
            throw new ArgumentException(
                "Space id must be greater than zero.");
        }

        var space = await _spaceRepository.GetByIdAsync(id);

        if (space is null)
        {
            return null;
        }

        return new SpaceDto
        {
            Id = space.Id,
            Name = space.Name,
            Description = space.Description,
            Type = space.Type.ToString(),
            Capacity = space.Capacity,
            HourlyRate = space.HourlyRate,
            IsAvailable = space.IsAvailable,
            CreatedAt = space.CreatedAt
        };
    }

    public async Task<SpaceDto> CreateAsync(SpaceDto spaceDto)
    {
        ValidateSpace(spaceDto);

        if (!Enum.TryParse<SpaceType>(
                spaceDto.Type,
                true,
                out var spaceType))
        {
            throw new ArgumentException("Invalid space type.");
        }

        var space = new Space
        {
            Name = spaceDto.Name.Trim(),
            Description = string.IsNullOrWhiteSpace(spaceDto.Description)
                ? null
                : spaceDto.Description.Trim(),
            Type = spaceType,
            Capacity = spaceDto.Capacity,
            HourlyRate = spaceDto.HourlyRate,
            IsAvailable = spaceDto.IsAvailable,
            CreatedAt = DateTime.UtcNow
        };

        await _spaceRepository.AddAsync(space);

        spaceDto.Id = space.Id;
        spaceDto.Name = space.Name;
        spaceDto.Description = space.Description;
        spaceDto.Type = space.Type.ToString();
        spaceDto.Capacity = space.Capacity;
        spaceDto.HourlyRate = space.HourlyRate;
        spaceDto.IsAvailable = space.IsAvailable;
        spaceDto.CreatedAt = space.CreatedAt;

        return spaceDto;
    }

    public async Task<bool> UpdateAsync(int id, SpaceDto spaceDto)
    {
        if (id <= 0)
        {
            throw new ArgumentException(
                "Space id must be greater than zero.");
        }

        ValidateSpace(spaceDto);

        if (!Enum.TryParse<SpaceType>(
                spaceDto.Type,
                true,
                out var spaceType))
        {
            throw new ArgumentException("Invalid space type.");
        }

        var space = await _spaceRepository.GetByIdAsync(id);

        if (space is null)
        {
            return false;
        }

        space.Name = spaceDto.Name.Trim();
        space.Description = string.IsNullOrWhiteSpace(spaceDto.Description)
            ? null
            : spaceDto.Description.Trim();
        space.Type = spaceType;
        space.Capacity = spaceDto.Capacity;
        space.HourlyRate = spaceDto.HourlyRate;
        space.IsAvailable = spaceDto.IsAvailable;

        await _spaceRepository.UpdateAsync(space);

        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        if (id <= 0)
        {
            throw new ArgumentException(
                "Space id must be greater than zero.");
        }

        var space = await _spaceRepository.GetByIdAsync(id);

        if (space is null)
        {
            return false;
        }

        await _spaceRepository.DeleteAsync(space);

        return true;
    }

    private static void ValidateSpace(SpaceDto spaceDto)
    {
        if (spaceDto is null)
        {
            throw new ArgumentNullException(nameof(spaceDto));
        }

        if (string.IsNullOrWhiteSpace(spaceDto.Name))
        {
            throw new ArgumentException("Space name is required.");
        }

        if (spaceDto.Name.Trim().Length < 3)
        {
            throw new ArgumentException(
                "Space name must contain at least 3 characters.");
        }

        if (spaceDto.Name.Trim().Length > 150)
        {
            throw new ArgumentException(
                "Space name cannot exceed 150 characters.");
        }

        if (!string.IsNullOrWhiteSpace(spaceDto.Description) &&
            spaceDto.Description.Trim().Length > 500)
        {
            throw new ArgumentException(
                "Description cannot exceed 500 characters.");
        }

        if (string.IsNullOrWhiteSpace(spaceDto.Type))
        {
            throw new ArgumentException("Space type is required.");
        }

        if (spaceDto.Capacity <= 0)
        {
            throw new ArgumentException(
                "Capacity must be greater than zero.");
        }

        if (spaceDto.HourlyRate <= 0)
        {
            throw new ArgumentException(
                "Hourly rate must be greater than zero.");
        }
    }
}