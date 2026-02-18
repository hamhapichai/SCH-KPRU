using System.ComponentModel.DataAnnotations;

namespace SchKpruApi.DTOs;

public class AISuggestionCreateDto
{
    [Required] public int ComplaintId { get; set; }

    public int? SuggestedDeptId { get; set; }

    [StringLength(255)] public string? SuggestedCategory { get; set; }

    [StringLength(1000)] public string? SummarizedByAI { get; set; }

    [Range(0, 1)] public float? ConfidenceScore { get; set; }

    public string? Reason { get; set; }

    [StringLength(255)] public string? N8nWorkflowId { get; set; }
}

public class AISuggestionResponseDto
{
    public int AISuggestionId { get; set; }
    public int ComplaintId { get; set; }
    public int? SuggestedDeptId { get; set; }
    public string? SuggestedDepartmentName { get; set; }
    public string? SuggestedCategory { get; set; }
    public string? SummarizedByAI { get; set; }
    public float? ConfidenceScore { get; set; }
    public DateTime SuggestedAt { get; set; }
    public string? N8nWorkflowId { get; set; }
}