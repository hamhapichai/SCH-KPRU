using SchKpruApi.DTOs;

namespace SchKpruApi.Services.Interfaces;

public interface IAISuggestionService
{
    Task<AISuggestionResponseDto> CreateAsync(AISuggestionCreateDto dto);
    Task<AISuggestionResponseDto?> GetByComplaintIdAsync(int complaintId);
    Task<IEnumerable<AISuggestionResponseDto>> GetAllAsync();
}