using Microsoft.EntityFrameworkCore;
using SchKpruApi.Data;
using SchKpruApi.Models;
using SchKpruApi.Repositories.Interfaces;

namespace SchKpruApi.Repositories;

public class ComplaintRepository : GenericRepository<Complaint>, IComplaintRepository
{
    public ComplaintRepository(ApplicationDbContext context) : base(context)
    {
    }

    public override async Task<IEnumerable<Complaint>> GetAllAsync()
    {
        return await _dbSet
            .Include(c => c.UpdatedByUser)
            .OrderByDescending(c => c.SubmissionDate)
            .ToListAsync();
    }

    public override async Task<Complaint?> GetByIdAsync(int id)
    {
        return await _dbSet
            .Include(c => c.UpdatedByUser)
            .Include(c => c.ComplaintAssignments)
            .ThenInclude(ca => ca.AssignedToDepartment)
            .Include(c => c.ComplaintAssignments)
            .ThenInclude(ca => ca.AssignedToGroup)
            .Include(c => c.ComplaintAssignments)
            .ThenInclude(ca => ca.AssignedToUser)
            .Include(c => c.ComplaintLogs)
            .ThenInclude(cl => cl.User)
            .Include(c => c.Attachments)
            .FirstOrDefaultAsync(c => c.ComplaintId == id);
    }

    public async Task<Complaint?> GetByTicketIdAsync(Guid ticketId)
    {
        return await _dbSet
            .Include(c => c.UpdatedByUser)
            .FirstOrDefaultAsync(c => c.TicketId == ticketId);
    }

    public async Task<IEnumerable<Complaint>> GetByStatusAsync(string status)
    {
        return await _dbSet
            .Include(c => c.UpdatedByUser)
            .Where(c => c.CurrentStatus == status)
            .OrderByDescending(c => c.SubmissionDate)
            .ToListAsync();
    }

    public async Task<IEnumerable<Complaint>> GetRecentAsync(int count = 10)
    {
        return await _dbSet
            .Include(c => c.UpdatedByUser)
            .OrderByDescending(c => c.SubmissionDate)
            .Take(count)
            .ToListAsync();
    }

    public async Task<IEnumerable<Complaint>> SearchAsync(string searchTerm)
    {
        return await _dbSet
            .Include(c => c.UpdatedByUser)
            .Where(c => c.Subject.Contains(searchTerm) ||
                        c.Message.Contains(searchTerm) ||
                        (c.ContactName != null && c.ContactName.Contains(searchTerm)))
            .OrderByDescending(c => c.SubmissionDate)
            .ToListAsync();
    }

