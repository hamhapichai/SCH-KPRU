using Microsoft.EntityFrameworkCore;
using SchKpruApi.Data;
using SchKpruApi.Services.Interfaces;

namespace SchKpruApi.Services;

/// <summary>
/// Background service ที่รันทุกวันเวลา 09:00 น. (เวลาประเทศไทย UTC+7)
/// เพื่อตรวจสอบเรื่องร้องเรียนที่ครบกำหนด (target_date) และยังไม่ Completed
/// แล้วส่ง email แจ้งเตือนไปยังผู้ที่ถูก Assign ล่าสุด
/// </summary>
public class DeadlineReminderBackgroundService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<DeadlineReminderBackgroundService> _logger;

    // Bangkok timezone (UTC+7) — cross-platform support
    private static readonly TimeZoneInfo BangkokTz = GetBangkokTimeZone();

    public DeadlineReminderBackgroundService(
        IServiceScopeFactory scopeFactory,
        ILogger<DeadlineReminderBackgroundService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("DeadlineReminderBackgroundService started");

        while (!stoppingToken.IsCancellationRequested)
        {
            var delay = GetDelayUntilNextRun();
            _logger.LogInformation(
                "DeadlineReminder: next run in {Hours}h {Minutes}m (at 09:00 Bangkok time)",
                (int)delay.TotalHours, delay.Minutes);

            try
            {
                await Task.Delay(delay, stoppingToken);
            }
            catch (OperationCanceledException)
            {
                break;
            }

            if (!stoppingToken.IsCancellationRequested)
            {
                await SendDeadlineRemindersAsync();
            }
        }

        _logger.LogInformation("DeadlineReminderBackgroundService stopping");
    }

    // ────────────────────────────────────────────────────────────────────────────
    // Core logic
    // ────────────────────────────────────────────────────────────────────────────

    private async Task SendDeadlineRemindersAsync()
    {
        var todayBangkok = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, BangkokTz).Date;
        _logger.LogInformation("DeadlineReminder: running for Bangkok date {Date:dd/MM/yyyy}", todayBangkok);

        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var mailService = scope.ServiceProvider.GetRequiredService<IMailService>();

        // สถานะที่ถือว่า "เสร็จสิ้น/ปิดแล้ว" — ไม่ต้องส่งแจ้งเตือน
        var completedStatuses = new[] { "Completed", "Closed" };

        // ดึง assignment ทั้งหมดที่มี TargetDate และ complaint ยังไม่ complete
        var candidates = await db.ComplaintAssignments
            .Include(a => a.Complaint)
            .Where(a =>
                a.TargetDate != null &&
                a.IsActive &&
                !completedStatuses.Contains(a.Complaint.CurrentStatus))
            .ToListAsync();

        // กรองเฉพาะที่ deadline = วันนี้ (เวลาไทย)
        var dueToday = candidates
            .Where(a =>
            {
                var assignedBangkok = TimeZoneInfo.ConvertTimeFromUtc(a.AssignedDate, BangkokTz).Date;
                var deadline = assignedBangkok.AddDays(a.TargetDate!.Value);
                return deadline == todayBangkok;
            })
            .ToList();

        if (dueToday.Count == 0)
        {
            _logger.LogInformation("DeadlineReminder: no assignments due today");
            return;
        }

        // จัดกลุ่มตาม ComplaintId → เอาเฉพาะ assignment ล่าสุดของแต่ละเรื่อง
        var latestPerComplaint = dueToday
            .GroupBy(a => a.ComplaintId)
            .Select(g => g.OrderByDescending(a => a.AssignmentId).First())
            .ToList();

        _logger.LogInformation(
            "DeadlineReminder: {Count} complaint(s) are due today", latestPerComplaint.Count);

        foreach (var assignment in latestPerComplaint)
        {
            var complaint = assignment.Complaint;
            var assignedBangkok = TimeZoneInfo.ConvertTimeFromUtc(assignment.AssignedDate, BangkokTz).Date;
            var deadlineDate = assignedBangkok.AddDays(assignment.TargetDate!.Value);

            // รวบรวม recipients
            var recipients = await GetRecipientsAsync(db, assignment);

            if (recipients.Count == 0)
            {
                _logger.LogWarning(
                    "DeadlineReminder: no email recipients found for complaint {ComplaintId}", complaint.ComplaintId);
                continue;
            }

            foreach (var (email, name) in recipients)
            {
                try
                {
                    await mailService.SendDeadlineReminderAsync(
                        email, name,
                        complaint.Subject,
                        complaint.ComplaintId,
                        complaint.TicketId.ToString(),
                        deadlineDate);

                    _logger.LogInformation(
                        "DeadlineReminder: sent to {Email} for complaint {ComplaintId}", email, complaint.ComplaintId);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex,
                        "DeadlineReminder: failed to send email to {Email} for complaint {ComplaintId}",
                        email, complaint.ComplaintId);
                }
            }
        }
    }

    // ────────────────────────────────────────────────────────────────────────────
    // หาผู้รับอีเมล จาก assignment (user / group members / department users)
    // ────────────────────────────────────────────────────────────────────────────

    private static async Task<List<(string Email, string Name)>> GetRecipientsAsync(
        ApplicationDbContext db, Models.ComplaintAssignment assignment)
    {
        var result = new List<(string Email, string Name)>();

        // 1. กำหนด user โดยตรง
        if (assignment.AssignedToUserId.HasValue)
        {
            var user = await db.Users
                .Where(u => u.UserId == assignment.AssignedToUserId.Value && u.IsActive)
                .Select(u => new { u.Email, FullName = u.Name + " " + u.Lastname })
                .FirstOrDefaultAsync();
            if (user != null)
                result.Add((user.Email, user.FullName));
            return result;
        }

        // 2. กำหนดให้กลุ่มคณะกรรมการ
        if (assignment.AssignedToGroupId.HasValue)
        {
            var members = await db.Members
                .Include(m => m.User)
                .Where(m => m.GroupId == assignment.AssignedToGroupId.Value && m.User.IsActive)
                .Select(m => new { m.User.Email, FullName = m.User.Name + " " + m.User.Lastname })
                .ToListAsync();
            result.AddRange(members.Select(m => (m.Email, m.FullName)));
            return result;
        }

        // 3. กำหนดให้หน่วยงาน
        if (assignment.AssignedToDeptId.HasValue)
        {
            var users = await db.Users
                .Where(u => u.DepartmentId == assignment.AssignedToDeptId.Value && u.IsActive)
                .Select(u => new { u.Email, FullName = u.Name + " " + u.Lastname })
                .ToListAsync();
            result.AddRange(users.Select(u => (u.Email, u.FullName)));
        }

        return result;
    }

    // ────────────────────────────────────────────────────────────────────────────
    // Helpers
    // ────────────────────────────────────────────────────────────────────────────

    /// <summary>คำนวณเวลาที่รอจนถึง 09:00 น. ครั้งถัดไป (เวลาไทย)</summary>
    private static TimeSpan GetDelayUntilNextRun()
    {
        var nowBangkok = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, BangkokTz);
        var nextRun = nowBangkok.Date.AddHours(9); // วันนี้ 09:00

        if (nowBangkok >= nextRun)
            nextRun = nextRun.AddDays(1); // ผ่านไปแล้ว → วันพรุ่งนี้ 09:00

        return nextRun - nowBangkok;
    }

    private static TimeZoneInfo GetBangkokTimeZone()
    {
        // Windows: "SE Asia Standard Time" | Linux/macOS: "Asia/Bangkok"
        try { return TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time"); }
        catch { return TimeZoneInfo.FindSystemTimeZoneById("Asia/Bangkok"); }
    }
}
