using SchKpruApi.Models;

namespace SchKpruApi.Repositories.Interfaces;

public interface IComplaintAssignmentRepository : IGenericRepository<ComplaintAssignment>
{
    Task<IEnumerable<ComplaintAssignment>> GetByComplaintIdAsync(int complaintId);
    Task<IEnumerable<ComplaintAssignment>> GetByAssignedUserIdAsync(int userId);
    Task<IEnumerable<ComplaintAssignment>> GetByDepartmentIdAsync(int departmentId);
    Task<IEnumerable<ComplaintAssignment>> GetActiveAssignmentsAsync();
}