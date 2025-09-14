using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SchKpruApi.Models
{
    [Table("complaint_assignments")]
    public class ComplaintAssignment
    {
        [Key]
        [Column("assignment_id")]
        public int AssignmentId { get; set; }

        [Required]
        [Column("complaint_id")]
        public int ComplaintId { get; set; }

        [Required]
        [Column("assigned_by_user_id")]
        public int AssignedByUserId { get; set; }

        [Column("assigned_to_dept_id")]
        public int? AssignedToDeptId { get; set; }

        [Column("assigned_to_group_id")]
        public int? AssignedToGroupId { get; set; }

        [Column("assigned_to_user_id")]
        public int? AssignedToUserId { get; set; }

        [Column("target_date")]
        public int? TargetDate { get; set; }

        [Required]
        [Column("status")]
        public string Status { get; set; } = string.Empty;

        [Column("assigned_date")]
        public DateTime AssignedDate { get; set; } = DateTime.UtcNow;

        [Column("received_date")]
        public DateTime? ReceivedDate { get; set; }

        [Column("completed_date")]
        public DateTime? CompletedDate { get; set; }

        [Column("closed_date")]
        public DateTime? ClosedDate { get; set; }

        [Column("is_active")]
        public bool IsActive { get; set; } = true;

        [Column("updated_at")]
        public DateTime? UpdatedAt { get; set; }

        [Column("updated_by_user_id")]
        public int? UpdatedByUserId { get; set; }

        // Navigation properties
        [ForeignKey("ComplaintId")]
        public virtual Complaint Complaint { get; set; } = null!;

        [ForeignKey("AssignedByUserId")]
        public virtual User AssignedByUser { get; set; } = null!;

        [ForeignKey("AssignedToDeptId")]
        public virtual Department? AssignedToDepartment { get; set; }

        [ForeignKey("AssignedToGroupId")]
        public virtual Group? AssignedToGroup { get; set; }

        [ForeignKey("AssignedToUserId")]
        public virtual User? AssignedToUser { get; set; }

        [ForeignKey("UpdatedByUserId")]
        public virtual User? UpdatedByUser { get; set; }

        public virtual ICollection<ComplaintLog> ComplaintLogs { get; set; } = new List<ComplaintLog>();
    }
}