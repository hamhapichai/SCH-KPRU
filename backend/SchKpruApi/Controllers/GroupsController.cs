using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchKpruApi.DTOs;
using System.Security.Claims;
using SchKpruApi.Services.Interfaces;

namespace SchKpruApi.Controllers;

[ApiController]
[Route("api/admin/[controller]")]
[Authorize]
public class GroupsController : ControllerBase
{
    private readonly IGroupService _groupService;
    private readonly IMemberService _memberService;

    public GroupsController(IGroupService groupService, IMemberService memberService)
    {
        _groupService = groupService;
        _memberService = memberService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<GroupResponseDto>>> GetAllGroups()
    {
        try
        {
            var groups = await _groupService.GetAllGroupsAsync();
            var result = groups.Select(g => new GroupResponseDto
            {
                GroupId = g.GroupId,
                DepartmentId = g.DepartmentId,
                DepartmentName = g.Department?.DepartmentName ?? "",
                Name = g.Name,
                Description = g.Description,
                IsActive = g.IsActive,
                CreatedAt = g.CreatedAt,
                UpdatedAt = g.UpdatedAt,
                CreatedByUserName = g.CreatedByUser?.Name + " " + g.CreatedByUser?.Lastname,
                UpdatedByUserName = g.UpdatedByUser?.Name + " " + g.UpdatedByUser?.Lastname,
                MemberCount = g.Members?.Count ?? 0
            });
            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpGet("department/{departmentId}")]
    public async Task<ActionResult<IEnumerable<GroupResponseDto>>> GetGroupsByDepartment(int departmentId)
    {
        try
        {
            var groups = await _groupService.GetGroupsByDepartmentIdAsync(departmentId);
            var result = groups.Select(g => new GroupResponseDto
            {
                GroupId = g.GroupId,
                DepartmentId = g.DepartmentId,
                DepartmentName = g.Department?.DepartmentName ?? "",
                Name = g.Name,
                Description = g.Description,
                IsActive = g.IsActive,
                CreatedAt = g.CreatedAt,
                UpdatedAt = g.UpdatedAt,
                CreatedByUserName = g.CreatedByUser?.Name + " " + g.CreatedByUser?.Lastname,
                UpdatedByUserName = g.UpdatedByUser?.Name + " " + g.UpdatedByUser?.Lastname,
                MemberCount = g.Members?.Count ?? 0
            });
            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<GroupResponseDto>> GetGroup(int id)
    {
        try
        {
            var group = await _groupService.GetGroupByIdAsync(id);
            if (group == null)
                return NotFound($"Group with ID {id} not found");

            var result = new GroupResponseDto
            {
                GroupId = group.GroupId,
                DepartmentId = group.DepartmentId,
                DepartmentName = group.Department?.DepartmentName ?? "",
                Name = group.Name,
                Description = group.Description,
                IsActive = group.IsActive,
                CreatedAt = group.CreatedAt,
                UpdatedAt = group.UpdatedAt,
                CreatedByUserName = group.CreatedByUser?.Name + " " + group.CreatedByUser?.Lastname,
                UpdatedByUserName = group.UpdatedByUser?.Name + " " + group.UpdatedByUser?.Lastname,
                MemberCount = group.Members?.Count ?? 0
            };

            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpPost]
    public async Task<ActionResult<GroupResponseDto>> CreateGroup(GroupCreateDto groupDto)
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
                return Unauthorized("User ID not found in token");

            var group = new Models.Group
            {
                DepartmentId = groupDto.DepartmentId,
                Name = groupDto.Name,
                Description = groupDto.Description,
                IsActive = true
            };

            var createdGroup = await _groupService.CreateGroupAsync(group, userId);

            var result = new GroupResponseDto
            {
                GroupId = createdGroup.GroupId,
                DepartmentId = createdGroup.DepartmentId,
                DepartmentName = createdGroup.Department?.DepartmentName ?? "",
                Name = createdGroup.Name,
                Description = createdGroup.Description,
                IsActive = createdGroup.IsActive,
                CreatedAt = createdGroup.CreatedAt,
                UpdatedAt = createdGroup.UpdatedAt,
                CreatedByUserName = createdGroup.CreatedByUser?.Name + " " + createdGroup.CreatedByUser?.Lastname,
                UpdatedByUserName = createdGroup.UpdatedByUser?.Name + " " + createdGroup.UpdatedByUser?.Lastname,
                MemberCount = createdGroup.Members?.Count ?? 0
            };

            return CreatedAtAction(nameof(GetGroup), new { id = result.GroupId }, result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateGroup(int id, GroupUpdateDto groupDto)
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
                return Unauthorized("User ID not found in token");

            var group = new Models.Group
            {
                Name = groupDto.Name,
                Description = groupDto.Description,
                IsActive = groupDto.IsActive
            };

            var updatedGroup = await _groupService.UpdateGroupAsync(id, group, userId);
            if (updatedGroup == null)
                return NotFound($"Group with ID {id} not found");

            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteGroup(int id)
    {
        try
        {
            var result = await _groupService.DeleteGroupAsync(id);
            if (!result)
                return NotFound($"Group with ID {id} not found");

            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpGet("{id}/members")]
    public async Task<ActionResult<IEnumerable<MemberResponseDto>>> GetGroupMembers(int id)
    {
        try
        {
            var members = await _memberService.GetMembersByGroupIdAsync(id);
            var result = members.Select(m => new MemberResponseDto
            {
                MembersId = m.MembersId,
                GroupId = m.GroupId,
                UserId = m.UserId,
                UserName = m.User?.Username ?? "",
                UserEmail = m.User?.Email ?? "",
                UserFullName = m.User?.Name + " " + m.User?.Lastname,
                CreatedAt = m.CreatedAt,
                CreatedByUserName = m.CreatedByUser?.Name + " " + m.CreatedByUser?.Lastname
            });
            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpPost("{id}/members")]
    public async Task<IActionResult> AddMember(int id, MemberCreateDto memberDto)
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
                return Unauthorized("User ID not found in token");

            var member = new Models.Member
            {
                GroupId = id,
                UserId = memberDto.UserId
            };

            var createdMember = await _memberService.CreateMemberAsync(member, userId);
            return CreatedAtAction(nameof(GetGroupMembers), new { id = createdMember.GroupId }, createdMember);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpDelete("members/{memberId}")]
    public async Task<IActionResult> RemoveMember(int memberId)
    {
        try
        {
            var result = await _memberService.DeleteMemberAsync(memberId);
            if (!result)
                return NotFound($"Member with ID {memberId} not found");

            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }
}