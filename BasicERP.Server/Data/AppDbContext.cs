using Microsoft.EntityFrameworkCore;
using PhoneBookApp.Server.Models;

namespace PhoneBookApp.Server.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Employee> Employees => Set<Employee>();
    public DbSet<Department> Departments => Set<Department>();
    public DbSet<Position> Positions => Set<Position>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Department>()
            .HasIndex(d => d.DepartmentName)
            .IsUnique();

        modelBuilder.Entity<Position>()
            .HasIndex(p => p.PositionName)
            .IsUnique();

        modelBuilder.Entity<Employee>()
            .HasIndex(e => e.EmployeeNo)
            .IsUnique();

        modelBuilder.Entity<Employee>()
            .HasOne(e => e.Department)
            .WithMany()
            .HasForeignKey(e => e.DepartmentId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Employee>()
            .HasOne(e => e.Position)
            .WithMany()
            .HasForeignKey(e => e.PositionId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
