namespace CoworkingReservation.API.Models.Entities;

public class Reservation
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public int SpaceId { get; set; }

    public DateTime StartTime { get; set; }

    public DateTime EndTime { get; set; }

    public ReservationStatus Status { get; set; } = ReservationStatus.Pending;

    public decimal TotalAmount { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User? User { get; set; }

    public Space? Space { get; set; }

    public Payment? Payment { get; set; }
}

public enum ReservationStatus
{
    Pending,
    Confirmed,
    Cancelled,
    Completed
}