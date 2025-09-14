using SchKpruApi.DTOs;
using SchKpruApi.Models;

namespace SchKpruApi.Services
{
    public interface IDepartmentService
    {
        Task<IEnumerable<DepartmentDto>> GetAllDepartmentsAsync();
        Task<DepartmentDto?> GetDepartmentByIdAsync(int id);
        Task<IEnumerable<DepartmentDto>> GetActiveDepartmentsAsync();
        Task<Department> CreateDepartmentAsync(Department department, int createdByUserId);
        Task<Department?> UpdateDepartmentAsync(int id, Department department, int updatedByUserId);
        Task<bool> DeleteDepartmentAsync(int id, int updatedByUserId);
    }
}