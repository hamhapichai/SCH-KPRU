using SchKpruApi.Models;

namespace SchKpruApi.Repositories.Interfaces;

public interface IComplaintRepository : IGenericRepository<Complaint>
{
    Task<Complaint?> GetByTicketIdAsync(Guid ticketId);
    Task<IEnumerable<Complaint>> GetByStatusAsync(string status);
    Task<IEnumerable<Complaint>> GetRecentAsync(int count = 10);
    Task<IEnumerable<Complaint>> SearchAsync(string searchTerm);
    Task<(IEnumerable<Complaint>, int)> GetFilteredAsync(string? searchTerm, string? status, int page, int pageSize);
    Task<IEnumerable<Complaint>> GetByUserRoleAsync(int userId, string roleName, int? departmentId, int? groupId);

    Task<(IEnumerable<Complaint>, int)> GetFilteredByUserRoleAsync(string? searchTerm, string? status, int page,
        int pageSize, int userId, string roleName, int? departmentId, int? groupId);

    // Assignment methods
    Task<ComplaintAssignment> CreateAssignmentAsync(ComplaintAssignment assignment);
    Task<IEnumerable<ComplaintAssignment>> GetAssignmentsByComplaintIdAsync(int complaintId);

    // Status update methods
    Task<Complaint?> UpdateStatusAsync(int complaintId, string newStatus, int updatedByUserId);

    // Log methods
    Task<ComplaintLog> CreateLogAsync(ComplaintLog log);
    Task<IEnumerable<ComplaintLog>> GetLogsByComplaintIdAsync(int complaintId);

    // Dashboard methods
    Task<int> GetTotalCountAsync();
    Task<int> GetCountByStatusAsync(string status);
    Task<double> GetAverageResponseTimeHoursAsync();

    // Attachment methods
    Task<ComplaintAttachment> AddAttachmentAsync(ComplaintAttachment attachment);
    Task<ComplaintAttachment?> GetAttachmentByIdAsync(int attachmentId);
}