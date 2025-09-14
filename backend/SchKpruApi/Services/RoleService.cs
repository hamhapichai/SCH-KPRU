using SchKpruApi.Models;
using SchKpruApi.Repositories;

namespace SchKpruApi.Services
{
    public class RoleService : IRoleService
    {
        private readonly IRoleRepository _roleRepository;

        public RoleService(IRoleRepository roleRepository)
        {
            _roleRepository = roleRepository;
        }

        public async Task<IEnumerable<Role>> GetAllRolesAsync()
        {
            return await _roleRepository.GetAllAsync();
        }

        public async Task<Role?> GetRoleByIdAsync(int id)
        {
            return await _roleRepository.GetByIdAsync(id);
        }

        public async Task<Role?> GetRoleByNameAsync(string roleName)
        {
            return await _roleRepository.GetByNameAsync(roleName);
        }

        public async Task<Role> CreateRoleAsync(Role role)
        {
            return await _roleRepository.CreateAsync(role);
        }

        public async Task<Role?> UpdateRoleAsync(int id, Role role)
        {
            var existingRole = await _roleRepository.GetByIdAsync(id);
            if (existingRole == null)
                return null;

            existingRole.RoleName = role.RoleName;
            return await _roleRepository.UpdateAsync(existingRole);
        }

        public async Task<bool> DeleteRoleAsync(int id)
        {
            return await _roleRepository.DeleteAsync(id);
        }
    }
}