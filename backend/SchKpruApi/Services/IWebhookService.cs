using SchKpruApi.DTOs;

namespace SchKpruApi.Services
{
    public interface IWebhookService
    {
        Task SendComplaintCreatedWebhookAsync(ComplaintResponseDto complaint);
    }
}