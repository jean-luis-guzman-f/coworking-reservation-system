using CoworkingReservation.Domain.Entities;
using CoworkingReservation.Infrastructure.Context;
using CoworkingReservation.Infrastructure.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CoworkingReservation.Infrastructure.Repositories;

public class SpaceRepository : ISpaceRepository
{
    private readonly ApplicationDbContext _context;

    public SpaceRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Space>> GetAllAsync()
    {
        return await _context.Spaces.ToListAsync();
    }

    public async Task<Space?> GetByIdAsync(int id)
    {
        return await _context.Spaces.FindAsync(id);
    }

    public async Task<bool> ExistsAsync(int id)
    {
        return await _context.Spaces.AnyAsync(space => space.Id == id);
    }

    public async Task<Space> AddAsync(Space space)
    {
        _context.Spaces.Add(space);
        await _context.SaveChangesAsync();
        return space;
    }

    public async Task UpdateAsync(Space space)
    {
        _context.Spaces.Update(space);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Space space)
    {
        _context.Spaces.Remove(space);
        await _context.SaveChangesAsync();
    }
}