using SchKpruApi.Models;

namespace SchKpruApi.Repositories.Interfaces;

public interface IComplaintLogRepository : IGenericRepository<ComplaintLog>
{
    Task<IEnumerable<ComplaintLog>> GetByComplaintIdAsync(int complaintId);
    Task<IEnumerable<ComplaintLog>> GetByUserIdAsync(int userId);
}