namespace CoworkingReservation.Infrastructure.Models;

public class PaymentDto
{
    public int Id { get; set; }

    public int ReservationId { get; set; }

    public decimal Amount { get; set; }

    public string Method { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    public string? TransactionReference { get; set; }

    public DateTime PaymentDate { get; set; }
}