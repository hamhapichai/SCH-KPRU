using Microsoft.Extensions.Options;
using SchKpruApi.DTOs;
using SchKpruApi.Services.Interfaces;

namespace SchKpruApi.Services;

public class WebhookService : IWebhookService
{
    private readonly IWebhookQueueService _webhookQueue;
    private readonly WebhookOptions _webhookOptions;
    private readonly ILogger<WebhookService> _logger;

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
                ComplaintId = complaint.ComplaintId,
                TicketId = complaint.TicketId,
                ContactName = complaint.ContactName,
                ContactEmail = complaint.ContactEmail,
                ContactPhone = complaint.ContactPhone,
                Subject = complaint.Subject,
                Message = complaint.Message,
                IsAnonymous = complaint.IsAnonymous,
                CurrentStatus = complaint.CurrentStatus,
                SubmissionDate = complaint.SubmissionDate,
                Event = "complaint.created",
                Timestamp = DateTime.UtcNow
            };

            var webhookUrl = _webhookOptions.GetComplaintNewUrl();
            await _webhookQueue.QueueWebhookAsync(webhookUrl, (object)payload);

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