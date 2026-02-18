namespace SchKpruApi.DTOs;

public class ComplaintCreateDto
{
    public string? ContactName { get; set; }
    public string? ContactEmail { get; set; }
    public string? ContactPhone { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public bool IsAnonymous { get; set; } = false;
    public bool? Urgent { get; set; }
}

public class ComplaintResponseDto
{
    public int ComplaintId { get; set; }
    public string? ContactName { get; set; }
    public string? ContactEmail { get; set; }
    public string? ContactPhone { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public DateTime SubmissionDate { get; set; }
    public string CurrentStatus { get; set; } = string.Empty;
    public bool IsAnonymous { get; set; }
    public Guid TicketId { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedByUserName { get; set; }
    public bool? Urgent { get; set; }
    public List<ComplaintAttachmentDto> Attachments { get; set; } = new();
}

public class ComplaintAttachmentDto
{
    public int AttachmentId { get; set; }
    public string OriginalFileName { get; set; } = string.Empty;
    public string S3Url { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public DateTime UploadedAt { get; set; }
}

public class ComplaintUpdateDto
{
    public string? CurrentStatus { get; set; }
}

public class ComplaintStatusUpdateDto
{
    public string NewStatus { get; set; } = string.Empty;
    public string? Notes { get; set; }
}

public class ComplaintAssignmentCreateDto
{
    public int ComplaintId { get; set; }
    public int? AssignedToDeptId { get; set; }
    public int? AssignedToGroupId { get; set; }
    public int? AssignedToUserId { get; set; }
    public int? TargetDate { get; set; }
    public string? Notes { get; set; }
    public string Status { get; set; } = "Active";
}

public class ComplaintAssignmentResponseDto
{
    public int AssignmentId { get; set; }
    public int ComplaintId { get; set; }
    public string ComplaintSubject { get; set; } = string.Empty;
    public int AssignedByUserId { get; set; }
    public string AssignedByUserName { get; set; } = string.Empty;
    public int? AssignedToDeptId { get; set; }
    public string? AssignedToDeptName { get; set; }
    public int? AssignedToGroupId { get; set; }
    public string? AssignedToGroupName { get; set; }
    public int? AssignedToUserId { get; set; }
    public string? AssignedToUserName { get; set; }
    public int? TargetDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime AssignedDate { get; set; }
    public DateTime? ReceivedDate { get; set; }
    public DateTime? CompletedDate { get; set; }
    public DateTime? ClosedDate { get; set; }
    public bool IsActive { get; set; }
}

public class ComplaintLogCreateDto
{
    public int ComplaintId { get; set; }
    public int? UserId { get; set; }
    public int? DepartmentId { get; set; }
    public string Action { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public string? PreviousStatus { get; set; }
    public string? NewStatus { get; set; }
    public string? Metadata { get; set; }
    public int? RelatedAssignmentId { get; set; }
    public int? CreatedByUserId { get; set; }
}

public class ComplaintLogResponseDto
{
    public int LogId { get; set; }
    public int ComplaintId { get; set; }
    public int? UserId { get; set; }
    public string? UserName { get; set; }
    public int? DepartmentId { get; set; }
    public string? DepartmentName { get; set; }
    public string Action { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public string? PreviousStatus { get; set; }
    public string? NewStatus { get; set; }
    public DateTime Timestamp { get; set; }
    public string? Metadata { get; set; }
    public int? RelatedAssignmentId { get; set; }
    public int? CreatedByUserId { get; set; }
    public string? CreatedByUserName { get; set; }
}

public class DashboardStatsDto
{
    public int TotalComplaints { get; set; }
    public int PendingComplaints { get; set; }
    public int ResolvedComplaints { get; set; }
    public int TotalUsers { get; set; }
    public int TotalDepartments { get; set; }
    public double AverageResponseTimeValue { get; set; }
    public string AverageResponseTimeUnit { get; set; } = "ชั่วโมง";
    public string AverageResponseTimeDisplay { get; set; } = "0 ชั่วโมง";
}

public class RecentComplaintDto
{
    public int ComplaintId { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string CurrentStatus { get; set; } = string.Empty;
    public string? DepartmentName { get; set; }
    public DateTime SubmissionDate { get; set; }
    public Guid TicketId { get; set; }
    public bool? Urgent { get; set; }
}