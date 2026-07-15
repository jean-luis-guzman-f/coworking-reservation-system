using CoworkingReservation.Domain.Entities;

namespace CoworkingReservation.Infrastructure.Interfaces;

public interface IPaymentRepository
{
    Task<IEnumerable<Payment>> GetAllAsync();
    Task<Payment?> GetByIdAsync(int id);

    Task<bool> ExistsForReservationAsync(
        int reservationId,
        int? excludedPaymentId = null);

    Task<Payment> AddAsync(Payment payment);
    Task UpdateAsync(Payment payment);
    Task DeleteAsync(Payment payment);
}