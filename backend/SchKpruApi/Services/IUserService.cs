using SchKpruApi.DTOs;

namespace SchKpruApi.Services
{
    public interface IUserService
    {
        Task<IEnumerable<UserResponseDto>> GetAllUsersAsync();
        Task<UserResponseDto?> GetUserByIdAsync(int id);
        Task<UserResponseDto?> GetUserByUsernameAsync(string username);
        Task<UserResponseDto> CreateUserAsync(UserCreateDto userCreateDto, int createdByUserId);
        Task<UserResponseDto?> UpdateUserAsync(int id, UserUpdateDto userUpdateDto, int updatedByUserId);
        Task<bool> DeleteUserAsync(int id);
        Task<bool> ChangePasswordAsync(int userId, ChangePasswordDto changePasswordDto);
        Task<IEnumerable<UserResponseDto>> GetUsersByDepartmentAsync(int departmentId);
        Task<IEnumerable<UserResponseDto>> GetUsersByRoleAsync(int roleId);
        Task<bool> UpdateUserStatusAsync(int userId, bool isActive);
        Task<bool> ResetPasswordAsync(int userId);
    }
}