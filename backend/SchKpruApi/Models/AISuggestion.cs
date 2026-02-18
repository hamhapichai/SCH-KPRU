using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SchKpruApi.Models;

[Table("ai_suggestions")]
public class AISuggestion
{
    [Key] [Column("ai_suggestion_id")] public int AISuggestionId { get; set; }

    [Required] [Column("complaint_id")] public int ComplaintId { get; set; }

    [Column("suggested_dept_id")] public int? SuggestedDeptId { get; set; }

    [Column("suggested_category")] public string? SuggestedCategory { get; set; }

    [Column("summarized_by_ai")] public string? SummarizedByAI { get; set; }

    [Column("confidence_score")] public float? ConfidenceScore { get; set; }

    [Column("suggested_at")] public DateTime SuggestedAt { get; set; } = DateTime.UtcNow;

    [Column("n8n_workflow_id")] public string? N8nWorkflowId { get; set; }

    // Navigation properties
    [ForeignKey("ComplaintId")] public virtual Complaint Complaint { get; set; } = null!;

    [ForeignKey("SuggestedDeptId")] public virtual Department? SuggestedDepartment { get; set; }
}