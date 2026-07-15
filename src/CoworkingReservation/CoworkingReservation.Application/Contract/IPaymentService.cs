using CoworkingReservation.Application.Dtos;

namespace CoworkingReservation.Application.Contract;

public interface IPaymentService
{
    Task<IEnumerable<PaymentDto>> GetAllAsync();

    Task<PaymentDto?> GetByIdAsync(int id);

    Task<PaymentDto> CreateAsync(PaymentDto paymentDto);

    Task<bool> UpdateAsync(int id, PaymentDto paymentDto);

    Task<bool> DeleteAsync(int id);
}