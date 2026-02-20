using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;
using SchKpruApi.Options;
using SchKpruApi.Services.Interfaces;
using SchKpruApi.Templates;

namespace SchKpruApi.Services;

public class MailService : IMailService
{
    private readonly MailSettings _settings;
    private readonly ILogger<MailService> _logger;

    public MailService(IOptions<MailSettings> settings, ILogger<MailService> logger)
    {
        _settings = settings.Value;
        _logger = logger;
    }

    // ─── private helper ─────────────────────────────────────────────────────────

    private async Task SendAsync(string toEmail, string toName, string subject, string htmlBody)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(_settings.FromName, _settings.FromEmail));
        message.To.Add(new MailboxAddress(toName, toEmail));
        message.Subject = subject;
        message.Body = new BodyBuilder { HtmlBody = htmlBody }.ToMessageBody();

        using var client = new SmtpClient();
        try
        {
            // Gmail ใช้ STARTTLS บน port 587
            await client.ConnectAsync(_settings.Host, _settings.Port, SecureSocketOptions.StartTls);
            await client.AuthenticateAsync(_settings.Username, _settings.Password);
            await client.SendAsync(message);
            _logger.LogInformation("Email sent to {Email} | subject: {Subject}", toEmail, subject);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {Email} | subject: {Subject}", toEmail, subject);
            throw new InvalidOperationException($"Failed to send email to {toEmail} with subject '{subject}'", ex);
        }
        finally
        {
            await client.DisconnectAsync(true);
        }
    }

    // ─── interface implementation ───────────────────────────────────────────────

    public Task SendEmailAsync(string to, string subject, string htmlBody)
        => SendAsync(to, to, subject, htmlBody);

    public Task SendComplaintConfirmationAsync(
        string toEmail, string contactName, string subject,
        string ticketId, DateTime submissionDate)
    {
        var html = EmailTemplates.ComplaintConfirmation(
            contactName, subject, ticketId, submissionDate, _settings.AppUrl);

        return SendAsync(toEmail, contactName,
            $"[SCH-KPRU] ยืนยันการรับเรื่องร้องเรียน: {subject}", html);
    }

    public Task SendCompletedComplaintEmailAsync(
        string toEmail, string contactName, string subject,
        string ticketId, string remark)
    {
        var html = EmailTemplates.CompletedComplaint(
            contactName, subject, ticketId, remark, _settings.AppUrl);

        return SendAsync(toEmail, contactName,
            $"[SCH-KPRU] เรื่องร้องเรียนได้รับการดำเนินการแล้ว: {subject}", html);
    }

    public Task SendWelcomeEmailAsync(string toEmail, string fullName, string username)
    {
        var html = EmailTemplates.WelcomeEmail(fullName, username, _settings.AppUrl);
        return SendAsync(toEmail, fullName, "[SCH-KPRU] ยินดีต้อนรับสู่ระบบ", html);
    }

    public Task SendNewComplaintNotificationAsync(
        string toEmail, string staffName, string subject,
        int complaintId, string ticketId, bool isUrgent)
    {
        var html = EmailTemplates.NewComplaintNotification(
            staffName, subject, complaintId, ticketId, isUrgent, _settings.AppUrl);

        var subjectPrefix = isUrgent ? "🚨 [เร่งด่วน]" : "[ใหม่]";
        return SendAsync(toEmail, staffName,
            $"[SCH-KPRU] {subjectPrefix} เรื่องร้องเรียนใหม่: {subject}", html);
    }

    public Task SendDeadlineReminderAsync(
        string toEmail, string staffName, string subject,
        int complaintId, string ticketId, DateTime deadlineDate)
    {
        var html = EmailTemplates.DeadlineReminderEmail(
            staffName, subject, complaintId, ticketId, deadlineDate, _settings.AppUrl);

        return SendAsync(toEmail, staffName,
            $"[SCH-KPRU] ⏰ แจ้งเตือน: กรุณาดำเนินการเรื่องร้องเรียน '{subject}' ให้เสร็จสิ้นภายในวันนี้", html);
    }
}
