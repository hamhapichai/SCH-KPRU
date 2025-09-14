using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Cors;
using SchKpruApi.DTOs;
using SchKpruApi.Services;

namespace SchKpruApi.Controllers
{
    [ApiController]
    [Route("api/admin/[controller]")]
    [EnableCors("AllowAll")]
    public class AISuggestionsController : ControllerBase
    {
        private readonly IAISuggestionService _aiSuggestionService;

        public AISuggestionsController(IAISuggestionService aiSuggestionService)
        {
            _aiSuggestionService = aiSuggestionService;
        }

        [HttpPost("callback")]
        public async Task<ActionResult<AISuggestionResponseDto>> CreateAISuggestion([FromBody] AISuggestionCreateDto dto)
        {
            try
            {
                var aiSuggestion = await _aiSuggestionService.CreateAsync(dto);
                return Ok(aiSuggestion);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("complaint/{complaintId}")]
        public async Task<ActionResult<AISuggestionResponseDto>> GetAISuggestionByComplaintId(int complaintId)
        {
            try
            {
                var aiSuggestion = await _aiSuggestionService.GetByComplaintIdAsync(complaintId);
                if (aiSuggestion == null)
                {
                    return NotFound(new { message = "ไม่พบคำแนะนำ AI สำหรับเรื่องร้องเรียนนี้" });
                }
                return Ok(aiSuggestion);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<AISuggestionResponseDto>>> GetAllAISuggestions()
        {
            try
            {
                var aiSuggestions = await _aiSuggestionService.GetAllAsync();
                return Ok(aiSuggestions);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}