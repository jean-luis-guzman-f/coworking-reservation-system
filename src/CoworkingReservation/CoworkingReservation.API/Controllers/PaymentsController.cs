using CoworkingReservation.Application.Contract;
using CoworkingReservation.Application.Dtos;
using Microsoft.AspNetCore.Mvc;

namespace CoworkingReservation.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaymentsController : ControllerBase
{
    private readonly IPaymentService _paymentService;

    public PaymentsController(IPaymentService paymentService)
    {
        _paymentService = paymentService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<PaymentDto>>> GetAll()
    {
        var payments = await _paymentService.GetAllAsync();

        return Ok(payments);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<PaymentDto>> GetById(int id)
    {
        try
        {
            var payment = await _paymentService.GetByIdAsync(id);

            if (payment is null)
            {
                return NotFound();
            }

            return Ok(payment);
        }
        catch (ArgumentException exception)
        {
            return BadRequest(exception.Message);
        }
    }

    [HttpPost]
    public async Task<ActionResult<PaymentDto>> Create(
        PaymentDto paymentDto)
    {
        try
        {
            var createdPayment =
                await _paymentService.CreateAsync(paymentDto);

            return CreatedAtAction(
                nameof(GetById),
                new { id = createdPayment.Id },
                createdPayment);
        }
        catch (ArgumentException exception)
        {
            return BadRequest(exception.Message);
        }
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(
        int id,
        PaymentDto paymentDto)
    {
        try
        {
            var updated =
                await _paymentService.UpdateAsync(id, paymentDto);

            if (!updated)
            {
                return NotFound();
            }

            return NoContent();
        }
        catch (ArgumentException exception)
        {
            return BadRequest(exception.Message);
        }
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var deleted = await _paymentService.DeleteAsync(id);

            if (!deleted)
            {
                return NotFound();
            }

            return NoContent();
        }
        catch (ArgumentException exception)
        {
            return BadRequest(exception.Message);
        }
    }
}