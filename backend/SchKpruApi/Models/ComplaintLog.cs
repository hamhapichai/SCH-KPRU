using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SchKpruApi.Models
{
    [Table("complaint_logs")]
    public class ComplaintLog
    {
        [Key]
        [Column("log_id")]
        public int LogId { get; set; }

        [Required]
        [Column("complaint_id")]
        public int ComplaintId { get; set; }

        [Column("user_id")]
        public int? UserId { get; set; }

        [Column("department_id")]
        public int? DepartmentId { get; set; }

        [Required]
        [Column("action")]
        public string Action { get; set; } = string.Empty;

        [Column("notes")]
        public string? Notes { get; set; }

        [Column("previous_status")]
        public string? PreviousStatus { get; set; }

        [Column("new_status")]
        public string? NewStatus { get; set; }

        [Column("timestamp")]
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        [Column("metadata")]
        public string? Metadata { get; set; }

        [Column("related_assignment_id")]
        public int? RelatedAssignmentId { get; set; }

        [Column("created_by_user_id")]
        public int? CreatedByUserId { get; set; }

        // Navigation properties
        [ForeignKey("ComplaintId")]
        public virtual Complaint Complaint { get; set; } = null!;

        [ForeignKey("UserId")]
        public virtual User? User { get; set; }

        [ForeignKey("DepartmentId")]
        public virtual Department? Department { get; set; }

        [ForeignKey("RelatedAssignmentId")]
        public virtual ComplaintAssignment? RelatedAssignment { get; set; }

        [ForeignKey("CreatedByUserId")]
        public virtual User? CreatedByUser { get; set; }
    }
}