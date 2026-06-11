using CoworkingReservation.API.Models.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace CoworkingReservation.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaymentsController : ControllerBase
{
    private static readonly List<PaymentDto> Payments =
    [
        new PaymentDto
        {
            Id = 1,
            ReservationId = 1,
            Amount = 500,
            Method = "Cash",
            Status = "Pending",
            TransactionReference = "PAY-001",
            PaymentDate = DateTime.UtcNow
        }
    ];

    private static int _nextId = 2;

    [HttpGet]
    public ActionResult<IEnumerable<PaymentDto>> GetAll()
    {
        return Ok(Payments);
    }

    [HttpGet("{id:int}")]
    public ActionResult<PaymentDto> GetById(int id)
    {
        var payment = Payments.FirstOrDefault(payment => payment.Id == id);

        if (payment is null)
        {
            return NotFound();
        }

        return Ok(payment);
    }

    [HttpPost]
    public ActionResult<PaymentDto> Create(PaymentDto paymentDto)
    {
        paymentDto.Id = _nextId++;
        paymentDto.PaymentDate = DateTime.UtcNow;

        Payments.Add(paymentDto);

        return CreatedAtAction(nameof(GetById), new { id = paymentDto.Id }, paymentDto);
    }

    [HttpPut("{id:int}")]
    public IActionResult Update(int id, PaymentDto paymentDto)
    {
        var payment = Payments.FirstOrDefault(payment => payment.Id == id);

        if (payment is null)
        {
            return NotFound();
        }

        payment.ReservationId = paymentDto.ReservationId;
        payment.Amount = paymentDto.Amount;
        payment.Method = paymentDto.Method;
        payment.Status = paymentDto.Status;
        payment.TransactionReference = paymentDto.TransactionReference;

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public IActionResult Delete(int id)
    {
        var payment = Payments.FirstOrDefault(payment => payment.Id == id);

        if (payment is null)
        {
            return NotFound();
        }

        Payments.Remove(payment);

        return NoContent();
    }
}