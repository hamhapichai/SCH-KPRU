namespace SchKpruApi.Options;

public class MailSettings
{
    public string Host { get; set; } = "smtp.gmail.com";
    public int Port { get; set; } = 587;
    public string Username { get; set; } = string.Empty;

    /// <summary>
    /// Gmail App Password (สร้างได้ที่ https://myaccount.google.com/apppasswords)
    /// ต้องเปิด 2-Step Verification ก่อน
    /// </summary>
    public string Password { get; set; } = string.Empty;

    public string FromEmail { get; set; } = string.Empty;
    public string FromName { get; set; } = "ระบบรับเรื่องร้องเรียน SCH-KPRU";

    /// <summary>
    /// URL หน้าเว็บสำหรับใช้ใน email template (เช่น https://sch-kpru.example.com)
    /// </summary>
    public string AppUrl { get; set; } = "http://localhost:3000";
}
