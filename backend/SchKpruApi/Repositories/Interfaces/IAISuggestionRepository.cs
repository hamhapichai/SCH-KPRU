using SchKpruApi.Models;

namespace SchKpruApi.Repositories.Interfaces;

public interface IAISuggestionRepository : IGenericRepository<AISuggestion>
{
    Task<AISuggestion?> GetByComplaintIdAsync(int complaintId);
}