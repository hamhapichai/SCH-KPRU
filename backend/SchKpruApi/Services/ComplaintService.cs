using SchKpruApi.DTOs;
using SchKpruApi.Models;
using SchKpruApi.Repositories;

namespace SchKpruApi.Services
{
    public class ComplaintService : IComplaintService
    {
        private readonly IComplaintRepository _complaintRepository;
        private readonly IUserRepository _userRepository;
        private readonly IDepartmentRepository _departmentRepository;
        private readonly IMemberRepository _memberRepository;
        private readonly IGroupRepository _groupRepository;
        private readonly IWebhookService _webhookService;

        public ComplaintService(IComplaintRepository complaintRepository, IUserRepository userRepository, IDepartmentRepository departmentRepository, IMemberRepository memberRepository, IGroupRepository groupRepository, IWebhookService webhookService)
        {
            _complaintRepository = complaintRepository;
            _userRepository = userRepository;
            _departmentRepository = departmentRepository;
            _memberRepository = memberRepository;
            _groupRepository = groupRepository;
            _webhookService = webhookService;
        }

        public async Task<IEnumerable<ComplaintResponseDto>> GetAllComplaintsAsync()
        {
            var complaints = await _complaintRepository.GetAllAsync();
            return complaints.Select(MapToResponseDto);
        }

        public async Task<ComplaintResponseDto?> GetComplaintByIdAsync(int id)
        {
            var complaint = await _complaintRepository.GetByIdAsync(id);
            return complaint != null ? MapToResponseDto(complaint) : null;
        }

        public async Task<ComplaintResponseDto?> GetComplaintByTicketIdAsync(Guid ticketId)
        {
            var complaint = await _complaintRepository.GetByTicketIdAsync(ticketId);
            return complaint != null ? MapToResponseDto(complaint) : null;
        }

        public async Task<ComplaintResponseDto> CreateComplaintAsync(ComplaintCreateDto complaintCreateDto)
        {
            var complaint = new Complaint
            {
                ContactName = complaintCreateDto.ContactName,
                ContactEmail = complaintCreateDto.ContactEmail,
                ContactPhone = complaintCreateDto.ContactPhone,
                Subject = complaintCreateDto.Subject,
                Message = complaintCreateDto.Message,
                IsAnonymous = complaintCreateDto.IsAnonymous,
                CurrentStatus = "New",
                TicketId = Guid.NewGuid(),
                SubmissionDate = DateTime.UtcNow
            };

            var createdComplaint = await _complaintRepository.CreateAsync(complaint);
            var responseDto = MapToResponseDto(createdComplaint);

            // Send webhook asynchronously without blocking the response
            _ = Task.Run(async () =>
            {
                try
                {
                    await _webhookService.SendComplaintCreatedWebhookAsync(responseDto);
                }
                catch (Exception ex)
                {
                    // Log the error but don't fail the complaint creation
                    Console.WriteLine($"Failed to send webhook: {ex.Message}");
                }
            });

            return responseDto;
        }

        public async Task<ComplaintResponseDto?> UpdateComplaintAsync(int id, ComplaintUpdateDto complaintUpdateDto, int updatedByUserId)
        {
            var complaint = await _complaintRepository.GetByIdAsync(id);
            if (complaint == null)
                return null;

            if (!string.IsNullOrEmpty(complaintUpdateDto.CurrentStatus))
                complaint.CurrentStatus = complaintUpdateDto.CurrentStatus;

            complaint.UpdatedByUserId = updatedByUserId;
            complaint.UpdatedAt = DateTime.UtcNow;

            await _complaintRepository.UpdateAsync(complaint);
            var updatedComplaint = await _complaintRepository.GetByIdAsync(id);
            return MapToResponseDto(updatedComplaint!);
        }

        public async Task<bool> DeleteComplaintAsync(int id)
        {
            return await _complaintRepository.DeleteAsync(id);
        }

        public async Task<IEnumerable<ComplaintResponseDto>> GetComplaintsByStatusAsync(string status)
        {
            var complaints = await _complaintRepository.GetByStatusAsync(status);
            return complaints.Select(MapToResponseDto);
        }

        public async Task<IEnumerable<ComplaintResponseDto>> SearchComplaintsAsync(string searchTerm)
        {
            var complaints = await _complaintRepository.SearchAsync(searchTerm);
            return complaints.Select(MapToResponseDto);
        }

        public async Task<IEnumerable<ComplaintResponseDto>> GetRecentComplaintsAsync(int count = 10)
        {
            var complaints = await _complaintRepository.GetRecentAsync(count);
            return complaints.Select(MapToResponseDto);
        }

