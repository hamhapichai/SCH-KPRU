using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SchKpruApi.Models;

[Table("complaints")]
public class Complaint
{
    [Key] [Column("complaint_id")] public int ComplaintId { get; set; }

    [Column("contact_name")] public string? ContactName { get; set; }

    [Column("contact_email")] public string? ContactEmail { get; set; }

    [Column("contact_phone")] public string? ContactPhone { get; set; }

    [Required] [Column("subject")] public string Subject { get; set; } = string.Empty;

    [Required] [Column("message")] public string Message { get; set; } = string.Empty;

    [Column("submission_date")] public DateTime SubmissionDate { get; set; } = DateTime.UtcNow;

    [Required] [Column("current_status")] public string CurrentStatus { get; set; } = string.Empty;

    [Column("is_anonymous")] public bool IsAnonymous { get; set; } = false;

    [Required] [Column("ticket_id")] public Guid TicketId { get; set; } = Guid.NewGuid();

    [Column("urgent")] public bool? Urgent { get; set; }

    [Column("updated_at")] public DateTime? UpdatedAt { get; set; }

    [Column("updated_by_user_id")] public int? UpdatedByUserId { get; set; }

    // Navigation properties
    public virtual ICollection<ComplaintAssignment> ComplaintAssignments { get; set; } =
        new List<ComplaintAssignment>();

    public virtual ICollection<ComplaintLog> ComplaintLogs { get; set; } = new List<ComplaintLog>();
    public virtual ICollection<AISuggestion> AISuggestions { get; set; } = new List<AISuggestion>();
    public virtual ICollection<ComplaintAttachment> Attachments { get; set; } = new List<ComplaintAttachment>();

    [ForeignKey("UpdatedByUserId")] public virtual User? UpdatedByUser { get; set; }
}