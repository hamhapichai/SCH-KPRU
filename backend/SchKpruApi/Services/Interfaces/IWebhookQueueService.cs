namespace SchKpruApi.Services.Interfaces;

public interface IWebhookQueueService
{
    Task QueueWebhookAsync(string url, object payload);
    Task ProcessQueueAsync(CancellationToken stoppingToken);
}