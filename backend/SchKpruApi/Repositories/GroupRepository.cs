using Microsoft.EntityFrameworkCore;
using SchKpruApi.Data;
using SchKpruApi.Models;
using SchKpruApi.Repositories.Interfaces;

namespace SchKpruApi.Repositories;

public class GroupRepository : GenericRepository<Group>, IGroupRepository
{
    public GroupRepository(ApplicationDbContext context) : base(context)
    {
    }

    public override async Task<Group?> GetByIdAsync(int id)
    {
        return await _dbSet
            .Include(g => g.Department)
            .Include(g => g.CreatedByUser)
            .Include(g => g.UpdatedByUser)
            .Include(g => g.Members)
            .FirstOrDefaultAsync(g => g.GroupId == id);
    }

    public override async Task<IEnumerable<Group>> GetAllAsync()
    {
        return await _dbSet
            .Include(g => g.Department)
            .Include(g => g.CreatedByUser)
            .Include(g => g.UpdatedByUser)
            .Include(g => g.Members)
            .ToListAsync();
    }

    public async Task<IEnumerable<Group>> GetByDepartmentIdAsync(int departmentId)
    {
        return await _dbSet
            .Include(g => g.Department)
            .Include(g => g.CreatedByUser)
            .Include(g => g.UpdatedByUser)
            .Include(g => g.Members)
            .Where(g => g.DepartmentId == departmentId)
            .ToListAsync();
    }

    public async Task<IEnumerable<Group>> GetActiveAsync()
    {
        return await _dbSet
            .Include(g => g.Department)
            .Include(g => g.Members)
            .Where(g => g.IsActive)
            .ToListAsync();
    }
}