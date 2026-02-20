using System.Collections.Concurrent;
using System.Text;
using System.Text.Json;
using SchKpruApi.Services.Interfaces;

namespace SchKpruApi.Services;

public class WebhookJob
{
    public string Url { get; set; } = string.Empty;
    public object Payload { get; set; } = new();
    public DateTime QueuedAt { get; set; } = DateTime.UtcNow;
    public int RetryCount { get; set; }
    public int MaxRetries { get; set; } = 3;
}

public class WebhookQueueService : IWebhookQueueService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<WebhookQueueService> _logger;
    private readonly ConcurrentQueue<WebhookJob> _queue = new();

    public WebhookQueueService(
        IHttpClientFactory httpClientFactory,
        ILogger<WebhookQueueService> logger)
    {
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    public Task QueueWebhookAsync(string url, object payload)
    {
        var job = new WebhookJob
        {
            Url = url,
            Payload = payload,
            QueuedAt = DateTime.UtcNow
        };

        _queue.Enqueue(job);
        _logger.LogInformation("Webhook job queued: {Url}", url);

        return Task.CompletedTask;
    }

    public async Task ProcessQueueAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Webhook Queue Service started processing");

        while (!stoppingToken.IsCancellationRequested)
            try
            {
                if (_queue.TryDequeue(out var job))
                    await ProcessWebhookJobAsync(job);
                else
                    // No jobs in queue, wait a bit
                    await Task.Delay(1000, stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing webhook queue");
                await Task.Delay(5000, stoppingToken);
            }
    }

    private async Task ProcessWebhookJobAsync(WebhookJob job)
    {
        try
        {
            _logger.LogInformation("Processing webhook job: {Url}", job.Url);

            var jsonPayload = JsonSerializer.Serialize(job.Payload);
            var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

            // Set timeout for webhook requests
            using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(30));
            using var httpClient = _httpClientFactory.CreateClient();

            var response = await httpClient.PostAsync(job.Url, content, cts.Token);

            if (response.IsSuccessStatusCode)
            {
                _logger.LogInformation("Webhook sent successfully: {Url}, Status: {Status}",
                    job.Url, response.StatusCode);
            }
            else
            {
                _logger.LogWarning("Webhook failed: {Url}, Status: {Status}, Response: {Response}",
                    job.Url, response.StatusCode, await response.Content.ReadAsStringAsync());

                // Retry if not successful
                await RetryWebhookJobAsync(job);
            }
        }
        catch (OperationCanceledException)
        {
            _logger.LogWarning("Webhook request timed out: {Url}", job.Url);
            await RetryWebhookJobAsync(job);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending webhook: {Url}", job.Url);
            await RetryWebhookJobAsync(job);
        }
    }

    private async Task RetryWebhookJobAsync(WebhookJob job)
    {
        job.RetryCount++;

        if (job.RetryCount <= job.MaxRetries)
        {
            _logger.LogInformation("Retrying webhook job: {Url}, Attempt: {Retry}/{Max}",
                job.Url, job.RetryCount, job.MaxRetries);

            // Wait before retry (exponential backoff)
            await Task.Delay(TimeSpan.FromSeconds(Math.Pow(2, job.RetryCount)));
            _queue.Enqueue(job);
        }
        else
        {
            _logger.LogError("Webhook job failed after {MaxRetries} retries: {Url}",
                job.MaxRetries, job.Url);
        }
    }
}