using SchKpruApi.Models;

namespace SchKpruApi.Repositories.Interfaces;

public interface IDepartmentRepository : IGenericRepository<Department>
{
    Task<Department?> GetByNameAsync(string departmentName);
    Task<IEnumerable<Department>> GetActiveAsync();
    Task<IEnumerable<Department>> GetAllWithUserCountAsync();
    Task<IEnumerable<Department>> GetActiveWithUserCountAsync();
    Task<Department?> GetByIdWithUserCountAsync(int id);
    Task<int> GetTotalCountAsync();
}