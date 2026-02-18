using SchKpruApi.DTOs;

namespace SchKpruApi.Services.Interfaces;

public interface IWebhookService
{
    Task SendComplaintCreatedWebhookAsync(ComplaintResponseDto complaint);
}