using CoworkingReservation.Infrastructure.Context;
using CoworkingReservation.Infrastructure.Models;
using CoworkingReservation.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CoworkingReservation.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaymentsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public PaymentsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<PaymentDto>>> GetAll()
    {
        var payments = await _context.Payment
            .Select(payment => new PaymentDto
            {
                Id = payment.Id,
                ReservationId = payment.ReservationId,
                Amount = payment.Amount,
                Method = payment.Method.ToString(),
                Status = payment.Status.ToString(),
                TransactionReference = payment.TransactionReference,
                PaymentDate = payment.PaymentDate
            })
            .ToListAsync();

        return Ok(payments);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<PaymentDto>> GetById(int id)
    {
        var payment = await _context.Payment
            .Where(payment => payment.Id == id)
            .Select(payment => new PaymentDto
            {
                Id = payment.Id,
                ReservationId = payment.ReservationId,
                Amount = payment.Amount,
                Method = payment.Method.ToString(),
                Status = payment.Status.ToString(),
                TransactionReference = payment.TransactionReference,
                PaymentDate = payment.PaymentDate
            })
            .FirstOrDefaultAsync();

        if (payment is null)
        {
            return NotFound();
        }

        return Ok(payment);
    }

    [HttpPost]
    public async Task<ActionResult<PaymentDto>> Create(PaymentDto paymentDto)
    {
        var reservationExists = await _context.Reservation
            .AnyAsync(reservation => reservation.Id == paymentDto.ReservationId);

        if (!reservationExists)
        {
            return BadRequest("The selected reservation does not exist.");
        }

        var reservationAlreadyHasPayment = await _context.Payment
            .AnyAsync(payment => payment.ReservationId == paymentDto.ReservationId);

        if (reservationAlreadyHasPayment)
        {
            return BadRequest("The selected reservation already has a payment.");
        }

        if (!Enum.TryParse<PaymentMethod>(paymentDto.Method, true, out var paymentMethod))
        {
            return BadRequest("Invalid payment method.");
        }

        if (!Enum.TryParse<PaymentStatus>(paymentDto.Status, true, out var paymentStatus))
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

        _context.Payment.Add(payment);
        await _context.SaveChangesAsync();

        paymentDto.Id = payment.Id;
        paymentDto.Method = payment.Method.ToString();
        paymentDto.Status = payment.Status.ToString();
        paymentDto.PaymentDate = payment.PaymentDate;

        return CreatedAtAction(nameof(GetById), new { id = paymentDto.Id }, paymentDto);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, PaymentDto paymentDto)
    {
        var payment = await _context.Payment.FindAsync(id);

        if (payment is null)
        {
            return NotFound();
        }

        var reservationExists = await _context.Reservation
            .AnyAsync(reservation => reservation.Id == paymentDto.ReservationId);

        if (!reservationExists)
        {
            return BadRequest("The selected reservation does not exist.");
        }

        var reservationAlreadyHasAnotherPayment = await _context.Payment
            .AnyAsync(existingPayment =>
                existingPayment.ReservationId == paymentDto.ReservationId &&
                existingPayment.Id != id);

        if (reservationAlreadyHasAnotherPayment)
        {
            return BadRequest("The selected reservation already has another payment.");
        }

        if (!Enum.TryParse<PaymentMethod>(paymentDto.Method, true, out var paymentMethod))
        {
            return BadRequest("Invalid payment method.");
        }

        if (!Enum.TryParse<PaymentStatus>(paymentDto.Status, true, out var paymentStatus))
        {
            return BadRequest("Invalid payment status.");
        }

        payment.ReservationId = paymentDto.ReservationId;
        payment.Amount = paymentDto.Amount;
        payment.Method = paymentMethod;
        payment.Status = paymentStatus;
        payment.TransactionReference = paymentDto.TransactionReference;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var payment = await _context.Payment.FindAsync(id);

        if (payment is null)
        {
            return NotFound();
        }

        _context.Payment.Remove(payment);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}