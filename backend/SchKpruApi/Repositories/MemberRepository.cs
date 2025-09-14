using Microsoft.EntityFrameworkCore;
using SchKpruApi.Data;
using SchKpruApi.Models;

namespace SchKpruApi.Repositories
{
    public class MemberRepository : GenericRepository<Member>, IMemberRepository
    {
        public MemberRepository(ApplicationDbContext context) : base(context) { }

        public override async Task<IEnumerable<Member>> GetAllAsync()
        {
            return await _dbSet
                .Include(m => m.Group)
                    .ThenInclude(g => g.Department)
                .Include(m => m.User)
                .Include(m => m.CreatedByUser)
                .ToListAsync();
        }

        public async Task<IEnumerable<Member>> GetByGroupIdAsync(int groupId)
        {
            return await _dbSet
                .Include(m => m.User)
                    .ThenInclude(u => u.Role)
                .Include(m => m.CreatedByUser)
                .Where(m => m.GroupId == groupId)
                .ToListAsync();
        }

        public async Task<IEnumerable<Member>> GetByUserIdAsync(int userId)
        {
            return await _dbSet
                .Include(m => m.Group)
                    .ThenInclude(g => g.Department)
                .Include(m => m.CreatedByUser)
                .Where(m => m.UserId == userId)
                .ToListAsync();
        }

        public async Task<bool> IsMemberOfGroupAsync(int userId, int groupId)
        {
            return await _dbSet.AnyAsync(m => m.UserId == userId && m.GroupId == groupId);
        }
    }
}