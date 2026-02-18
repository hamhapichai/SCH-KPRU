using SchKpruApi.Models;

namespace SchKpruApi.Repositories.Interfaces;

public interface IMemberRepository : IGenericRepository<Member>
{
    Task<IEnumerable<Member>> GetByGroupIdAsync(int groupId);
    Task<IEnumerable<Member>> GetByUserIdAsync(int userId);
    Task<bool> IsMemberOfGroupAsync(int userId, int groupId);
}