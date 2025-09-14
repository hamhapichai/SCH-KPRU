using Microsoft.Extensions.Hosting;

namespace SchKpruApi.Services
{
    public class WebhookQueueBackgroundService : BackgroundService
    {
        private readonly IWebhookQueueService _webhookQueueService;
        private readonly ILogger<WebhookQueueBackgroundService> _logger;

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
}