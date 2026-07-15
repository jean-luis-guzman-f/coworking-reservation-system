using CoworkingReservation.Domain.Entities;
using CoworkingReservation.Infrastructure.Context;
using CoworkingReservation.Infrastructure.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CoworkingReservation.Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly ApplicationDbContext _context;

    public UserRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<User>> GetAllAsync()
    {
        return await _context.Users.ToListAsync();
    }

    public async Task<User?> GetByIdAsync(int id)
    {
        return await _context.Users.FindAsync(id);
    }

    public async Task<bool> ExistsAsync(int id)
    {
        return await _context.Users.AnyAsync(user => user.Id == id);
    }

    public async Task<bool> EmailExistsAsync(string email, int? excludedUserId = null)
    {
        return await _context.Users.AnyAsync(user =>
            user.Email == email &&
            (!excludedUserId.HasValue || user.Id != excludedUserId.Value));
    }

    public async Task<User> AddAsync(User user)
    {
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return user;
    }

    public async Task UpdateAsync(User user)
    {
        _context.Users.Update(user);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(User user)
    {
        _context.Users.Remove(user);
        await _context.SaveChangesAsync();
    }
}