using SchKpruApi.Models;

namespace SchKpruApi.DTOs;

public class DepartmentDto
{
    public int DepartmentId { get; set; }
    public string DepartmentName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsAdminOrDeanDept { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public int? CreatedByUserId { get; set; }
    public int? UpdatedByUserId { get; set; }
    public int UserCount { get; set; }
}

public static class DepartmentExtensions
{
    public static DepartmentDto ToDto(this Department department)
    {
        return new DepartmentDto
        {
            DepartmentId = department.DepartmentId,
            DepartmentName = department.DepartmentName,
            Description = department.Description,
            IsAdminOrDeanDept = department.IsAdminOrDeanDept,
            IsDeleted = department.IsDeleted,
            CreatedAt = department.CreatedAt,
            UpdatedAt = department.UpdatedAt,
            CreatedByUserId = department.CreatedByUserId,
            UpdatedByUserId = department.UpdatedByUserId,
            UserCount = department.UserCount
        };
    }
}