namespace SchKpruApi.Services;

/// <summary>
/// Configuration options for webhook integration with N8n
/// Used for sending complaint notifications to N8n workflows for AI processing
/// </summary>
public class WebhookOptions
{
    /// <summary>
    /// Enable or disable webhook functionality
    /// </summary>
    public bool Enabled { get; set; } = true;

    /// <summary>
    /// Base URL of the N8n instance
    /// </summary>
    public string N8nBaseUrl { get; set; } = string.Empty;

    /// <summary>
    /// Path for new complaint webhook endpoint
    /// </summary>
    public string ComplaintNewPath { get; set; } = "/webhook/complaint/new";

    /// <summary>
    /// Path for AI rewrite formal text webhook endpoint (synchronous)
    /// </summary>
    public string RewriteFormalPath { get; set; } = "/webhook/text/rewrite-formal";

    /// <summary>
    /// Gets the full URL for the complaint new webhook
    /// </summary>
    public string GetComplaintNewUrl()
    {
        return $"{N8nBaseUrl.TrimEnd('/')}{ComplaintNewPath}";
    }

    /// <summary>
    /// Gets the full URL for the AI rewrite formal webhook
    /// </summary>
    public string GetRewriteFormalUrl()
    {
        return $"{N8nBaseUrl.TrimEnd('/')}{RewriteFormalPath}";
    }
}