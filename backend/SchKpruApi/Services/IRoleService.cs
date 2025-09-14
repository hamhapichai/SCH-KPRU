using SchKpruApi.Models;

namespace SchKpruApi.Services
{
    public interface IRoleService
    {
        Task<IEnumerable<Role>> GetAllRolesAsync();
        Task<Role?> GetRoleByIdAsync(int id);
        Task<Role?> GetRoleByNameAsync(string roleName);
        Task<Role> CreateRoleAsync(Role role);
        Task<Role?> UpdateRoleAsync(int id, Role role);
        Task<bool> DeleteRoleAsync(int id);
    }
}