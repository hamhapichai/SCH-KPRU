using SchKpruApi.DTOs;
using SchKpruApi.Models;
using SchKpruApi.Repositories.Interfaces;
using SchKpruApi.Services.Interfaces;

namespace SchKpruApi.Services;

public class ComplaintAssignmentService : IComplaintAssignmentService
{
    private readonly IComplaintAssignmentRepository _assignmentRepository;
    private readonly IComplaintRepository _complaintRepository;
    private readonly IUserRepository _userRepository;
    private readonly IDepartmentRepository _departmentRepository;
    private readonly IGroupRepository _groupRepository;

    public ComplaintAssignmentService(
        IComplaintAssignmentRepository assignmentRepository,
        IComplaintRepository complaintRepository,
        IUserRepository userRepository,
        IDepartmentRepository departmentRepository,
        IGroupRepository groupRepository)
    {
        _assignmentRepository = assignmentRepository;
        _complaintRepository = complaintRepository;
        _userRepository = userRepository;
        _departmentRepository = departmentRepository;
        _groupRepository = groupRepository;
    }

    public async Task<IEnumerable<ComplaintAssignmentResponseDto>> GetAllAssignmentsAsync()
    {
        var assignments = await _assignmentRepository.GetAllAsync();
        return assignments.Select(MapToResponseDto);
    }

    public async Task<ComplaintAssignmentResponseDto?> GetAssignmentByIdAsync(int id)
    {
        var assignment = await _assignmentRepository.GetByIdAsync(id);
        return assignment != null ? MapToResponseDto(assignment) : null;
    }

    public async Task<ComplaintAssignmentResponseDto> CreateAssignmentAsync(ComplaintAssignmentCreateDto createDto,
        int assignedByUserId)
    {
        var assignment = new ComplaintAssignment
        {
            ComplaintId = createDto.ComplaintId,
            AssignedByUserId = assignedByUserId,
            AssignedToDeptId = createDto.AssignedToDeptId,
            AssignedToGroupId = createDto.AssignedToGroupId,
            AssignedToUserId = createDto.AssignedToUserId,
            TargetDate = createDto.TargetDate,
            Status = createDto.Status,
            AssignedDate = DateTime.UtcNow,
            IsActive = true
        };

        var createdAssignment = await _assignmentRepository.CreateAsync(assignment);
        var assignmentWithRelations = await _assignmentRepository.GetByIdAsync(createdAssignment.AssignmentId);
        return MapToResponseDto(assignmentWithRelations!);
    }

    public async Task<IEnumerable<ComplaintAssignmentResponseDto>> GetAssignmentsByComplaintIdAsync(int complaintId)
    {
        var assignments = await _assignmentRepository.GetByComplaintIdAsync(complaintId);
        return assignments.Select(MapToResponseDto);
    }

    public async Task<IEnumerable<ComplaintAssignmentResponseDto>> GetAssignmentsByUserIdAsync(int userId)
    {
        var assignments = await _assignmentRepository.GetByAssignedUserIdAsync(userId);
        return assignments.Select(MapToResponseDto);
    }

    public async Task<IEnumerable<ComplaintAssignmentResponseDto>> GetAssignmentsByDepartmentIdAsync(
        int departmentId)
    {
        var assignments = await _assignmentRepository.GetByDepartmentIdAsync(departmentId);
        return assignments.Select(MapToResponseDto);
    }

    public async Task<bool> UpdateAssignmentStatusAsync(int assignmentId, string status, int updatedByUserId)
    {
        var assignment = await _assignmentRepository.GetByIdAsync(assignmentId);
        if (assignment == null)
            return false;

        assignment.Status = status;
        assignment.UpdatedByUserId = updatedByUserId;
        assignment.UpdatedAt = DateTime.UtcNow;

        await _assignmentRepository.UpdateAsync(assignment);
        return true;
    }

    public async Task<bool> CompleteAssignmentAsync(int assignmentId, int updatedByUserId)
    {
        var assignment = await _assignmentRepository.GetByIdAsync(assignmentId);
        if (assignment == null)
            return false;

        assignment.Status = "Completed";
        assignment.CompletedDate = DateTime.UtcNow;
        assignment.UpdatedByUserId = updatedByUserId;
        assignment.UpdatedAt = DateTime.UtcNow;

        await _assignmentRepository.UpdateAsync(assignment);
        return true;
    }

    public async Task<bool> CloseAssignmentAsync(int assignmentId, int updatedByUserId)
    {
        var assignment = await _assignmentRepository.GetByIdAsync(assignmentId);
        if (assignment == null)
            return false;

        assignment.Status = "Closed";
        assignment.ClosedDate = DateTime.UtcNow;
        assignment.IsActive = false;
        assignment.UpdatedByUserId = updatedByUserId;
        assignment.UpdatedAt = DateTime.UtcNow;

        await _assignmentRepository.UpdateAsync(assignment);
        return true;
    }

    private static ComplaintAssignmentResponseDto MapToResponseDto(ComplaintAssignment assignment)
    {
        return new ComplaintAssignmentResponseDto
        {
            AssignmentId = assignment.AssignmentId,
            ComplaintId = assignment.ComplaintId,
            ComplaintSubject = assignment.Complaint?.Subject ?? "",
            AssignedByUserId = assignment.AssignedByUserId,
            AssignedByUserName = assignment.AssignedByUser != null
                ? $"{assignment.AssignedByUser.Name} {assignment.AssignedByUser.Lastname}"
                : "",
            AssignedToDeptId = assignment.AssignedToDeptId,
            AssignedToDeptName = assignment.AssignedToDepartment?.DepartmentName,
            AssignedToGroupId = assignment.AssignedToGroupId,
            AssignedToGroupName = assignment.AssignedToGroup?.Name,
            AssignedToUserId = assignment.AssignedToUserId,
            AssignedToUserName = assignment.AssignedToUser != null
                ? $"{assignment.AssignedToUser.Name} {assignment.AssignedToUser.Lastname}"
                : null,
            TargetDate = assignment.TargetDate,
            Status = assignment.Status,
            AssignedDate = assignment.AssignedDate,
            ReceivedDate = assignment.ReceivedDate,
            CompletedDate = assignment.CompletedDate,
            ClosedDate = assignment.ClosedDate,
            IsActive = assignment.IsActive
        };
    }
}