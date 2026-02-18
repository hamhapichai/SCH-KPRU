using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SchKpruApi.Models;

[Table("users")]
public class User
{
    [Key] [Column("user_id")] public int UserId { get; set; }

    [Required] [Column("username")] public string Username { get; set; } = string.Empty;

    [Required] [Column("password_hash")] public string PasswordHash { get; set; } = string.Empty;

    [Required] [Column("email")] public string Email { get; set; } = string.Empty;

    [Required] [Column("name")] public string Name { get; set; } = string.Empty;

    [Required] [Column("lastname")] public string Lastname { get; set; } = string.Empty;

    [Column("bio")] public string? Bio { get; set; }

    [Required] [Column("role_id")] public int RoleId { get; set; }

    [Column("department_id")] public int? DepartmentId { get; set; }

    [Column("last_login_at")] public DateTime? LastLoginAt { get; set; }

    [Column("last_login_ip")] public string? LastLoginIP { get; set; }

    [Column("is_active")] public bool IsActive { get; set; } = true;

    [Column("created_at")] public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")] public DateTime? UpdatedAt { get; set; }

    [Column("created_by_user_id")] public int? CreatedByUserId { get; set; }

    [Column("updated_by_user_id")] public int? UpdatedByUserId { get; set; }

    // Navigation properties
    [ForeignKey("RoleId")] public virtual Role Role { get; set; } = null!;

    [ForeignKey("DepartmentId")] public virtual Department? Department { get; set; }

    public virtual ICollection<Member> Members { get; set; } = new List<Member>();

    public virtual ICollection<ComplaintAssignment> AssignedByComplaintAssignments { get; set; } =
        new List<ComplaintAssignment>();

    public virtual ICollection<ComplaintAssignment> AssignedToComplaintAssignments { get; set; } =
        new List<ComplaintAssignment>();

    public virtual ICollection<ComplaintLog> ComplaintLogs { get; set; } = new List<ComplaintLog>();

    [ForeignKey("CreatedByUserId")] public virtual User? CreatedByUser { get; set; }

    [ForeignKey("UpdatedByUserId")] public virtual User? UpdatedByUser { get; set; }

    public virtual ICollection<User> CreatedUsers { get; set; } = new List<User>();
    public virtual ICollection<User> UpdatedUsers { get; set; } = new List<User>();
    public virtual ICollection<Department> CreatedDepartments { get; set; } = new List<Department>();
    public virtual ICollection<Department> UpdatedDepartments { get; set; } = new List<Department>();
    public virtual ICollection<Group> CreatedGroups { get; set; } = new List<Group>();
    public virtual ICollection<Group> UpdatedGroups { get; set; } = new List<Group>();
    public virtual ICollection<Member> CreatedMembers { get; set; } = new List<Member>();
    public virtual ICollection<Complaint> UpdatedComplaints { get; set; } = new List<Complaint>();

    public virtual ICollection<ComplaintAssignment> UpdatedComplaintAssignments { get; set; } =
        new List<ComplaintAssignment>();

    public virtual ICollection<ComplaintLog> CreatedComplaintLogs { get; set; } = new List<ComplaintLog>();
}