        public async Task<(IEnumerable<ComplaintResponseDto>, int)> GetFilteredComplaintsAsync(string? searchTerm, string? status, int page, int pageSize)
        {
            var (complaints, totalCount) = await _complaintRepository.GetFilteredAsync(searchTerm, status, page, pageSize);
            return (complaints.Select(MapToResponseDto), totalCount);
        }

        public async Task<IEnumerable<ComplaintResponseDto>> GetComplaintsByUserRoleAsync(int userId, string roleName, int? departmentId, int? groupId)
        {
            // สำหรับ Staff หากไม่ได้ระบุ groupId ให้หาจาก MemberRepository
            if (roleName == "Staff" && !groupId.HasValue)
            {
                var member = await _memberRepository.GetByUserIdAsync(userId);
                var userMember = member.FirstOrDefault();
                if (userMember != null)
                {
                    groupId = userMember.GroupId;
                }
            }

            var complaints = await _complaintRepository.GetByUserRoleAsync(userId, roleName, departmentId, groupId);
            return complaints.Select(MapToResponseDto);
        }

        public async Task<(IEnumerable<ComplaintResponseDto>, int)> GetFilteredComplaintsByUserRoleAsync(string? searchTerm, string? status, int page, int pageSize, int userId, string roleName, int? departmentId, int? groupId)
        {
            // สำหรับ Staff หากไม่ได้ระบุ groupId ให้หาจาก MemberRepository
            if (roleName == "Staff" && !groupId.HasValue)
            {
                var member = await _memberRepository.GetByUserIdAsync(userId);
                var userMember = member.FirstOrDefault();
                if (userMember != null)
                {
                    groupId = userMember.GroupId;
                }
            }

            var (complaints, totalCount) = await _complaintRepository.GetFilteredByUserRoleAsync(searchTerm, status, page, pageSize, userId, roleName, departmentId, groupId);
            return (complaints.Select(MapToResponseDto), totalCount);
        }

        private static ComplaintResponseDto MapToResponseDto(Complaint complaint)
        {
            return new ComplaintResponseDto
            {
                ComplaintId = complaint.ComplaintId,
                ContactName = complaint.ContactName,
                ContactEmail = complaint.ContactEmail,
                ContactPhone = complaint.ContactPhone,
                Subject = complaint.Subject,
                Message = complaint.Message,
                SubmissionDate = complaint.SubmissionDate,
                CurrentStatus = complaint.CurrentStatus,
                IsAnonymous = complaint.IsAnonymous,
                TicketId = complaint.TicketId,
                UpdatedAt = complaint.UpdatedAt,
                UpdatedByUserName = complaint.UpdatedByUser != null ? 
                    $"{complaint.UpdatedByUser.Name} {complaint.UpdatedByUser.Lastname}" : null
            };
        }

        // Public methods for non-authenticated access
        public async Task<ComplaintResponseDto?> GetByTicketIdAsync(string ticketId)
        {
            if (Guid.TryParse(ticketId, out Guid guid))
            {
                return await GetComplaintByTicketIdAsync(guid);
            }
            return null;
        }

        public async Task<ComplaintResponseDto> CreateAsync(ComplaintCreateDto complaintCreateDto)
        {
            return await CreateComplaintAsync(complaintCreateDto);
        }

        // Assignment methods
        public async Task<ComplaintAssignmentResponseDto?> AssignComplaintAsync(int complaintId, ComplaintAssignmentCreateDto assignmentDto, int assignedByUserId)
        {
            // Check if complaint exists
            var complaint = await _complaintRepository.GetByIdAsync(complaintId);
            if (complaint == null) return null;

            // Get the user who is assigning
            var assigningUser = await _userRepository.GetByIdAsync(assignedByUserId);
            if (assigningUser == null) return null;

            // Validate group assignment for Deputy
            if (assignmentDto.AssignedToGroupId.HasValue)
            {
                var group = await _groupRepository.GetByIdAsync(assignmentDto.AssignedToGroupId.Value);
                if (group == null)
                    throw new ArgumentException("Invalid group ID");

                // Check if the group belongs to the deputy's department
                if (assigningUser.Role?.RoleName == "Deputy" && group.DepartmentId != assigningUser.DepartmentId)
                    throw new UnauthorizedAccessException("Deputy can only assign to groups within their department");
            }

            // Create assignment
            var assignment = new ComplaintAssignment
            {
                ComplaintId = complaintId,
                AssignedByUserId = assignedByUserId,
                AssignedToDeptId = assignmentDto.AssignedToDeptId,
                AssignedToGroupId = assignmentDto.AssignedToGroupId,
                AssignedToUserId = assignmentDto.AssignedToUserId,
                TargetDate = assignmentDto.TargetDate,
                Status = assignmentDto.Status,
                AssignedDate = DateTime.UtcNow,
                IsActive = true
            };

            var createdAssignment = await _complaintRepository.CreateAssignmentAsync(assignment);

            // Update complaint status based on assignment type
            string newStatus;
            if (assignmentDto.AssignedToGroupId.HasValue)
            {
                newStatus = "Assigned to Committee";
            }
            else
            {
                newStatus = "Assigned to Department";
            }
            await _complaintRepository.UpdateStatusAsync(complaintId, newStatus, assignedByUserId);

            // Create log entry
            var logEntry = new ComplaintLog
            {
                ComplaintId = complaintId,
                UserId = assignedByUserId,
                Action = "Assignment Created",
                Notes = assignmentDto.Notes,
                PreviousStatus = complaint.CurrentStatus,
                NewStatus = newStatus,
                RelatedAssignmentId = createdAssignment.AssignmentId,
                CreatedByUserId = assignedByUserId,
                Timestamp = DateTime.UtcNow
            };
            await _complaintRepository.CreateLogAsync(logEntry);

            return MapAssignmentToResponseDto(createdAssignment);
        }

