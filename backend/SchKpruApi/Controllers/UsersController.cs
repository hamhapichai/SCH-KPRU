using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchKpruApi.DTOs;
using SchKpruApi.Services.Interfaces;

namespace SchKpruApi.Controllers;

[ApiController]
[Route("api/admin/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserResponseDto>>> GetAllUsers()
    {
        try
        {
            var users = await _userService.GetAllUsersAsync();
            return Ok(users);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<UserResponseDto>> GetUser(int id)
    {
        try
        {
            var user = await _userService.GetUserByIdAsync(id);
            if (user == null)
                return NotFound($"User with ID {id} not found");

            return Ok(user);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpGet("username/{username}")]
    public async Task<ActionResult<UserResponseDto>> GetUserByUsername(string username)
    {
        try
        {
            var user = await _userService.GetUserByUsernameAsync(username);
            if (user == null)
                return NotFound($"User with username {username} not found");

            return Ok(user);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpPost]
    public async Task<ActionResult<UserResponseDto>> CreateUser([FromBody] UserCreateDto userCreateDto)
    {
        try
        {
            var currentUserIdClaim = User.FindFirst("UserId")?.Value;
            if (!int.TryParse(currentUserIdClaim, out var currentUserId))
                return Unauthorized();

            var user = await _userService.CreateUserAsync(userCreateDto, currentUserId);
            return CreatedAtAction(nameof(GetUser), new { id = user.UserId }, user);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<UserResponseDto>> UpdateUser(int id, [FromBody] UserUpdateDto userUpdateDto)
    {
        try
        {
            var currentUserIdClaim = User.FindFirst("UserId")?.Value;
            if (!int.TryParse(currentUserIdClaim, out var currentUserId))
                return Unauthorized();

            var user = await _userService.UpdateUserAsync(id, userUpdateDto, currentUserId);
            if (user == null)
                return NotFound($"User with ID {id} not found");

            return Ok(user);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteUser(int id)
    {
        try
        {
            var result = await _userService.DeleteUserAsync(id);
            if (!result)
                return NotFound($"User with ID {id} not found");

            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpPost("{id}/change-password")]
    public async Task<ActionResult> ChangePassword(int id, [FromBody] ChangePasswordDto changePasswordDto)
    {
        try
        {
            var currentUserIdClaim = User.FindFirst("UserId")?.Value;
            if (!int.TryParse(currentUserIdClaim, out var currentUserId))
                return Unauthorized();

            // Users can only change their own password unless they are admin
            var currentUserRole = User.FindFirst(ClaimTypes.Role)?.Value;
            if (currentUserId != id && currentUserRole != "Admin")
                return Forbid("You can only change your own password");

            var result = await _userService.ChangePasswordAsync(id, changePasswordDto);
            if (!result)
                return BadRequest("Invalid current password or user not found");

            return Ok(new { message = "Password changed successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpPatch("{id}/status")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> UpdateUserStatus(int id, [FromBody] UpdateUserStatusDto statusDto)
    {
        try
        {
            var result = await _userService.UpdateUserStatusAsync(id, statusDto.IsActive);
            if (!result)
                return NotFound($"User with ID {id} not found");

            return Ok(new { message = "User status updated successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpPost("{id}/reset-password")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> ResetPassword(int id)
    {
        try
        {
            var result = await _userService.ResetPasswordAsync(id);
            if (!result)
                return NotFound($"User with ID {id} not found");

            return Ok(new { message = "Password reset successfully. New password sent to user email." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpGet("department/{departmentId}")]
    public async Task<ActionResult<IEnumerable<UserResponseDto>>> GetUsersByDepartment(int departmentId)
    {
        try
        {
            var users = await _userService.GetUsersByDepartmentAsync(departmentId);
            return Ok(users);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpGet("role/{roleId}")]
    public async Task<ActionResult<IEnumerable<UserResponseDto>>> GetUsersByRole(int roleId)
    {
        try
        {
            var users = await _userService.GetUsersByRoleAsync(roleId);
            return Ok(users);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }
}