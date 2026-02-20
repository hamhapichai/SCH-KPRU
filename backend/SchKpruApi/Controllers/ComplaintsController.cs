using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchKpruApi.DTOs;
using SchKpruApi.Repositories.Interfaces;
using SchKpruApi.Services.Interfaces;

namespace SchKpruApi.Controllers;

[ApiController]
[Route("api/admin/complaints")]
public class ComplaintsController : ControllerBase
{
    private readonly IComplaintService _complaintService;
    private readonly IUserRepository _userRepository;

    public ComplaintsController(IComplaintService complaintService, IUserRepository userRepository)
    {
        _complaintService = complaintService;
        _userRepository = userRepository;
    }

    [HttpGet]
    [Authorize]
    public async Task<ActionResult<IEnumerable<ComplaintResponseDto>>> GetAllComplaints()
    {
        try
        {
            // Get current user info
            var currentUserIdClaim = User.FindFirst("UserId")?.Value;
            var currentUserRoleClaim = User.FindFirst(ClaimTypes.Role)?.Value;

            if (!int.TryParse(currentUserIdClaim, out var currentUserId))
                return Unauthorized();

            // Get user details for department and group info
            var user = await _userRepository.GetByIdAsync(currentUserId);
            if (user == null)
                return Unauthorized();

            // Check if user is Admin - they shouldn't access this
            if (currentUserRoleClaim == "Admin")
                return Forbid("Admin cannot access complaints");

            var complaints = await _complaintService.GetComplaintsByUserRoleAsync(
                currentUserId,
                currentUserRoleClaim ?? "",
                user.DepartmentId,
                null // We'll get groupId from service if needed
            );

            return Ok(complaints);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpGet("{id}")]
    [Authorize]
    public async Task<ActionResult<ComplaintResponseDto>> GetComplaint(int id)
    {
        try
        {
            var complaint = await _complaintService.GetComplaintByIdAsync(id);
            if (complaint == null)
                return NotFound($"Complaint with ID {id} not found");

            return Ok(complaint);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpGet("ticket/{ticketId}")]
    public async Task<ActionResult<ComplaintResponseDto>> GetComplaintByTicketId(Guid ticketId)
    {
        try
        {
            var complaint = await _complaintService.GetComplaintByTicketIdAsync(ticketId);
            if (complaint == null)
                return NotFound($"Complaint with ticket ID {ticketId} not found");

            return Ok(complaint);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpPost]
    public async Task<ActionResult<ComplaintResponseDto>> CreateComplaint(
        [FromBody] ComplaintCreateDto complaintCreateDto)
    {
        try
        {
            var complaint = await _complaintService.CreateComplaintAsync(complaintCreateDto);
            return CreatedAtAction(nameof(GetComplaint), new { id = complaint.ComplaintId }, complaint);
        }
        catch (Exception ex)
        {
            Console.WriteLine("------------------------------------------------------");
            Console.Error.WriteLine(ex);
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpPut("{id}")]
    [Authorize]
    public async Task<ActionResult<ComplaintResponseDto>> UpdateComplaint(int id,
        [FromBody] ComplaintUpdateDto complaintUpdateDto)
    {
        try
        {
            var currentUserIdClaim = User.FindFirst("UserId")?.Value;
            if (!int.TryParse(currentUserIdClaim, out var currentUserId))
                return Unauthorized();

            var complaint = await _complaintService.UpdateComplaintAsync(id, complaintUpdateDto, currentUserId);
            if (complaint == null)
                return NotFound($"Complaint with ID {id} not found");

            return Ok(complaint);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<ActionResult> DeleteComplaint(int id)
    {
        try
        {
            var result = await _complaintService.DeleteComplaintAsync(id);
            if (!result)
                return NotFound($"Complaint with ID {id} not found");

            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpGet("status/{status}")]
    [Authorize]
    public async Task<ActionResult<IEnumerable<ComplaintResponseDto>>> GetComplaintsByStatus(string status)
    {
        try
        {
            var complaints = await _complaintService.GetComplaintsByStatusAsync(status);
            return Ok(complaints);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpGet("search/{searchTerm}")]
    [Authorize]
    public async Task<ActionResult<IEnumerable<ComplaintResponseDto>>> SearchComplaints(string searchTerm)
    {
        try
        {
            var complaints = await _complaintService.SearchComplaintsAsync(searchTerm);
            return Ok(complaints);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpGet("recent")]
    [Authorize]
    public async Task<ActionResult<IEnumerable<ComplaintResponseDto>>> GetRecentComplaints(
        [FromQuery] int count = 10)
    {
        try
        {
            var complaints = await _complaintService.GetRecentComplaintsAsync(count);
            return Ok(complaints);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpGet("filtered")]
    [Authorize]
    public async Task<ActionResult<object>> GetFilteredComplaints(
        [FromQuery] string? searchTerm,
        [FromQuery] string? status,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        try
        {
            // Get current user info
            var currentUserIdClaim = User.FindFirst("UserId")?.Value;
            var currentUserRoleClaim = User.FindFirst(ClaimTypes.Role)?.Value;

            if (!int.TryParse(currentUserIdClaim, out var currentUserId))
                return Unauthorized();

            // Get user details for department and group info
            var user = await _userRepository.GetByIdAsync(currentUserId);
            if (user == null)
                return Unauthorized();

            // Check if user is Admin - they shouldn't access this
            if (currentUserRoleClaim == "Admin")
                return Forbid("Admin cannot access complaints");

            // Get filtered complaints based on user role
            var (complaints, totalCount) = await _complaintService.GetFilteredComplaintsByUserRoleAsync(
                searchTerm,
                status,
                page,
                pageSize,
                currentUserId,
                currentUserRoleClaim ?? "",
                user.DepartmentId,
                null // We'll get groupId from service if needed
            );

            return Ok(new
            {
                complaints,
                pagination = new
                {
                    page,
                    pageSize,
                    totalCount,
                    totalPages = (int)Math.Ceiling((double)totalCount / pageSize)
                }
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    // Assignment endpoints
    [HttpPost("{id}/assign")]
    [Authorize]
    public async Task<ActionResult<ComplaintAssignmentResponseDto>> AssignComplaint(int id,
        [FromBody] ComplaintAssignmentCreateDto assignmentDto)
    {
        try
        {
            var currentUserIdClaim = User.FindFirst("UserId")?.Value;
            var currentUserRoleClaim = User.FindFirst(ClaimTypes.Role)?.Value;

            if (!int.TryParse(currentUserIdClaim, out var currentUserId))
                return Unauthorized();

            // Check if user is Dean or Deputy (both can assign)
            if (currentUserRoleClaim != "Dean" && currentUserRoleClaim != "Deputy")
                return Forbid("Only Dean or Deputy can assign complaints");

            // Get user details for department validation
            var user = await _userRepository.GetByIdAsync(currentUserId);
            if (user == null)
                return Unauthorized();

            // For Deputy: validate that assignment is within their department
            if (currentUserRoleClaim == "Deputy")
            {
                if (assignmentDto.AssignedToDeptId.HasValue &&
                    assignmentDto.AssignedToDeptId.Value != user.DepartmentId)
                    return Forbid("Deputy can only assign within their own department");

                // If assigning to group, ensure the group belongs to deputy's department
                if (assignmentDto.AssignedToGroupId.HasValue)
                {
                    // We'll validate this in the service layer
                }
            }

            var assignment = await _complaintService.AssignComplaintAsync(id, assignmentDto, currentUserId);
            if (assignment == null)
                return NotFound($"Complaint with ID {id} not found");

            return Ok(assignment);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpGet("{id}/assignments")]
    [Authorize]
    public async Task<ActionResult<IEnumerable<ComplaintAssignmentResponseDto>>> GetComplaintAssignments(int id)
    {
        try
        {
            var assignments = await _complaintService.GetComplaintAssignmentsAsync(id);
            return Ok(assignments);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    // Status update with notes endpoint
    [HttpPut("{id}/status")]
    [Authorize]
    public async Task<ActionResult<ComplaintResponseDto>> UpdateComplaintStatus(int id,
        [FromBody] ComplaintStatusUpdateDto statusUpdateDto)
    {
        try
        {
            var currentUserIdClaim = User.FindFirst("UserId")?.Value;
            if (!int.TryParse(currentUserIdClaim, out var currentUserId))
                return Unauthorized();

            var complaint = await _complaintService.UpdateComplaintStatusAsync(id, statusUpdateDto, currentUserId);
            if (complaint == null)
                return NotFound($"Complaint with ID {id} not found");

            return Ok(complaint);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    // Log endpoints
    [HttpGet("{id}/logs")]
    [Authorize]
    public async Task<ActionResult<IEnumerable<ComplaintLogResponseDto>>> GetComplaintLogs(int id)
    {
        try
        {
            var logs = await _complaintService.GetComplaintLogsAsync(id);
            return Ok(logs);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    // Dashboard endpoints
    [HttpGet("dashboard/stats")]
    [Authorize]
    public async Task<ActionResult<DashboardStatsDto>> GetDashboardStats()
    {
        try
        {
            // Get current user info
            var currentUserIdClaim = User.FindFirst("UserId")?.Value;
            var currentUserRoleClaim = User.FindFirst(ClaimTypes.Role)?.Value;

            if (!int.TryParse(currentUserIdClaim, out var currentUserId))
                return Unauthorized();

            // Get user details for department and group info
            var user = await _userRepository.GetByIdAsync(currentUserId);
            if (user == null)
                return Unauthorized();

            var stats = await _complaintService.GetDashboardStatsAsync(
                currentUserId,
                currentUserRoleClaim ?? "",
                user.DepartmentId,
                null // We'll get groupId from service if needed
            );
            return Ok(stats);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpGet("dashboard/recent")]
    [Authorize]
    public async Task<ActionResult<IEnumerable<RecentComplaintDto>>> GetRecentComplaintsForDashboard(
        [FromQuery] int count = 5)
    {
        try
        {
            // Get current user info
            var currentUserIdClaim = User.FindFirst("UserId")?.Value;
            var currentUserRoleClaim = User.FindFirst(ClaimTypes.Role)?.Value;

            if (!int.TryParse(currentUserIdClaim, out var currentUserId))
                return Unauthorized();

            // Get user details for department and group info
            var user = await _userRepository.GetByIdAsync(currentUserId);
            if (user == null)
                return Unauthorized();

            var complaints = await _complaintService.GetRecentComplaintsForDashboardAsync(
                count,
                currentUserId,
                currentUserRoleClaim ?? "",
                user.DepartmentId,
                null // We'll get groupId from service if needed
            );
            return Ok(complaints);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpGet("{id}/attachments/{attachmentId}/download")]
    [Authorize]
    public async Task<IActionResult> DownloadAttachment(int id, int attachmentId)
    {
        try
        {
            var result = await _complaintService.DownloadAttachmentAsync(id, attachmentId);
            if (result == null)
                return NotFound("Attachment not found");

            var (stream, contentType, fileName) = result.Value;
            return File(stream, contentType, fileName);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }
}