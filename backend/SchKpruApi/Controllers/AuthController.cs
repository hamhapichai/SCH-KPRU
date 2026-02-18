using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchKpruApi.DTOs;
using System.Security.Claims;
using SchKpruApi.Services.Interfaces;

namespace SchKpruApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<ActionResult<LoginResponseDto>> Login([FromBody] LoginRequestDto loginRequest)
    {
        try
        {
            var result = await _authService.LoginAsync(loginRequest);
            if (result == null)
                return Unauthorized("Invalid username or password");

            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpPost("refresh")]
    [Authorize]
    public ActionResult<LoginResponseDto> RefreshToken()
    {
        try
        {
            var username = User.FindFirst(ClaimTypes.Name)?.Value;
            if (string.IsNullOrEmpty(username))
                return Unauthorized();

            // In a real implementation, you might want to validate the current token
            // and generate a new one with extended expiration
            return Ok("Token refresh functionality would be implemented here");
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpPost("logout")]
    [Authorize]
    public ActionResult Logout()
    {
        try
        {
            // In a real implementation, you might want to blacklist the token
            return Ok(new { message = "Logged out successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpGet("me")]
    [Authorize]
    public ActionResult GetCurrentUser()
    {
        try
        {
            var userIdClaim = User.FindFirst("UserId")?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
                return Unauthorized();

            var userInfo = new
            {
                UserId = userIdClaim,
                Username = User.FindFirst(ClaimTypes.Name)?.Value,
                Email = User.FindFirst(ClaimTypes.Email)?.Value,
                Role = User.FindFirst(ClaimTypes.Role)?.Value,
                Name = User.FindFirst("Name")?.Value,
                Lastname = User.FindFirst("Lastname")?.Value,
                DepartmentId = User.FindFirst("DepartmentId")?.Value
            };

            return Ok(userInfo);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }
}