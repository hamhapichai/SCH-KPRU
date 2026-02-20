using Microsoft.Extensions.Options;
using SchKpruApi.DTOs;
using SchKpruApi.Services.Interfaces;

namespace SchKpruApi.Services;

public class WebhookService : IWebhookService
{
    private readonly ILogger<WebhookService> _logger;
    private readonly WebhookOptions _webhookOptions;
    private readonly IWebhookQueueService _webhookQueue;

    public WebhookService(
        IWebhookQueueService webhookQueue,
        IOptions<WebhookOptions> webhookOptions,
        ILogger<WebhookService> logger)
    {
        _webhookQueue = webhookQueue;
        _webhookOptions = webhookOptions.Value;
        _logger = logger;
    }

    public async Task SendComplaintCreatedWebhookAsync(ComplaintResponseDto complaint)
    {
        if (!_webhookOptions.Enabled)
        {
            _logger.LogDebug("Webhooks are disabled, skipping complaint created webhook");
            return;
        }

        try
        {
            var payload = new
            {
                complaint.ComplaintId,
                complaint.TicketId,
                complaint.ContactName,
                complaint.ContactEmail,
                complaint.ContactPhone,
                complaint.Subject,
                complaint.Message,
                complaint.IsAnonymous,
                complaint.CurrentStatus,
                complaint.SubmissionDate,
                Event = "complaint.created",
                Timestamp = DateTime.UtcNow
            };

            var webhookUrl = _webhookOptions.GetComplaintNewUrl();
            await _webhookQueue.QueueWebhookAsync(webhookUrl, payload);

            _logger.LogInformation("Queued complaint created webhook for ComplaintId: {ComplaintId}",
                complaint.ComplaintId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to queue complaint created webhook for ComplaintId: {ComplaintId}",
                complaint.ComplaintId);
        }
    }
}