namespace CoworkingReservation.API.Models.Entities;

public class Payment
{
    public int Id { get; set; }

    public int ReservationId { get; set; }

    public decimal Amount { get; set; }

    public PaymentMethod Method { get; set; }

    public PaymentStatus Status { get; set; } = PaymentStatus.Pending;

    public string? TransactionReference { get; set; }

    public DateTime PaymentDate { get; set; } = DateTime.UtcNow;

    public Reservation? Reservation { get; set; }
}

public enum PaymentMethod
{
    Cash,
    Card,
    Transfer
}

public enum PaymentStatus
{
    Pending,
    Paid,
    Failed,
    Refunded
}