using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Cors;
using SchKpruApi.DTOs;
using SchKpruApi.Services;

namespace SchKpruApi.Controllers
{
    [ApiController]
    [Route("api")]
    [EnableCors("AllowAll")]
    public class PublicController : ControllerBase
    {
        private readonly IComplaintService _complaintService;
        private readonly IDepartmentService _departmentService;

        public PublicController(IComplaintService complaintService, IDepartmentService departmentService)
        {
            _complaintService = complaintService;
            _departmentService = departmentService;
        }

        [HttpPost("complaints")]
        public async Task<ActionResult<object>> CreateComplaint([FromBody] ComplaintCreateDto dto)
        {
            try
            {
                var complaint = await _complaintService.CreateAsync(dto);
                
                return Ok(new
                {
                    message = "ส่งข้อร้องเรียนเรียบร้อยแล้ว",
                    ticketId = complaint.TicketId,
                    complaintId = complaint.ComplaintId
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("complaints/{id}")]
        public async Task<ActionResult<object>> GetComplaint(int id)
        {
            try
            {
                var complaint = await _complaintService.GetComplaintByIdAsync(id);
                if (complaint == null)
                {
                    return NotFound(new { message = "ไม่พบข้อมูลเรื่องร้องเรียน" });
                }

                return Ok(new
                {
                    complaintId = complaint.ComplaintId,
                    ticketId = complaint.TicketId,
                    subject = complaint.Subject,
                    message = complaint.Message,
                    currentStatus = complaint.CurrentStatus,
                    submissionDate = complaint.SubmissionDate,
                    isAnonymous = complaint.IsAnonymous,
                    contactName = complaint.ContactName,
                    contactEmail = complaint.ContactEmail,
                    contactPhone = complaint.ContactPhone
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("complaints/track/{ticketId}")]
        public async Task<ActionResult<object>> TrackComplaint(string ticketId)
        {
            try
            {
                var complaint = await _complaintService.GetByTicketIdAsync(ticketId);
                
                if (complaint == null)
                {
                    return NotFound(new { message = "ไม่พบข้อมูลเรื่องร้องเรียน" });
                }

                // Get assignments for this complaint
                var assignments = await _complaintService.GetComplaintAssignmentsAsync(complaint.ComplaintId);

                return Ok(new
                {
                    complaintId = complaint.ComplaintId,
                    ticketId = complaint.TicketId,
                    subject = complaint.Subject,
                    message = complaint.Message,
                    currentStatus = complaint.CurrentStatus,
                    submissionDate = complaint.SubmissionDate,
                    updatedAt = complaint.UpdatedAt,
                    isAnonymous = complaint.IsAnonymous,
                    contactName = complaint.ContactName,
                    assignments = assignments?.Select(a => new
                    {
                        assignmentId = a.AssignmentId,
                        departmentName = a.AssignedToDeptName,
                        groupName = a.AssignedToGroupName,
                        assignedDate = a.AssignedDate,
                        status = a.Status
                    }).ToList()
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("departments")]
        public async Task<ActionResult<object>> GetDepartments()
        {
            try
            {
                var departments = await _departmentService.GetAllDepartmentsAsync();
                return Ok(departments);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}