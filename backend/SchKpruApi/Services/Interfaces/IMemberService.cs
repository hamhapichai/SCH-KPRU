using SchKpruApi.Models;

namespace SchKpruApi.Services.Interfaces;

public interface IMemberService
{
    Task<IEnumerable<Member>> GetAllMembersAsync();
    Task<Member?> GetMemberByIdAsync(int id);
    Task<IEnumerable<Member>> GetMembersByGroupIdAsync(int groupId);
    Task<IEnumerable<Member>> GetMembersByUserIdAsync(int userId);
    Task<Member> CreateMemberAsync(Member member, int createdByUserId);
    Task<bool> DeleteMemberAsync(int id);
    Task<bool> IsMemberOfGroupAsync(int userId, int groupId);
}