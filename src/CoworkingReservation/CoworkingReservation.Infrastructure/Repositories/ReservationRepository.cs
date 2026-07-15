using CoworkingReservation.Domain.Entities;
using CoworkingReservation.Infrastructure.Context;
using CoworkingReservation.Infrastructure.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CoworkingReservation.Infrastructure.Repositories;

public class ReservationRepository : IReservationRepository
{
    private readonly ApplicationDbContext _context;

    public ReservationRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Reservation>> GetAllAsync()
    {
        return await _context.Reservation.ToListAsync();
    }

    public async Task<Reservation?> GetByIdAsync(int id)
    {
        return await _context.Reservation.FindAsync(id);
    }

    public async Task<bool> ExistsAsync(int id)
    {
        return await _context.Reservation.AnyAsync(reservation => reservation.Id == id);
    }

    public async Task<bool> HasOverlapAsync(
        int spaceId,
        DateTime startTime,
        DateTime endTime,
        int? excludedReservationId = null)
    {
        return await _context.Reservation.AnyAsync(reservation =>
            reservation.SpaceId == spaceId &&
            reservation.StartTime < endTime &&
            reservation.EndTime > startTime &&
            (!excludedReservationId.HasValue ||
             reservation.Id != excludedReservationId.Value));
    }

    public async Task<Reservation> AddAsync(Reservation reservation)
    {
        _context.Reservation.Add(reservation);
        await _context.SaveChangesAsync();
        return reservation;
    }

    public async Task UpdateAsync(Reservation reservation)
    {
        _context.Reservation.Update(reservation);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Reservation reservation)
    {
        _context.Reservation.Remove(reservation);
        await _context.SaveChangesAsync();
    }
}