        public async Task<IEnumerable<ComplaintAssignmentResponseDto>> GetComplaintAssignmentsAsync(int complaintId)
        {
            var assignments = await _complaintRepository.GetAssignmentsByComplaintIdAsync(complaintId);
            return assignments.Select(MapAssignmentToResponseDto);
        }

        // Status update with logging
        public async Task<ComplaintResponseDto?> UpdateComplaintStatusAsync(int id, ComplaintStatusUpdateDto statusUpdateDto, int updatedByUserId)
        {
            var complaint = await _complaintRepository.GetByIdAsync(id);
            if (complaint == null) return null;

            var previousStatus = complaint.CurrentStatus;
            
            // Update status
            var updatedComplaint = await _complaintRepository.UpdateStatusAsync(id, statusUpdateDto.NewStatus, updatedByUserId);
            if (updatedComplaint == null) return null;

            // Create log entry
            var logEntry = new ComplaintLog
            {
                ComplaintId = id,
                UserId = updatedByUserId,
                Action = "Status Updated",
                Notes = statusUpdateDto.Notes,
                PreviousStatus = previousStatus,
                NewStatus = statusUpdateDto.NewStatus,
                CreatedByUserId = updatedByUserId,
                Timestamp = DateTime.UtcNow
            };
            await _complaintRepository.CreateLogAsync(logEntry);

            return MapToResponseDto(updatedComplaint);
        }

        // Log methods
        public async Task<IEnumerable<ComplaintLogResponseDto>> GetComplaintLogsAsync(int complaintId)
        {
            var logs = await _complaintRepository.GetLogsByComplaintIdAsync(complaintId);
            return logs.Select(MapLogToResponseDto);
        }

        // Helper methods for mapping
        private ComplaintAssignmentResponseDto MapAssignmentToResponseDto(ComplaintAssignment assignment)
        {
            return new ComplaintAssignmentResponseDto
            {
                AssignmentId = assignment.AssignmentId,
                ComplaintId = assignment.ComplaintId,
                ComplaintSubject = assignment.Complaint?.Subject ?? "",
                AssignedByUserId = assignment.AssignedByUserId,
                AssignedByUserName = assignment.AssignedByUser?.Name + " " + assignment.AssignedByUser?.Lastname ?? "",
                AssignedToDeptId = assignment.AssignedToDeptId,
                AssignedToDeptName = assignment.AssignedToDepartment?.DepartmentName,
                AssignedToGroupId = assignment.AssignedToGroupId,
                AssignedToGroupName = assignment.AssignedToGroup?.Name,
                AssignedToUserId = assignment.AssignedToUserId,
                AssignedToUserName = assignment.AssignedToUser?.Name + " " + assignment.AssignedToUser?.Lastname,
                TargetDate = assignment.TargetDate,
                Status = assignment.Status,
                AssignedDate = assignment.AssignedDate,
                ReceivedDate = assignment.ReceivedDate,
                CompletedDate = assignment.CompletedDate,
                ClosedDate = assignment.ClosedDate,
                IsActive = assignment.IsActive
            };
        }

        private ComplaintLogResponseDto MapLogToResponseDto(ComplaintLog log)
        {
            return new ComplaintLogResponseDto
            {
                LogId = log.LogId,
                ComplaintId = log.ComplaintId,
                UserId = log.UserId,
                UserName = log.User?.Name + " " + log.User?.Lastname,
                DepartmentId = log.DepartmentId,
                DepartmentName = log.Department?.DepartmentName,
                Action = log.Action,
                Notes = log.Notes,
                PreviousStatus = log.PreviousStatus,
                NewStatus = log.NewStatus,
                Timestamp = log.Timestamp,
                Metadata = log.Metadata,
                RelatedAssignmentId = log.RelatedAssignmentId,
                CreatedByUserId = log.CreatedByUserId,
                CreatedByUserName = log.CreatedByUser?.Name + " " + log.CreatedByUser?.Lastname
            };
        }

