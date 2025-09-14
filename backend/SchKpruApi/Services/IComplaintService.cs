using SchKpruApi.DTOs;

namespace SchKpruApi.Services
{
    public interface IComplaintService
    {
        Task<IEnumerable<ComplaintResponseDto>> GetAllComplaintsAsync();
        Task<ComplaintResponseDto?> GetComplaintByIdAsync(int id);
        Task<ComplaintResponseDto?> GetComplaintByTicketIdAsync(Guid ticketId);
        Task<ComplaintResponseDto> CreateComplaintAsync(ComplaintCreateDto complaintCreateDto);
        Task<ComplaintResponseDto?> UpdateComplaintAsync(int id, ComplaintUpdateDto complaintUpdateDto, int updatedByUserId);
        Task<bool> DeleteComplaintAsync(int id);
        Task<IEnumerable<ComplaintResponseDto>> GetComplaintsByStatusAsync(string status);
        Task<IEnumerable<ComplaintResponseDto>> SearchComplaintsAsync(string searchTerm);
        Task<IEnumerable<ComplaintResponseDto>> GetRecentComplaintsAsync(int count = 10);
        Task<(IEnumerable<ComplaintResponseDto>, int)> GetFilteredComplaintsAsync(string? searchTerm, string? status, int page, int pageSize);
        Task<IEnumerable<ComplaintResponseDto>> GetComplaintsByUserRoleAsync(int userId, string roleName, int? departmentId, int? groupId);
        Task<(IEnumerable<ComplaintResponseDto>, int)> GetFilteredComplaintsByUserRoleAsync(string? searchTerm, string? status, int page, int pageSize, int userId, string roleName, int? departmentId, int? groupId);
        
        // Assignment methods
        Task<ComplaintAssignmentResponseDto?> AssignComplaintAsync(int complaintId, ComplaintAssignmentCreateDto assignmentDto, int assignedByUserId);
        Task<IEnumerable<ComplaintAssignmentResponseDto>> GetComplaintAssignmentsAsync(int complaintId);
        
        // Status update with logging
        Task<ComplaintResponseDto?> UpdateComplaintStatusAsync(int id, ComplaintStatusUpdateDto statusUpdateDto, int updatedByUserId);
        
        // Log methods
        Task<IEnumerable<ComplaintLogResponseDto>> GetComplaintLogsAsync(int complaintId);
        
        // Public methods for non-authenticated access
        Task<ComplaintResponseDto?> GetByTicketIdAsync(string ticketId);
        Task<ComplaintResponseDto> CreateAsync(ComplaintCreateDto complaintCreateDto);
        
        // Dashboard methods
        Task<DashboardStatsDto> GetDashboardStatsAsync(int userId, string roleName, int? departmentId, int? groupId);
        Task<IEnumerable<RecentComplaintDto>> GetRecentComplaintsForDashboardAsync(int count, int userId, string roleName, int? departmentId, int? groupId);
    }
}