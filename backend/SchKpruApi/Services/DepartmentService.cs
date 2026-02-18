using SchKpruApi.Models;
using SchKpruApi.DTOs;
using SchKpruApi.Repositories.Interfaces;
using SchKpruApi.Services.Interfaces;

namespace SchKpruApi.Services;

public class DepartmentService : IDepartmentService
{
    private readonly IDepartmentRepository _departmentRepository;

    public DepartmentService(IDepartmentRepository departmentRepository)
    {
        _departmentRepository = departmentRepository;
    }

    public async Task<IEnumerable<DepartmentDto>> GetAllDepartmentsAsync()
    {
        var departments = await _departmentRepository.GetAllWithUserCountAsync();
        return departments.Select(d => d.ToDto());
    }

    public async Task<DepartmentDto?> GetDepartmentByIdAsync(int id)
    {
        var department = await _departmentRepository.GetByIdWithUserCountAsync(id);
        return department?.ToDto();
    }

    public async Task<IEnumerable<DepartmentDto>> GetActiveDepartmentsAsync()
    {
        var departments = await _departmentRepository.GetActiveWithUserCountAsync();
        return departments.Select(d => d.ToDto());
    }

    public async Task<Department> CreateDepartmentAsync(Department department, int createdByUserId)
    {
        department.CreatedByUserId = createdByUserId;
        department.CreatedAt = DateTime.UtcNow;
        return await _departmentRepository.CreateAsync(department);
    }

    public async Task<Department?> UpdateDepartmentAsync(int id, Department department, int updatedByUserId)
    {
        var existingDepartment = await _departmentRepository.GetByIdAsync(id);
        if (existingDepartment == null)
            return null;

        existingDepartment.DepartmentName = department.DepartmentName;
        existingDepartment.Description = department.Description;
        existingDepartment.IsAdminOrDeanDept = department.IsAdminOrDeanDept;
        existingDepartment.UpdatedByUserId = updatedByUserId;
        existingDepartment.UpdatedAt = DateTime.UtcNow;

        return await _departmentRepository.UpdateAsync(existingDepartment);
    }

    public async Task<bool> DeleteDepartmentAsync(int id, int updatedByUserId)
    {
        var department = await _departmentRepository.GetByIdAsync(id);
        if (department == null)
            return false;

        department.IsDeleted = true;
        department.UpdatedByUserId = updatedByUserId;
        department.UpdatedAt = DateTime.UtcNow;

        await _departmentRepository.UpdateAsync(department);
        return true;
    }
}