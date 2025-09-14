using SchKpruApi.Models;

namespace SchKpruApi.Repositories
{
    public interface IGroupRepository : IGenericRepository<Group>
    {
        Task<IEnumerable<Group>> GetByDepartmentIdAsync(int departmentId);
        Task<IEnumerable<Group>> GetActiveAsync();
    }
}