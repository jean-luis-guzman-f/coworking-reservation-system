using CoworkingReservation.Application.Contract;
using CoworkingReservation.Application.Dtos;
using CoworkingReservation.Domain.Entities;
using CoworkingReservation.Infrastructure.Interfaces;

namespace CoworkingReservation.Application.Services;

public class PaymentService : IPaymentService
{
    private readonly IPaymentRepository _paymentRepository;
    private readonly IReservationRepository _reservationRepository;

    public PaymentService(
        IPaymentRepository paymentRepository,
        IReservationRepository reservationRepository)
    {
        _paymentRepository = paymentRepository;
        _reservationRepository = reservationRepository;
    }

    public async Task<IEnumerable<PaymentDto>> GetAllAsync()
    {
        var payments = await _paymentRepository.GetAllAsync();

        return payments.Select(payment => new PaymentDto
        {
            Id = payment.Id,
            ReservationId = payment.ReservationId,
            Amount = payment.Amount,
            Method = payment.Method.ToString(),
            Status = payment.Status.ToString(),
            TransactionReference = payment.TransactionReference,
            PaymentDate = payment.PaymentDate
        });
    }

    public async Task<PaymentDto?> GetByIdAsync(int id)
    {
        if (id <= 0)
        {
            throw new ArgumentException(
                "Payment id must be greater than zero.");
        }

        var payment = await _paymentRepository.GetByIdAsync(id);

        if (payment is null)
        {
            return null;
        }

        return new PaymentDto
        {
            Id = payment.Id,
            ReservationId = payment.ReservationId,
            Amount = payment.Amount,
            Method = payment.Method.ToString(),
            Status = payment.Status.ToString(),
            TransactionReference = payment.TransactionReference,
            PaymentDate = payment.PaymentDate
        };
    }

    public async Task<PaymentDto> CreateAsync(PaymentDto paymentDto)
    {
        ValidatePayment(paymentDto);

        var reservation = await _reservationRepository.GetByIdAsync(
            paymentDto.ReservationId);

        if (reservation is null)
        {
            throw new ArgumentException(
                "The selected reservation does not exist.");
        }

        var paymentAlreadyExists =
            await _paymentRepository.ExistsForReservationAsync(
                paymentDto.ReservationId);

        if (paymentAlreadyExists)
        {
            throw new ArgumentException(
                "A payment already exists for this reservation.");
        }

        if (!Enum.TryParse<PaymentMethod>(
                paymentDto.Method,
                true,
                out var paymentMethod))
        {
            throw new ArgumentException("Invalid payment method.");
        }

        if (!Enum.TryParse<PaymentStatus>(
                paymentDto.Status,
                true,
                out var paymentStatus))
        {
            throw new ArgumentException("Invalid payment status.");
        }

        var payment = new Payment
        {
            ReservationId = paymentDto.ReservationId,
            Amount = paymentDto.Amount,
            Method = paymentMethod,
            Status = paymentStatus,
            TransactionReference =
                string.IsNullOrWhiteSpace(
                    paymentDto.TransactionReference)
                    ? null
                    : paymentDto.TransactionReference.Trim(),
            PaymentDate = DateTime.UtcNow
        };

        await _paymentRepository.AddAsync(payment);

        paymentDto.Id = payment.Id;
        paymentDto.Method = payment.Method.ToString();
        paymentDto.Status = payment.Status.ToString();
        paymentDto.TransactionReference =
            payment.TransactionReference;
        paymentDto.PaymentDate = payment.PaymentDate;

        return paymentDto;
    }

    public async Task<bool> UpdateAsync(
        int id,
        PaymentDto paymentDto)
    {
        if (id <= 0)
        {
            throw new ArgumentException(
                "Payment id must be greater than zero.");
        }

        ValidatePayment(paymentDto);

        var payment = await _paymentRepository.GetByIdAsync(id);

        if (payment is null)
        {
            return false;
        }

        var reservation = await _reservationRepository.GetByIdAsync(
            paymentDto.ReservationId);

        if (reservation is null)
        {
            throw new ArgumentException(
                "The selected reservation does not exist.");
        }

        var duplicatePayment =
            await _paymentRepository.ExistsForReservationAsync(
                paymentDto.ReservationId,
                id);

        if (duplicatePayment)
        {
            throw new ArgumentException(
                "Another payment already exists for this reservation.");
        }

        if (!Enum.TryParse<PaymentMethod>(
                paymentDto.Method,
                true,
                out var paymentMethod))
        {
            throw new ArgumentException("Invalid payment method.");
        }

        if (!Enum.TryParse<PaymentStatus>(
                paymentDto.Status,
                true,
                out var paymentStatus))
        {
            throw new ArgumentException("Invalid payment status.");
        }

        payment.ReservationId = paymentDto.ReservationId;
        payment.Amount = paymentDto.Amount;
        payment.Method = paymentMethod;
        payment.Status = paymentStatus;
        payment.TransactionReference =
            string.IsNullOrWhiteSpace(
                paymentDto.TransactionReference)
                ? null
                : paymentDto.TransactionReference.Trim();

        await _paymentRepository.UpdateAsync(payment);

        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        if (id <= 0)
        {
            throw new ArgumentException(
                "Payment id must be greater than zero.");
        }

        var payment = await _paymentRepository.GetByIdAsync(id);

        if (payment is null)
        {
            return false;
        }

        await _paymentRepository.DeleteAsync(payment);

        return true;
    }

    private static void ValidatePayment(PaymentDto paymentDto)
    {
        if (paymentDto is null)
        {
            throw new ArgumentNullException(nameof(paymentDto));
        }

        if (paymentDto.ReservationId <= 0)
        {
            throw new ArgumentException(
                "Reservation id must be greater than zero.");
        }

        if (paymentDto.Amount <= 0)
        {
            throw new ArgumentException(
                "Payment amount must be greater than zero.");
        }

        if (string.IsNullOrWhiteSpace(paymentDto.Method))
        {
            throw new ArgumentException(
                "Payment method is required.");
        }

        if (string.IsNullOrWhiteSpace(paymentDto.Status))
        {
            throw new ArgumentException(
                "Payment status is required.");
        }

        if (!string.IsNullOrWhiteSpace(
                paymentDto.TransactionReference) &&
            paymentDto.TransactionReference.Trim().Length > 150)
        {
            throw new ArgumentException(
                "Transaction reference cannot exceed 150 characters.");
        }
    }
}