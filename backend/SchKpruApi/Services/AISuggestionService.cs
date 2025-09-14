using SchKpruApi.DTOs;
using SchKpruApi.Models;
using SchKpruApi.Repositories;

namespace SchKpruApi.Services
{
    public interface IAISuggestionService
    {
        Task<AISuggestionResponseDto> CreateAsync(AISuggestionCreateDto dto);
        Task<AISuggestionResponseDto?> GetByComplaintIdAsync(int complaintId);
        Task<IEnumerable<AISuggestionResponseDto>> GetAllAsync();
    }

    public class AISuggestionService : IAISuggestionService
    {
        private readonly IAISuggestionRepository _aiSuggestionRepository;

        public AISuggestionService(IAISuggestionRepository aiSuggestionRepository)
        {
            _aiSuggestionRepository = aiSuggestionRepository;
        }

        public async Task<AISuggestionResponseDto> CreateAsync(AISuggestionCreateDto dto)
        {
            var aiSuggestion = new AISuggestion
            {
                ComplaintId = dto.ComplaintId,
                SuggestedDeptId = dto.SuggestedDeptId,
                SuggestedCategory = dto.SuggestedCategory,
                SummarizedByAI = dto.SummarizedByAI,
                ConfidenceScore = dto.ConfidenceScore,
                SuggestedAt = DateTime.UtcNow,
                N8nWorkflowId = dto.N8nWorkflowId
            };

            var createdSuggestion = await _aiSuggestionRepository.CreateAsync(aiSuggestion);

            return new AISuggestionResponseDto
            {
                AISuggestionId = createdSuggestion.AISuggestionId,
                ComplaintId = createdSuggestion.ComplaintId,
                SuggestedDeptId = createdSuggestion.SuggestedDeptId,
                SuggestedDepartmentName = createdSuggestion.SuggestedDepartment?.DepartmentName,
                SuggestedCategory = createdSuggestion.SuggestedCategory,
                SummarizedByAI = createdSuggestion.SummarizedByAI,
                ConfidenceScore = createdSuggestion.ConfidenceScore,
                SuggestedAt = createdSuggestion.SuggestedAt,
                N8nWorkflowId = createdSuggestion.N8nWorkflowId
            };
        }

        public async Task<AISuggestionResponseDto?> GetByComplaintIdAsync(int complaintId)
        {
            var aiSuggestion = await _aiSuggestionRepository.GetByComplaintIdAsync(complaintId);
            if (aiSuggestion == null) return null;

            return new AISuggestionResponseDto
            {
                AISuggestionId = aiSuggestion.AISuggestionId,
                ComplaintId = aiSuggestion.ComplaintId,
                SuggestedDeptId = aiSuggestion.SuggestedDeptId,
                SuggestedDepartmentName = aiSuggestion.SuggestedDepartment?.DepartmentName,
                SuggestedCategory = aiSuggestion.SuggestedCategory,
                SummarizedByAI = aiSuggestion.SummarizedByAI,
                ConfidenceScore = aiSuggestion.ConfidenceScore,
                SuggestedAt = aiSuggestion.SuggestedAt,
                N8nWorkflowId = aiSuggestion.N8nWorkflowId
            };
        }

        public async Task<IEnumerable<AISuggestionResponseDto>> GetAllAsync()
        {
            var aiSuggestions = await _aiSuggestionRepository.GetAllAsync();
            return aiSuggestions.Select(ai => new AISuggestionResponseDto
            {
                AISuggestionId = ai.AISuggestionId,
                ComplaintId = ai.ComplaintId,
                SuggestedDeptId = ai.SuggestedDeptId,
                SuggestedDepartmentName = ai.SuggestedDepartment?.DepartmentName,
                SuggestedCategory = ai.SuggestedCategory,
                SummarizedByAI = ai.SummarizedByAI,
                ConfidenceScore = ai.ConfidenceScore,
                SuggestedAt = ai.SuggestedAt,
                N8nWorkflowId = ai.N8nWorkflowId
            });
        }
    }
}