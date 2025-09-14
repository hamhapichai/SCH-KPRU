using Microsoft.EntityFrameworkCore;
using SchKpruApi.Data;
using SchKpruApi.Models;

namespace SchKpruApi.Repositories
{
    public class AISuggestionRepository : GenericRepository<AISuggestion>, IAISuggestionRepository
    {
        public AISuggestionRepository(ApplicationDbContext context) : base(context) { }

        public override async Task<IEnumerable<AISuggestion>> GetAllAsync()
        {
            return await _dbSet
                .Include(ai => ai.Complaint)
                .Include(ai => ai.SuggestedDepartment)
                .OrderByDescending(ai => ai.SuggestedAt)
                .ToListAsync();
        }

        public async Task<AISuggestion?> GetByComplaintIdAsync(int complaintId)
        {
            return await _dbSet
                .Include(ai => ai.SuggestedDepartment)
                .Where(ai => ai.ComplaintId == complaintId)
                .OrderByDescending(ai => ai.SuggestedAt)
                .FirstOrDefaultAsync();
        }
    }
}