using SchKpruApi.Services.Interfaces;

namespace SchKpruApi.Services;

public class MailService : IMailService
{
    public Task SendEmailAsync(string to, string subject, string body)
    {
        // Implement your email sending logic here using an email service provider (e.g., SMTP, SendGrid, etc.)
        // For demonstration purposes, we'll just simulate sending an email.
        Console.WriteLine($"Sending email to: {to}");
        Console.WriteLine($"Subject: {subject}");
        Console.WriteLine($"Body: {body}");
        
        return Task.CompletedTask;
    }
}