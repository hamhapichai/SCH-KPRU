using SchKpruApi.DTOs;
using SchKpruApi.Models;
using SchKpruApi.Repositories;

namespace SchKpruApi.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly IRoleRepository _roleRepository;
        private readonly IDepartmentRepository _departmentRepository;
        private readonly IAuthService _authService;

        public UserService(
            IUserRepository userRepository,
            IRoleRepository roleRepository,
            IDepartmentRepository departmentRepository,
            IAuthService authService)
        {
            _userRepository = userRepository;
            _roleRepository = roleRepository;
            _departmentRepository = departmentRepository;
            _authService = authService;
        }

        public async Task<IEnumerable<UserResponseDto>> GetAllUsersAsync()
        {
            var users = await _userRepository.GetAllAsync();
            return users.Select(MapToResponseDto);
        }

        public async Task<UserResponseDto?> GetUserByIdAsync(int id)
        {
            var user = await _userRepository.GetByIdAsync(id);
            return user != null ? MapToResponseDto(user) : null;
        }

        public async Task<UserResponseDto?> GetUserByUsernameAsync(string username)
        {
            var user = await _userRepository.GetByUsernameAsync(username);
            return user != null ? MapToResponseDto(user) : null;
        }

        public async Task<UserResponseDto> CreateUserAsync(UserCreateDto userCreateDto, int createdByUserId)
        {
            // Validate username and email uniqueness
            if (await _userRepository.UsernameExistsAsync(userCreateDto.Username))
                throw new ArgumentException("Username already exists");

            if (await _userRepository.EmailExistsAsync(userCreateDto.Email))
                throw new ArgumentException("Email already exists");

            var user = new User
            {
                Username = userCreateDto.Username,
                PasswordHash = _authService.HashPassword(userCreateDto.Password),
                Email = userCreateDto.Email,
                Name = userCreateDto.Name,
                Lastname = userCreateDto.Lastname,
                Bio = userCreateDto.Bio,
                RoleId = userCreateDto.RoleId,
                DepartmentId = userCreateDto.DepartmentId,
                CreatedByUserId = createdByUserId,
                CreatedAt = DateTime.UtcNow
            };

            var createdUser = await _userRepository.CreateAsync(user);
            var userWithRelations = await _userRepository.GetByIdAsync(createdUser.UserId);
            return MapToResponseDto(userWithRelations!);
        }

        public async Task<UserResponseDto?> UpdateUserAsync(int id, UserUpdateDto userUpdateDto, int updatedByUserId)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null)
                return null;

            // Validate email uniqueness if changed
            if (!string.IsNullOrEmpty(userUpdateDto.Email) && 
                userUpdateDto.Email != user.Email &&
                await _userRepository.EmailExistsAsync(userUpdateDto.Email))
                throw new ArgumentException("Email already exists");

            // Update fields
            if (!string.IsNullOrEmpty(userUpdateDto.Email))
                user.Email = userUpdateDto.Email;
            if (!string.IsNullOrEmpty(userUpdateDto.Name))
                user.Name = userUpdateDto.Name;
            if (!string.IsNullOrEmpty(userUpdateDto.Lastname))
                user.Lastname = userUpdateDto.Lastname;
            if (userUpdateDto.Bio != null)
                user.Bio = userUpdateDto.Bio;
            if (userUpdateDto.RoleId.HasValue)
                user.RoleId = userUpdateDto.RoleId.Value;
            if (userUpdateDto.DepartmentId.HasValue)
                user.DepartmentId = userUpdateDto.DepartmentId.Value;
            if (userUpdateDto.IsActive.HasValue)
                user.IsActive = userUpdateDto.IsActive.Value;

            user.UpdatedByUserId = updatedByUserId;
            user.UpdatedAt = DateTime.UtcNow;

            await _userRepository.UpdateAsync(user);
            var updatedUser = await _userRepository.GetByIdAsync(id);
            return MapToResponseDto(updatedUser!);
        }

        public async Task<bool> DeleteUserAsync(int id)
        {
            return await _userRepository.DeleteAsync(id);
        }

        public async Task<bool> ChangePasswordAsync(int userId, ChangePasswordDto changePasswordDto)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
                return false;

            if (!_authService.VerifyPassword(changePasswordDto.CurrentPassword, user.PasswordHash))
                return false;

            user.PasswordHash = _authService.HashPassword(changePasswordDto.NewPassword);
            user.UpdatedAt = DateTime.UtcNow;

            await _userRepository.UpdateAsync(user);
            return true;
        }

        public async Task<IEnumerable<UserResponseDto>> GetUsersByDepartmentAsync(int departmentId)
        {
            var users = await _userRepository.GetByDepartmentAsync(departmentId);
            return users.Select(MapToResponseDto);
        }

        public async Task<IEnumerable<UserResponseDto>> GetUsersByRoleAsync(int roleId)
        {
            var users = await _userRepository.GetByRoleAsync(roleId);
            return users.Select(MapToResponseDto);
        }

        public async Task<bool> UpdateUserStatusAsync(int userId, bool isActive)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
                return false;

            user.IsActive = isActive;
            user.UpdatedAt = DateTime.UtcNow;

            await _userRepository.UpdateAsync(user);
            return true;
        }

        public async Task<bool> ResetPasswordAsync(int userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
                return false;

            // Generate a temporary password (you might want to use a more sophisticated approach)
            string tempPassword = GenerateTemporaryPassword();
            user.PasswordHash = _authService.HashPassword(tempPassword);
            user.UpdatedAt = DateTime.UtcNow;

            await _userRepository.UpdateAsync(user);

            // TODO: Send email with new password to user
            // For now, we'll just log it (remove in production)
            Console.WriteLine($"New password for user {user.Username}: {tempPassword}");

            return true;
        }

        private static string GenerateTemporaryPassword()
        {
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            var random = new Random();
            return new string(Enumerable.Repeat(chars, 8)
                .Select(s => s[random.Next(s.Length)]).ToArray());
        }

        private static UserResponseDto MapToResponseDto(User user)
        {
            return new UserResponseDto
            {
                UserId = user.UserId,
                Username = user.Username,
                Email = user.Email,
                Name = user.Name,
                Lastname = user.Lastname,
                Bio = user.Bio,
                RoleId = user.RoleId,
                RoleName = user.Role.RoleName,
                DepartmentId = user.DepartmentId,
                DepartmentName = user.Department?.DepartmentName,
                LastLoginAt = user.LastLoginAt,
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt
            };
        }
    }
}