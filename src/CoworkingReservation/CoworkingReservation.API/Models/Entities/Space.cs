namespace CoworkingReservation.API.Models.Entities;

public class Space
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    public SpaceType Type { get; set; }

    public int Capacity { get; set; }

    public decimal HourlyRate { get; set; }

    public bool IsAvailable { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
}

public enum SpaceType
{
    Desk,
    MeetingRoom
}