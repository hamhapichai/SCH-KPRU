using SchKpruApi.Models;

namespace SchKpruApi.Services
{
    public interface IGroupService
    {
        Task<IEnumerable<Group>> GetAllGroupsAsync();
        Task<Group?> GetGroupByIdAsync(int id);
        Task<IEnumerable<Group>> GetGroupsByDepartmentIdAsync(int departmentId);
        Task<IEnumerable<Group>> GetActiveGroupsAsync();
        Task<Group> CreateGroupAsync(Group group, int createdByUserId);
        Task<Group?> UpdateGroupAsync(int id, Group group, int updatedByUserId);
        Task<bool> DeleteGroupAsync(int id);
    }
}