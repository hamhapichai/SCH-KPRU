using SchKpruApi.Models;
using SchKpruApi.Repositories;

namespace SchKpruApi.Services
{
    public class MemberService : IMemberService
    {
        private readonly IMemberRepository _memberRepository;

        public MemberService(IMemberRepository memberRepository)
        {
            _memberRepository = memberRepository;
        }

        public async Task<IEnumerable<Member>> GetAllMembersAsync()
        {
            return await _memberRepository.GetAllAsync();
        }

        public async Task<Member?> GetMemberByIdAsync(int id)
        {
            return await _memberRepository.GetByIdAsync(id);
        }

        public async Task<IEnumerable<Member>> GetMembersByGroupIdAsync(int groupId)
        {
            return await _memberRepository.GetByGroupIdAsync(groupId);
        }

        public async Task<IEnumerable<Member>> GetMembersByUserIdAsync(int userId)
        {
            return await _memberRepository.GetByUserIdAsync(userId);
        }

        public async Task<Member> CreateMemberAsync(Member member, int createdByUserId)
        {
            member.CreatedByUserId = createdByUserId;
            member.CreatedAt = DateTime.UtcNow;
            return await _memberRepository.CreateAsync(member);
        }

        public async Task<bool> DeleteMemberAsync(int id)
        {
            return await _memberRepository.DeleteAsync(id);
        }

        public async Task<bool> IsMemberOfGroupAsync(int userId, int groupId)
        {
            return await _memberRepository.IsMemberOfGroupAsync(userId, groupId);
        }
    }
}