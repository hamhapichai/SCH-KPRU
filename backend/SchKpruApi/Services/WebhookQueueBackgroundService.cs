using SchKpruApi.Services.Interfaces;

namespace SchKpruApi.Services;

public class WebhookQueueBackgroundService : BackgroundService
{
    private readonly ILogger<WebhookQueueBackgroundService> _logger;
    private readonly IWebhookQueueService _webhookQueueService;

    public WebhookQueueBackgroundService(
        IWebhookQueueService webhookQueueService,
        ILogger<WebhookQueueBackgroundService> logger)
    {
        _webhookQueueService = webhookQueueService;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Webhook Queue Background Service started");

        // Start processing the queue
        await _webhookQueueService.ProcessQueueAsync(stoppingToken);
    }
}