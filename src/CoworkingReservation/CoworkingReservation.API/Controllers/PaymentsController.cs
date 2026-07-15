using CoworkingReservation.Domain.Entities;
using CoworkingReservation.Infrastructure.Interfaces;
using CoworkingReservation.Infrastructure.Models;
using Microsoft.AspNetCore.Mvc;

namespace CoworkingReservation.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaymentsController : ControllerBase
{
    private readonly IPaymentRepository _paymentRepository;
    private readonly IReservationRepository _reservationRepository;

    public PaymentsController(
        IPaymentRepository paymentRepository,
        IReservationRepository reservationRepository)
    {
        _paymentRepository = paymentRepository;
        _reservationRepository = reservationRepository;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<PaymentDto>>> GetAll()
    {
        var payments = await _paymentRepository.GetAllAsync();

        var paymentDtos = payments.Select(payment => new PaymentDto
        {
            Id = payment.Id,
            ReservationId = payment.ReservationId,
            Amount = payment.Amount,
            Method = payment.Method.ToString(),
            Status = payment.Status.ToString(),
            TransactionReference = payment.TransactionReference,
            PaymentDate = payment.PaymentDate
        });

        return Ok(paymentDtos);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<PaymentDto>> GetById(int id)
    {
        var payment = await _paymentRepository.GetByIdAsync(id);

        if (payment is null)
        {
            return NotFound();
        }

        var paymentDto = new PaymentDto
        {
            Id = payment.Id,
            ReservationId = payment.ReservationId,
            Amount = payment.Amount,
            Method = payment.Method.ToString(),
            Status = payment.Status.ToString(),
            TransactionReference = payment.TransactionReference,
            PaymentDate = payment.PaymentDate
        };

        return Ok(paymentDto);
    }

    [HttpPost]
    public async Task<ActionResult<PaymentDto>> Create(PaymentDto paymentDto)
    {
        var reservationExists =
            await _reservationRepository.ExistsAsync(paymentDto.ReservationId);

        if (!reservationExists)
        {
            return BadRequest("The selected reservation does not exist.");
        }

        var reservationAlreadyHasPayment =
            await _paymentRepository.ExistsForReservationAsync(
                paymentDto.ReservationId);

        if (reservationAlreadyHasPayment)
        {
            return BadRequest("The selected reservation already has a payment.");
        }

        if (!Enum.TryParse<PaymentMethod>(
                paymentDto.Method,
                true,
                out var paymentMethod))
        {
            return BadRequest("Invalid payment method.");
        }

        if (!Enum.TryParse<PaymentStatus>(
                paymentDto.Status,
                true,
                out var paymentStatus))
        {
            return BadRequest("Invalid payment status.");
        }

        var payment = new Payment
        {
            ReservationId = paymentDto.ReservationId,
            Amount = paymentDto.Amount,
            Method = paymentMethod,
            Status = paymentStatus,
            TransactionReference = paymentDto.TransactionReference,
            PaymentDate = DateTime.UtcNow
        };

        await _paymentRepository.AddAsync(payment);

        paymentDto.Id = payment.Id;
        paymentDto.Method = payment.Method.ToString();
        paymentDto.Status = payment.Status.ToString();
        paymentDto.PaymentDate = payment.PaymentDate;

        return CreatedAtAction(
            nameof(GetById),
            new { id = paymentDto.Id },
            paymentDto);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, PaymentDto paymentDto)
    {
        var payment = await _paymentRepository.GetByIdAsync(id);

        if (payment is null)
        {
            return NotFound();
        }

        var reservationExists =
            await _reservationRepository.ExistsAsync(paymentDto.ReservationId);

        if (!reservationExists)
        {
            return BadRequest("The selected reservation does not exist.");
        }

        var reservationAlreadyHasAnotherPayment =
            await _paymentRepository.ExistsForReservationAsync(
                paymentDto.ReservationId,
                id);

        if (reservationAlreadyHasAnotherPayment)
        {
            return BadRequest(
                "The selected reservation already has another payment.");
        }

        if (!Enum.TryParse<PaymentMethod>(
                paymentDto.Method,
                true,
                out var paymentMethod))
        {
            return BadRequest("Invalid payment method.");
        }

        if (!Enum.TryParse<PaymentStatus>(
                paymentDto.Status,
                true,
                out var paymentStatus))
        {
            return BadRequest("Invalid payment status.");
        }

        payment.ReservationId = paymentDto.ReservationId;
        payment.Amount = paymentDto.Amount;
        payment.Method = paymentMethod;
        payment.Status = paymentStatus;
        payment.TransactionReference = paymentDto.TransactionReference;

        await _paymentRepository.UpdateAsync(payment);

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var payment = await _paymentRepository.GetByIdAsync(id);

        if (payment is null)
        {
            return NotFound();
        }

        await _paymentRepository.DeleteAsync(payment);

        return NoContent();
    }
}