        // Dashboard methods
        public async Task<DashboardStatsDto> GetDashboardStatsAsync(int userId, string roleName, int? departmentId, int? groupId)
        {
            // สำหรับ Staff หากไม่ได้ระบุ groupId ให้หาจาก MemberRepository
            if (roleName == "Staff" && !groupId.HasValue)
            {
                var member = await _memberRepository.GetByUserIdAsync(userId);
                var userMember = member.FirstOrDefault();
                if (userMember != null)
                {
                    groupId = userMember.GroupId;
                }
            }

            // Get filtered complaints for this user
            var userComplaints = await _complaintRepository.GetByUserRoleAsync(userId, roleName, departmentId, groupId);
            var complaintsList = userComplaints.ToList();

            // Calculate stats from filtered complaints
            var totalComplaints = complaintsList.Count;
            var pendingComplaints = complaintsList.Count(c =>
                c.CurrentStatus == "New" ||
                c.CurrentStatus == "Assigned to Department" ||
                c.CurrentStatus == "Assigned to Committee" ||
                c.CurrentStatus == "In Progress" ||
                c.CurrentStatus == "Pending Deputy Dean Approval" ||
                c.CurrentStatus == "Pending Dean Approval");
            var resolvedComplaints = complaintsList.Count(c => c.CurrentStatus == "Completed");

            // Total users and departments are always the same for all roles
            var totalUsers = await _userRepository.GetTotalCountAsync();
            var totalDepartments = await _departmentRepository.GetTotalCountAsync();

            // Calculate average response time from filtered complaints
            var completedComplaints = complaintsList.Where(c => c.UpdatedAt.HasValue && c.CurrentStatus == "Completed").ToList();
            var averageResponseTime = 0.0;
            var displayValue = 0.0;
            var unit = "ชั่วโมง";
            var displayText = "0 ชั่วโมง";

            if (completedComplaints.Any())
            {
                var totalHours = completedComplaints.Sum(c => (c.UpdatedAt!.Value - c.SubmissionDate).TotalHours);
                averageResponseTime = totalHours / completedComplaints.Count;
                displayValue = Math.Round(averageResponseTime, 1);

                // ถ้าเกิน 24 ชั่วโมง แสดงเป็นวัน
                if (averageResponseTime >= 24)
                {
                    displayValue = Math.Round(averageResponseTime / 24, 1);
                    unit = "วัน";
                }

                displayText = $"{displayValue} {unit}";
            }

            return new DashboardStatsDto
            {
                TotalComplaints = totalComplaints,
                PendingComplaints = pendingComplaints,
                ResolvedComplaints = resolvedComplaints,
                TotalUsers = totalUsers,
                TotalDepartments = totalDepartments,
                AverageResponseTimeValue = Math.Round(averageResponseTime, 1),
                AverageResponseTimeUnit = unit,
                AverageResponseTimeDisplay = displayText
            };
        }

        public async Task<IEnumerable<RecentComplaintDto>> GetRecentComplaintsForDashboardAsync(int count, int userId, string roleName, int? departmentId, int? groupId)
        {
            // สำหรับ Staff หากไม่ได้ระบุ groupId ให้หาจาก MemberRepository
            if (roleName == "Staff" && !groupId.HasValue)
            {
                var member = await _memberRepository.GetByUserIdAsync(userId);
                var userMember = member.FirstOrDefault();
                if (userMember != null)
                {
                    groupId = userMember.GroupId;
                }
            }

            // Get filtered complaints for this user, then take the most recent ones
            var userComplaints = await _complaintRepository.GetByUserRoleAsync(userId, roleName, departmentId, groupId);
            var recentComplaints = userComplaints
                .OrderByDescending(c => c.SubmissionDate)
                .Take(count);

            return recentComplaints.Select(c => new RecentComplaintDto
            {
                ComplaintId = c.ComplaintId,
                Subject = c.Subject,
                CurrentStatus = c.CurrentStatus,
                DepartmentName = c.ComplaintAssignments?
                    .OrderByDescending(ca => ca.AssignedDate)
                    .FirstOrDefault()?.AssignedToDepartment?.DepartmentName,
                SubmissionDate = c.SubmissionDate,
                TicketId = c.TicketId
            });
        }
    }
}