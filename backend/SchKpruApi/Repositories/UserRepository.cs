using Microsoft.EntityFrameworkCore;
using SchKpruApi.Data;
using SchKpruApi.Models;

namespace SchKpruApi.Repositories
{
    public class UserRepository : GenericRepository<User>, IUserRepository
    {
        public UserRepository(ApplicationDbContext context) : base(context) { }

        public override async Task<IEnumerable<User>> GetAllAsync()
        {
            return await _dbSet
                .Include(u => u.Role)
                .Include(u => u.Department)
                .ToListAsync();
        }

        public override async Task<User?> GetByIdAsync(int id)
        {
            return await _dbSet
                .Include(u => u.Role)
                .Include(u => u.Department)
                .FirstOrDefaultAsync(u => u.UserId == id);
        }

        public async Task<User?> GetByUsernameAsync(string username)
        {
            return await _dbSet
                .Include(u => u.Role)
                .Include(u => u.Department)
                .FirstOrDefaultAsync(u => u.Username == username);
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            return await _dbSet
                .Include(u => u.Role)
                .Include(u => u.Department)
                .FirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task<bool> UsernameExistsAsync(string username)
        {
            return await _dbSet.AnyAsync(u => u.Username == username);
        }

        public async Task<bool> EmailExistsAsync(string email)
        {
            return await _dbSet.AnyAsync(u => u.Email == email);
        }

        public async Task<IEnumerable<User>> GetByDepartmentAsync(int departmentId)
        {
            return await _dbSet
                .Include(u => u.Role)
                .Include(u => u.Department)
                .Where(u => u.DepartmentId == departmentId)
                .ToListAsync();
        }

        public async Task<IEnumerable<User>> GetByRoleAsync(int roleId)
        {
            return await _dbSet
                .Include(u => u.Role)
                .Include(u => u.Department)
                .Where(u => u.RoleId == roleId)
                .ToListAsync();
        }

        public async Task<int> GetTotalCountAsync()
        {
            return await _dbSet.CountAsync();
        }
    }
}