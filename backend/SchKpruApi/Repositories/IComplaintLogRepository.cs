using SchKpruApi.Models;

namespace SchKpruApi.Repositories
{
    public interface IComplaintLogRepository : IGenericRepository<ComplaintLog>
    {
        Task<IEnumerable<ComplaintLog>> GetByComplaintIdAsync(int complaintId);
        Task<IEnumerable<ComplaintLog>> GetByUserIdAsync(int userId);
    }
}