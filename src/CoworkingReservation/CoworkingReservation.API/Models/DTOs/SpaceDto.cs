namespace CoworkingReservation.API.Models.DTOs;

public class SpaceDto
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    public string Type { get; set; } = string.Empty;

    public int Capacity { get; set; }

    public decimal HourlyRate { get; set; }

    public bool IsAvailable { get; set; }

    public DateTime CreatedAt { get; set; }
}