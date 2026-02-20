using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SchKpruApi.Data;

namespace SchKpruApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<HealthController> _logger;

    public HealthController(ApplicationDbContext context, ILogger<HealthController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        try
        {
            var healthCheck = new
            {
                status = "healthy",
                timestamp = DateTime.UtcNow,
                service = "sch-kpru-backend",
                version = "1.0.0",
                environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production",
                uptime = TimeSpan.FromMilliseconds(Environment.TickCount64),
                database = await CheckDatabaseHealth()
            };

            return Ok(healthCheck);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Health check failed");

            var unhealthyResponse = new
            {
                status = "unhealthy",
                timestamp = DateTime.UtcNow,
                error = "Health check failed"
            };

            return StatusCode(500, unhealthyResponse);
        }
    }

    [HttpGet("detailed")]
    public async Task<IActionResult> GetDetailed()
    {
        try
        {
            var detailed = new
            {
                status = "healthy",
                timestamp = DateTime.UtcNow,
                service = "sch-kpru-backend",
                version = "1.0.0",
                environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production",
                uptime = TimeSpan.FromMilliseconds(Environment.TickCount64),
                database = await CheckDatabaseHealth(),
                dependencies = new
                {
                    database = await CheckDatabaseHealth(),
                    n8n = CheckN8nHealth()
                },
                system = new
                {
                    machineName = Environment.MachineName,
                    processorCount = Environment.ProcessorCount,
                    workingSet = Environment.WorkingSet,
                    gcMemory = GC.GetTotalMemory(false)
                }
            };

            return Ok(detailed);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Detailed health check failed");
            return StatusCode(500, new { status = "unhealthy", error = ex.Message });
        }
    }

    private async Task<object> CheckDatabaseHealth()
    {
        try
        {
            // Simple database connectivity test
            var canConnect = await _context.Database.CanConnectAsync();

            if (canConnect)
            {
                // Get some basic stats
                var userCount = await _context.Users.CountAsync();

                return new
                {
                    status = "healthy",
                    canConnect = true,
                    userCount,
                    connectionString =
                        _context.Database.GetConnectionString()?.Split(';')[0] // Only show server info
                };
            }

            return new
            {
                status = "unhealthy",
                canConnect = false,
                error = "Cannot connect to database"
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Database health check failed");
            return new
            {
                status = "unhealthy",
                canConnect = false,
                error = ex.Message
            };
        }
    }

    private object CheckN8nHealth()
    {
        try
        {
            var n8nBaseUrl = Environment.GetEnvironmentVariable("WebhookOptions__N8nBaseUrl");

            return new
            {
                status = !string.IsNullOrEmpty(n8nBaseUrl) ? "configured" : "not configured",
                baseUrl = n8nBaseUrl ?? "not set"
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "N8n health check failed");
            return new
            {
                status = "error",
                error = ex.Message
            };
        }
    }
}