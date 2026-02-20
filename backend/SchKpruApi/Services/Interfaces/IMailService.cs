namespace SchKpruApi.Services.Interfaces;

public interface IMailService
{
    Task SendEmailAsync(string to, string subject, string body);
}