using Microsoft.EntityFrameworkCore;
using SchKpruApi.Data;
using SchKpruApi.Models;

namespace SchKpruApi.Repositories
{
    public class DepartmentRepository : GenericRepository<Department>, IDepartmentRepository
    {
        public DepartmentRepository(ApplicationDbContext context) : base(context) { }

        public async Task<Department?> GetByNameAsync(string departmentName)
        {
            return await _dbSet.FirstOrDefaultAsync(d => d.DepartmentName == departmentName);
        }

        public async Task<IEnumerable<Department>> GetActiveAsync()
        {
            return await _dbSet.Where(d => !d.IsDeleted).ToListAsync();
        }

        public async Task<IEnumerable<Department>> GetAllWithUserCountAsync()
        {
            return await _dbSet
                .Include(d => d.Users)
                .ToListAsync();
        }

        public async Task<IEnumerable<Department>> GetActiveWithUserCountAsync()
        {
            return await _dbSet
                .Include(d => d.Users)
                .Where(d => !d.IsDeleted)
                .ToListAsync();
        }

        public async Task<Department?> GetByIdWithUserCountAsync(int id)
        {
            return await _dbSet
                .Include(d => d.Users)
                .FirstOrDefaultAsync(d => d.DepartmentId == id);
        }

        public async Task<int> GetTotalCountAsync()
        {
            return await _dbSet.CountAsync(d => !d.IsDeleted);
        }
    }
}