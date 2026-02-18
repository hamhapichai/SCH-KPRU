using SchKpruApi.DTOs;

namespace SchKpruApi.Services.Interfaces;

public interface IComplaintAssignmentService
{
    Task<IEnumerable<ComplaintAssignmentResponseDto>> GetAllAssignmentsAsync();
    Task<ComplaintAssignmentResponseDto?> GetAssignmentByIdAsync(int id);

    Task<ComplaintAssignmentResponseDto> CreateAssignmentAsync(ComplaintAssignmentCreateDto createDto,
        int assignedByUserId);

    Task<IEnumerable<ComplaintAssignmentResponseDto>> GetAssignmentsByComplaintIdAsync(int complaintId);
    Task<IEnumerable<ComplaintAssignmentResponseDto>> GetAssignmentsByUserIdAsync(int userId);
    Task<IEnumerable<ComplaintAssignmentResponseDto>> GetAssignmentsByDepartmentIdAsync(int departmentId);
    Task<bool> UpdateAssignmentStatusAsync(int assignmentId, string status, int updatedByUserId);
    Task<bool> CompleteAssignmentAsync(int assignmentId, int updatedByUserId);
    Task<bool> CloseAssignmentAsync(int assignmentId, int updatedByUserId);
}