    public async Task<(IEnumerable<Complaint>, int)> GetFilteredAsync(string? searchTerm, string? status, int page,
        int pageSize)
    {
        var query = _dbSet
            .Include(c => c.UpdatedByUser)
            .AsQueryable();

        if (!string.IsNullOrEmpty(searchTerm))
            query = query.Where(c => c.Subject.Contains(searchTerm) ||
                                     c.Message.Contains(searchTerm) ||
                                     (c.ContactName != null && c.ContactName.Contains(searchTerm)));

        if (!string.IsNullOrEmpty(status)) query = query.Where(c => c.CurrentStatus == status);

        var totalCount = await query.CountAsync();
        var complaints = await query
            .OrderByDescending(c => c.SubmissionDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (complaints, totalCount);
    }

    public async Task<IEnumerable<Complaint>> GetByUserRoleAsync(int userId, string roleName, int? departmentId,
        int? groupId)
    {
        var query = _dbSet
            .Include(c => c.UpdatedByUser)
            .Include(c => c.ComplaintAssignments)
            .ThenInclude(ca => ca.AssignedToDepartment)
            .Include(c => c.ComplaintAssignments)
            .ThenInclude(ca => ca.AssignedToGroup)
            .Include(c => c.ComplaintAssignments)
            .ThenInclude(ca => ca.AssignedToUser)
            .AsQueryable();

        if (roleName == "Dean")
            // Dean เห็นทั้งหมด
            return await query
                .OrderByDescending(c => c.SubmissionDate)
                .ToListAsync();
        if (roleName == "Deputy" && departmentId.HasValue)
            // Deputy เห็นเฉพาะที่ assign ให้ department ของตัวเอง
            return await query
                .Where(c => c.ComplaintAssignments.Any(ca => ca.AssignedToDeptId == departmentId.Value))
                .OrderByDescending(c => c.SubmissionDate)
                .ToListAsync();
        if (roleName == "Staff" && groupId.HasValue)
            // Staff เห็นเฉพาะที่ assign ให้ group ของตัวเอง
            return await query
                .Where(c => c.ComplaintAssignments.Any(ca => ca.AssignedToGroupId == groupId.Value))
                .OrderByDescending(c => c.SubmissionDate)
                .ToListAsync();

        // Default: ไม่เห็นอะไร
        return new List<Complaint>();
    }

    public async Task<(IEnumerable<Complaint>, int)> GetFilteredByUserRoleAsync(string? searchTerm, string? status,
        int page, int pageSize, int userId, string roleName, int? departmentId, int? groupId)
    {
        var query = _dbSet
            .Include(c => c.UpdatedByUser)
            .Include(c => c.ComplaintAssignments)
            .ThenInclude(ca => ca.AssignedToDepartment)
            .Include(c => c.ComplaintAssignments)
            .ThenInclude(ca => ca.AssignedToGroup)
            .Include(c => c.ComplaintAssignments)
            .ThenInclude(ca => ca.AssignedToUser)
            .AsQueryable();

        // Apply role-based filtering
        if (roleName == "Deputy" && departmentId.HasValue)
            query = query.Where(c => c.ComplaintAssignments.Any(ca => ca.AssignedToDeptId == departmentId.Value));
        else if (roleName == "Staff" && groupId.HasValue)
            query = query.Where(c => c.ComplaintAssignments.Any(ca => ca.AssignedToGroupId == groupId.Value));
        // Dean sees all, no additional filtering needed

        // Apply search and status filters
        if (!string.IsNullOrEmpty(searchTerm))
            query = query.Where(c => c.Subject.Contains(searchTerm) ||
                                     c.Message.Contains(searchTerm) ||
                                     (c.ContactName != null && c.ContactName.Contains(searchTerm)));

        if (!string.IsNullOrEmpty(status)) query = query.Where(c => c.CurrentStatus == status);

        var totalCount = await query.CountAsync();
        var complaints = await query
            .OrderByDescending(c => c.SubmissionDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (complaints, totalCount);
    }

    // Assignment methods
    public async Task<ComplaintAssignment> CreateAssignmentAsync(ComplaintAssignment assignment)
    {
        _context.ComplaintAssignments.Add(assignment);
        await _context.SaveChangesAsync();
        return assignment;
    }

    public async Task<IEnumerable<ComplaintAssignment>> GetAssignmentsByComplaintIdAsync(int complaintId)
    {
        return await _context.ComplaintAssignments
            .Include(ca => ca.AssignedByUser)
            .Include(ca => ca.AssignedToDepartment)
            .Include(ca => ca.AssignedToGroup)
            .Include(ca => ca.AssignedToUser)
            .Include(ca => ca.Complaint)
            .Where(ca => ca.ComplaintId == complaintId)
            .OrderByDescending(ca => ca.AssignedDate)
            .ToListAsync();
    }

    // Status update methods
    public async Task<Complaint?> UpdateStatusAsync(int complaintId, string newStatus, int updatedByUserId)
    {
        var complaint = await GetByIdAsync(complaintId);
        if (complaint == null) return null;

        complaint.CurrentStatus = newStatus;
        complaint.UpdatedAt = DateTime.UtcNow;
        complaint.UpdatedByUserId = updatedByUserId;

        await _context.SaveChangesAsync();
        return complaint;
    }

    // Log methods
    public async Task<ComplaintLog> CreateLogAsync(ComplaintLog log)
    {
        _context.ComplaintLogs.Add(log);
        await _context.SaveChangesAsync();
        return log;
    }

    public async Task<IEnumerable<ComplaintLog>> GetLogsByComplaintIdAsync(int complaintId)
    {
        return await _context.ComplaintLogs
            .Include(cl => cl.User)
            .Include(cl => cl.Department)
            .Include(cl => cl.CreatedByUser)
            .Where(cl => cl.ComplaintId == complaintId)
            .OrderByDescending(cl => cl.Timestamp)
            .ToListAsync();
    }

    // Dashboard methods
    public async Task<int> GetTotalCountAsync()
    {
        return await _dbSet.CountAsync();
    }

    public async Task<int> GetCountByStatusAsync(string status)
    {
        return await _dbSet.CountAsync(c => c.CurrentStatus == status);
    }

    public async Task<double> GetAverageResponseTimeHoursAsync()
    {
        var complaints = await _dbSet
            .Where(c => c.UpdatedAt.HasValue && c.CurrentStatus == "Completed")
            .Select(c => new { c.SubmissionDate, c.UpdatedAt })
            .ToListAsync();

        if (!complaints.Any()) return 0;

        var totalHours = complaints.Sum(c => (c.UpdatedAt!.Value - c.SubmissionDate).TotalHours);
        return totalHours / complaints.Count;
    }

    public async Task<ComplaintAttachment> AddAttachmentAsync(ComplaintAttachment attachment)
    {
        _context.ComplaintAttachments.Add(attachment);
        await _context.SaveChangesAsync();
        return attachment;
    }

    public async Task<ComplaintAttachment?> GetAttachmentByIdAsync(int attachmentId)
    {
        return await _context.ComplaintAttachments
            .FirstOrDefaultAsync(a => a.AttachmentId == attachmentId);
    }
}