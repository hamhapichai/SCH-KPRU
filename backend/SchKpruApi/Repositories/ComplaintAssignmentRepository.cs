using Microsoft.EntityFrameworkCore;
using SchKpruApi.Data;
using SchKpruApi.Models;
using SchKpruApi.Repositories.Interfaces;

namespace SchKpruApi.Repositories;

public class ComplaintAssignmentRepository : GenericRepository<ComplaintAssignment>, IComplaintAssignmentRepository
{
    public ComplaintAssignmentRepository(ApplicationDbContext context) : base(context)
    {
    }

    public override async Task<IEnumerable<ComplaintAssignment>> GetAllAsync()
    {
        return await _dbSet
            .Include(ca => ca.Complaint)
            .Include(ca => ca.AssignedByUser)
            .Include(ca => ca.AssignedToDepartment)
            .Include(ca => ca.AssignedToGroup)
            .Include(ca => ca.AssignedToUser)
            .OrderByDescending(ca => ca.AssignedDate)
            .ToListAsync();
    }

    public async Task<IEnumerable<ComplaintAssignment>> GetByComplaintIdAsync(int complaintId)
    {
        return await _dbSet
            .Include(ca => ca.AssignedByUser)
            .Include(ca => ca.AssignedToDepartment)
            .Include(ca => ca.AssignedToGroup)
            .Include(ca => ca.AssignedToUser)
            .Where(ca => ca.ComplaintId == complaintId)
            .OrderByDescending(ca => ca.AssignedDate)
            .ToListAsync();
    }

    public async Task<IEnumerable<ComplaintAssignment>> GetByAssignedUserIdAsync(int userId)
    {
        return await _dbSet
            .Include(ca => ca.Complaint)
            .Include(ca => ca.AssignedByUser)
            .Include(ca => ca.AssignedToDepartment)
            .Include(ca => ca.AssignedToGroup)
            .Where(ca => ca.AssignedToUserId == userId)
            .OrderByDescending(ca => ca.AssignedDate)
            .ToListAsync();
    }

    public async Task<IEnumerable<ComplaintAssignment>> GetByDepartmentIdAsync(int departmentId)
    {
        return await _dbSet
            .Include(ca => ca.Complaint)
            .Include(ca => ca.AssignedByUser)
            .Include(ca => ca.AssignedToGroup)
            .Include(ca => ca.AssignedToUser)
            .Where(ca => ca.AssignedToDeptId == departmentId)
            .OrderByDescending(ca => ca.AssignedDate)
            .ToListAsync();
    }

    public async Task<IEnumerable<ComplaintAssignment>> GetActiveAssignmentsAsync()
    {
        return await _dbSet
            .Include(ca => ca.Complaint)
            .Include(ca => ca.AssignedByUser)
            .Include(ca => ca.AssignedToDepartment)
            .Include(ca => ca.AssignedToGroup)
            .Include(ca => ca.AssignedToUser)
            .Where(ca => ca.IsActive)
            .OrderByDescending(ca => ca.AssignedDate)
            .ToListAsync();
    }
}