using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using SchKpruApi.Services;
using System.Text;
using System.Text.Json;

namespace SchKpruApi.Controllers;

[ApiController]
[Route("api/ai")]
[Authorize]
public class AIToolsController : ControllerBase
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly WebhookOptions _webhookOptions;
    private readonly ILogger<AIToolsController> _logger;

    public AIToolsController(
        IHttpClientFactory httpClientFactory,
        IOptions<WebhookOptions> webhookOptions,
        ILogger<AIToolsController> logger)
    {
        _httpClientFactory = httpClientFactory;
        _webhookOptions = webhookOptions.Value;
        _logger = logger;
    }

    /// <summary>
    /// Rewrite text to formal Thai language using AI via n8n webhook (synchronous)
    /// </summary>
    [HttpPost("rewrite-formal")]
    public async Task<IActionResult> RewriteFormal([FromBody] RewriteFormalRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Text))
            return BadRequest(new { message = "กรุณาใส่ข้อความที่ต้องการแปลง" });

        if (!_webhookOptions.Enabled)
            return StatusCode(503, new { message = "AI service is disabled" });

        try
        {
            var client = _httpClientFactory.CreateClient("n8n");
            var payload = new { text = request.Text };
            var json = JsonSerializer.Serialize(payload);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var url = _webhookOptions.GetRewriteFormalUrl();
            var response = await client.PostAsync(url, content);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("n8n rewrite webhook returned {StatusCode}", response.StatusCode);
                return StatusCode(502, new { message = "AI service ไม่ตอบสนอง กรุณาลองใหม่อีกครั้ง" });
            }

            var responseBody = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(responseBody);

            // n8n should return { "result": "..." }
            if (doc.RootElement.TryGetProperty("result", out var resultProp))
                return Ok(new { result = resultProp.GetString() });

            // Fallback: return raw body
            return Ok(new { result = responseBody });
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "Failed to call n8n rewrite webhook");
            return StatusCode(502, new { message = "เชื่อมต่อ AI service ไม่ได้ กรุณาลองใหม่อีกครั้ง" });
        }
        catch (TaskCanceledException)
        {
            return StatusCode(504, new { message = "AI service ใช้เวลานานเกินไป กรุณาลองใหม่อีกครั้ง" });
        }
    }
}

public record RewriteFormalRequest(string Text);
