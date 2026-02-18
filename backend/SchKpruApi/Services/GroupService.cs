using SchKpruApi.Models;
using SchKpruApi.Repositories.Interfaces;
using SchKpruApi.Services.Interfaces;

namespace SchKpruApi.Services;

public class GroupService : IGroupService
{
    private readonly IGroupRepository _groupRepository;

    public GroupService(IGroupRepository groupRepository)
    {
        _groupRepository = groupRepository;
    }

    public async Task<IEnumerable<Group>> GetAllGroupsAsync()
    {
        return await _groupRepository.GetAllAsync();
    }

    public async Task<Group?> GetGroupByIdAsync(int id)
    {
        return await _groupRepository.GetByIdAsync(id);
    }

    public async Task<IEnumerable<Group>> GetGroupsByDepartmentIdAsync(int departmentId)
    {
        return await _groupRepository.GetByDepartmentIdAsync(departmentId);
    }

    public async Task<IEnumerable<Group>> GetActiveGroupsAsync()
    {
        return await _groupRepository.GetActiveAsync();
    }

    public async Task<Group> CreateGroupAsync(Group group, int createdByUserId)
    {
        group.CreatedByUserId = createdByUserId;
        group.CreatedAt = DateTime.UtcNow;
        return await _groupRepository.CreateAsync(group);
    }

    public async Task<Group?> UpdateGroupAsync(int id, Group group, int updatedByUserId)
    {
        var existingGroup = await _groupRepository.GetByIdAsync(id);
        if (existingGroup == null)
            return null;

        existingGroup.Name = group.Name;
        existingGroup.Description = group.Description;
        existingGroup.IsActive = group.IsActive;
        existingGroup.UpdatedByUserId = updatedByUserId;
        existingGroup.UpdatedAt = DateTime.UtcNow;

        return await _groupRepository.UpdateAsync(existingGroup);
    }

    public async Task<bool> DeleteGroupAsync(int id)
    {
        return await _groupRepository.DeleteAsync(id);
    }
}