using Microsoft.EntityFrameworkCore;
using SchKpruApi.Data;
using SchKpruApi.Models;
using SchKpruApi.Repositories.Interfaces;

namespace SchKpruApi.Repositories;

public class ComplaintLogRepository : GenericRepository<ComplaintLog>, IComplaintLogRepository
{
    public ComplaintLogRepository(ApplicationDbContext context) : base(context)
    {
    }

    public override async Task<IEnumerable<ComplaintLog>> GetAllAsync()
    {
        return await _dbSet
            .Include(cl => cl.User)
            .Include(cl => cl.Department)
            .Include(cl => cl.CreatedByUser)
            .OrderByDescending(cl => cl.Timestamp)
            .ToListAsync();
    }

    public async Task<IEnumerable<ComplaintLog>> GetByComplaintIdAsync(int complaintId)
    {
        return await _dbSet
            .Include(cl => cl.User)
            .Include(cl => cl.Department)
            .Include(cl => cl.CreatedByUser)
            .Where(cl => cl.ComplaintId == complaintId)
            .OrderByDescending(cl => cl.Timestamp)
            .ToListAsync();
    }

    public async Task<IEnumerable<ComplaintLog>> GetByUserIdAsync(int userId)
    {
        return await _dbSet
            .Include(cl => cl.Complaint)
            .Include(cl => cl.Department)
            .Include(cl => cl.CreatedByUser)
            .Where(cl => cl.UserId == userId)
            .OrderByDescending(cl => cl.Timestamp)
            .ToListAsync();
    }
}