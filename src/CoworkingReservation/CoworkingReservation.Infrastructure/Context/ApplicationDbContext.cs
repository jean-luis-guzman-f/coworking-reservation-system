using CoworkingReservation.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CoworkingReservation.Infrastructure.Context;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users { get; set; }

    public DbSet<Space> Spaces { get; set; }

    public DbSet<Reservation> Reservation { get; set; }

    public DbSet<Payment> Payment { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Payment>()
            .Property(payment => payment.Amount)
            .HasPrecision(18, 2);

        modelBuilder.Entity<Reservation>()
            .Property(reservation => reservation.TotalAmount)
            .HasPrecision(18, 2);

        modelBuilder.Entity<Space>()
            .Property(space => space.HourlyRate)
            .HasPrecision(18, 2);
    }
}