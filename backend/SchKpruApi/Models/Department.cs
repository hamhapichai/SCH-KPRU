using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace SchKpruApi.Models;

[Table("departments")]
public class Department
{
    [Key] [Column("department_id")] public int DepartmentId { get; set; }

    [Required] [Column("department_name")] public string DepartmentName { get; set; } = string.Empty;

    [Column("description")] public string? Description { get; set; }

    [Column("is_admin_or_dean_dept")] public bool IsAdminOrDeanDept { get; set; } = false;

    [Column("is_deleted")] public bool IsDeleted { get; set; } = false;

    [Column("created_at")] public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")] public DateTime? UpdatedAt { get; set; }

    [Column("created_by_user_id")] public int? CreatedByUserId { get; set; }

    [Column("updated_by_user_id")] public int? UpdatedByUserId { get; set; }

    // Computed property for user count (not mapped to database)
    [NotMapped]
    [JsonPropertyName("userCount")]
    public int UserCount => Users?.Count(u => u.IsActive) ?? 0;

    // Navigation properties
    public virtual ICollection<User> Users { get; set; } = new List<User>();
    public virtual ICollection<Group> Groups { get; set; } = new List<Group>();

    public virtual ICollection<ComplaintAssignment> ComplaintAssignments { get; set; } =
        new List<ComplaintAssignment>();

    public virtual ICollection<ComplaintLog> ComplaintLogs { get; set; } = new List<ComplaintLog>();
    public virtual ICollection<AISuggestion> AISuggestions { get; set; } = new List<AISuggestion>();

    [ForeignKey("CreatedByUserId")] public virtual User? CreatedByUser { get; set; }

    [ForeignKey("UpdatedByUserId")] public virtual User? UpdatedByUser { get; set; }
}