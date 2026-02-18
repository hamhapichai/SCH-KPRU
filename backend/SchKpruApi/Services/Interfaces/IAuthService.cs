using SchKpruApi.DTOs;
using SchKpruApi.Models;

namespace SchKpruApi.Services.Interfaces;

public interface IAuthService
{
    Task<LoginResponseDto?> LoginAsync(LoginRequestDto loginRequest);
    string GenerateJwtToken(User user);
    Task<User?> ValidateUserAsync(string username, string password);
    string HashPassword(string password);
    bool VerifyPassword(string password, string hashedPassword);
}