using Microsoft.EntityFrameworkCore;
using SchKpruApi.Models;

namespace SchKpruApi.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<Role> Roles { get; set; }
    public DbSet<Department> Departments { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<Group> Groups { get; set; }
    public DbSet<Member> Members { get; set; }
    public DbSet<Complaint> Complaints { get; set; }
    public DbSet<ComplaintAssignment> ComplaintAssignments { get; set; }
    public DbSet<ComplaintLog> ComplaintLogs { get; set; }
    public DbSet<AISuggestion> AISuggestions { get; set; }
    public DbSet<ComplaintAttachment> ComplaintAttachments { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure relationships to avoid cycles
        modelBuilder.Entity<User>()
            .HasOne(u => u.CreatedByUser)
            .WithMany(u => u.CreatedUsers)
            .HasForeignKey(u => u.CreatedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<User>()
            .HasOne(u => u.UpdatedByUser)
            .WithMany(u => u.UpdatedUsers)
            .HasForeignKey(u => u.UpdatedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Department>()
            .HasOne(d => d.CreatedByUser)
            .WithMany(u => u.CreatedDepartments)
            .HasForeignKey(d => d.CreatedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Department>()
            .HasOne(d => d.UpdatedByUser)
            .WithMany(u => u.UpdatedDepartments)
            .HasForeignKey(d => d.UpdatedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Group>()
            .HasOne(g => g.CreatedByUser)
            .WithMany(u => u.CreatedGroups)
            .HasForeignKey(g => g.CreatedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Group>()
            .HasOne(g => g.UpdatedByUser)
            .WithMany(u => u.UpdatedGroups)
            .HasForeignKey(g => g.UpdatedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Member>()
            .HasOne(m => m.CreatedByUser)
            .WithMany(u => u.CreatedMembers)
            .HasForeignKey(m => m.CreatedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Complaint>()
            .HasOne(c => c.UpdatedByUser)
            .WithMany(u => u.UpdatedComplaints)
            .HasForeignKey(c => c.UpdatedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ComplaintAssignment>()
            .HasOne(ca => ca.AssignedByUser)
            .WithMany(u => u.AssignedByComplaintAssignments)
            .HasForeignKey(ca => ca.AssignedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ComplaintAssignment>()
            .HasOne(ca => ca.AssignedToUser)
            .WithMany(u => u.AssignedToComplaintAssignments)
            .HasForeignKey(ca => ca.AssignedToUserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ComplaintAssignment>()
            .HasOne(ca => ca.UpdatedByUser)
            .WithMany(u => u.UpdatedComplaintAssignments)
            .HasForeignKey(ca => ca.UpdatedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ComplaintLog>()
            .HasOne(cl => cl.User)
            .WithMany(u => u.ComplaintLogs)
            .HasForeignKey(cl => cl.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ComplaintLog>()
            .HasOne(cl => cl.CreatedByUser)
            .WithMany(u => u.CreatedComplaintLogs)
            .HasForeignKey(cl => cl.CreatedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        // Configure unique indexes
        modelBuilder.Entity<Role>()
            .HasIndex(r => r.RoleName)
            .IsUnique();

        modelBuilder.Entity<Department>()
            .HasIndex(d => d.DepartmentName)
            .IsUnique();

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Username)
            .IsUnique();

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<Complaint>()
            .HasIndex(c => c.TicketId)
            .IsUnique();

        modelBuilder.Entity<ComplaintAttachment>()
            .HasOne(a => a.Complaint)
            .WithMany(c => c.Attachments)
            .HasForeignKey(a => a.ComplaintId)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure decimal precision for confidence score
        modelBuilder.Entity<AISuggestion>()
            .Property(a => a.ConfidenceScore)
            .HasPrecision(5, 4);
    }
}