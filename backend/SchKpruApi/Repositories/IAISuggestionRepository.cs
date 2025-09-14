using SchKpruApi.Models;

namespace SchKpruApi.Repositories
{
    public interface IAISuggestionRepository : IGenericRepository<AISuggestion>
    {
        Task<AISuggestion?> GetByComplaintIdAsync(int complaintId);
    }
}