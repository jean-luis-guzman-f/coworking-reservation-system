using CoworkingReservation.Domain.Entities;
using CoworkingReservation.Infrastructure.Context;
using CoworkingReservation.Infrastructure.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CoworkingReservation.Infrastructure.Repositories;

public class PaymentRepository : IPaymentRepository
{
    private readonly ApplicationDbContext _context;

    public PaymentRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Payment>> GetAllAsync()
    {
        return await _context.Payment.ToListAsync();
    }

    public async Task<Payment?> GetByIdAsync(int id)
    {
        return await _context.Payment.FindAsync(id);
    }

    public async Task<bool> ExistsForReservationAsync(
        int reservationId,
        int? excludedPaymentId = null)
    {
        return await _context.Payment.AnyAsync(payment =>
            payment.ReservationId == reservationId &&
            (!excludedPaymentId.HasValue ||
             payment.Id != excludedPaymentId.Value));
    }

    public async Task<Payment> AddAsync(Payment payment)
    {
        _context.Payment.Add(payment);
        await _context.SaveChangesAsync();
        return payment;
    }

    public async Task UpdateAsync(Payment payment)
    {
        _context.Payment.Update(payment);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Payment payment)
    {
        _context.Payment.Remove(payment);
        await _context.SaveChangesAsync();
    }
}