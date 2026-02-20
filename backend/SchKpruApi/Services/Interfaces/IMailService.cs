namespace SchKpruApi.Services.Interfaces;

public interface IMailService
{
    /// <summary>ส่งอีเมลแบบกำหนดเองพร้อม HTML body</summary>
    Task SendEmailAsync(string to, string subject, string htmlBody);

    /// <summary>ส่งอีเมลยืนยันการรับเรื่องร้องเรียนให้ผู้ร้องเรียน</summary>
    Task SendComplaintConfirmationAsync(string toEmail, string contactName, string subject,
        string ticketId, DateTime submissionDate);

    /// <summary>ส่งอีเมลแจ้งเรื่องร้องเรียนได้รับการดำเนินการแล้ว</summary>
    Task SendCompletedComplaintEmailAsync(string toEmail, string contactName, string subject,
        string ticketId, string remark);

    /// <summary>ส่งอีเมลต้อนรับเมื่อสร้างบัญชีใหม่</summary>
    Task SendWelcomeEmailAsync(string toEmail, string fullName, string username);

    /// <summary>ส่งอีเมลแจ้งเจ้าหน้าที่เมื่อมีเรื่องร้องเรียนใหม่</summary>
    Task SendNewComplaintNotificationAsync(string toEmail, string staffName, string subject,
        int complaintId, string ticketId, bool isUrgent);

    /// <summary>ส่งอีเมลแจ้งเตือน deadline ให้ผู้ที่ถูก assign</summary>
    Task SendDeadlineReminderAsync(string toEmail, string staffName, string subject,
        int complaintId, string ticketId, DateTime deadlineDate);
}
