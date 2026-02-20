namespace SchKpruApi.Templates;

public static class EmailTemplates
{
    private static string BaseLayout(string content, string appUrl) => $$"""
        <!DOCTYPE html>
        <html lang="th">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>SCH-KPRU</title>
            <style>
                * { box-sizing: border-box; margin: 0; padding: 0; }
                body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f6f9; color: #333; }
                .wrapper { max-width: 620px; margin: 30px auto; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,.08); }
                .header { background: linear-gradient(135deg, #1a56db, #0e3a8c); padding: 32px 40px; text-align: center; }
                .header h1 { color: #fff; font-size: 22px; font-weight: 700; letter-spacing: .5px; }
                .header p { color: #c7d9f5; font-size: 13px; margin-top: 4px; }
                .body { padding: 36px 40px; }
                .greeting { font-size: 16px; font-weight: 600; margin-bottom: 12px; }
                .text { font-size: 14px; line-height: 1.7; color: #555; margin-bottom: 16px; }
                .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px 24px; margin: 20px 0; }
                .card-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
                .card-row:last-child { margin-bottom: 0; }
                .card-label { color: #64748b; font-weight: 500; }
                .card-value { color: #1e293b; font-weight: 600; text-align: right; max-width: 60%; word-break: break-word; }
                .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; }
                .badge-pending { background: #fef9c3; color: #854d0e; }
                .badge-in-progress { background: #dbeafe; color: #1e40af; }
                .badge-resolved { background: #dcfce7; color: #166534; }
                .badge-closed { background: #f1f5f9; color: #475569; }
                .badge-urgent { background: #fee2e2; color: #991b1b; }
                .btn { display: inline-block; padding: 12px 28px; background: #1a56db; color: #fff !important; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 600; margin-top: 8px; }
                .divider { border: none; border-top: 1px solid #e2e8f0; margin: 28px 0; }
                .footer { background: #f8fafc; padding: 20px 40px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
                .footer a { color: #1a56db; text-decoration: none; }
            </style>
        </head>
        <body>
            <div class="wrapper">
                <div class="header">
                    <h1>ระบบรับเรื่องร้องเรียน</h1>
                    <p>มหาวิทยาลัยราชภัฏกำแพงเพชร (SCH-KPRU)</p>
                </div>
                <div class="body">
                    {{content}}
                </div>
                <div class="footer">
                    <p>อีเมลนี้ถูกส่งโดยอัตโนมัติจากระบบ SCH-KPRU กรุณาอย่าตอบกลับ</p>
                    <p style="margin-top:6px;"><a href="{{appUrl}}">{{appUrl}}</a></p>
                    <p style="margin-top:6px;">© {{DateTime.Now.Year}} มหาวิทยาลัยราชภัฏกำแพงเพชร</p>
                </div>
            </div>
        </body>
        </html>
        """;

    // ---------------------------------------------------------------------------
    // Template 1: ยืนยันการรับเรื่องร้องเรียน
    // ---------------------------------------------------------------------------
    public static string ComplaintConfirmation(
        string contactName,
        string subject,
        string ticketId,
        DateTime submissionDate,
        string appUrl)
    {
        var content = $"""
            <p class="greeting">สวัสดี คุณ{contactName}</p>
            <p class="text">ระบบได้รับเรื่องร้องเรียนของคุณเรียบร้อยแล้ว โปรดเก็บหมายเลขติดตามไว้เพื่อตรวจสอบสถานะในภายหลัง</p>
            <div class="card">
                <div class="card-row">
                    <span class="card-label">หมายเลขติดตาม (Ticket ID)</span>
                    <span class="card-value" style="font-family:monospace;font-size:13px;">{ticketId}</span>
                </div>
                <div class="card-row">
                    <span class="card-label">เรื่อง</span>
                    <span class="card-value">{subject}</span>
                </div>
                <div class="card-row">
                    <span class="card-label">วันที่ยื่น</span>
                    <span class="card-value">{submissionDate.ToLocalTime():dd/MM/yyyy HH:mm} น.</span>
                </div>
            </div>
            <p class="text">เจ้าหน้าที่จะดำเนินการตรวจสอบและติดต่อกลับโดยเร็วที่สุด หากมีข้อสงสัยสามารถติดตามสถานะได้ที่เว็บไซต์</p>
            <a href="{appUrl}/track/{ticketId}" class="btn">ติดตามสถานะเรื่องร้องเรียน</a>
            """;

        return BaseLayout(content, appUrl);
    }

    // ---------------------------------------------------------------------------
    // Template 2: แจ้งดำเนินการเสร็จสิ้น
    // ---------------------------------------------------------------------------
    public static string CompletedComplaint(
        string contactName,
        string subject,
        string ticketId,
        string remark,
        string appUrl){
            var content = $"""
            <p class="greeting">สวัสดี คุณ{contactName}</p>
            <p class="text">เรื่องร้องเรียนของคุณได้รับการดำเนินการแล้ว กรุณาตรวจสอบรายละเอียดด้านล่าง</p>
            <div class="card">
                <div class="card-row">
                    <span class="card-label">หมายเลขติดตาม (Ticket ID)</span>
                    <span class="card-value" style="font-family:monospace;font-size:13px;">{ticketId}</span>
                </div>
                <div class="card-row">
                    <span class="card-label">เรื่อง</span>
                    <span class="card-value">{subject}</span>
                </div>
                <div class="card-row">
                    <span class="card-label">หมายเหตุจากเจ้าหน้าที่</span>
                    <span class="card-value">{remark}</span>
                </div>
            </div>
            <p class="text">หากคุณมีข้อสงสัยเพิ่มเติม กรุณาติดต่อเจ้าหน้าที่</p>
            <a href="{appUrl}/track/{ticketId}" class="btn">ดูรายละเอียดเรื่องร้องเรียน</a>
            """;

        return BaseLayout(content, appUrl);
    }

    // ---------------------------------------------------------------------------
    // Template 3: ต้อนรับผู้ใช้ใหม่
    // ---------------------------------------------------------------------------
    public static string WelcomeEmail(
        string fullName,
        string username,
        string appUrl)
    {
        var content = $"""
            <p class="greeting">ยินดีต้อนรับ คุณ{fullName}!</p>
            <p class="text">บัญชีผู้ใช้งานของคุณถูกสร้างในระบบ SCH-KPRU เรียบร้อยแล้ว</p>
            <div class="card">
                <div class="card-row">
                    <span class="card-label">ชื่อผู้ใช้ (Username)</span>
                    <span class="card-value" style="font-family:monospace;">{username}</span>
                </div>
            </div>
            <p class="text">คุณสามารถเข้าสู่ระบบได้ทันที หากมีปัญหาในการเข้าใช้งาน กรุณาติดต่อผู้ดูแลระบบ</p>
            <a href="{appUrl}/login" class="btn">เข้าสู่ระบบ</a>
            <hr class="divider" />
            <p class="text" style="color:#94a3b8;font-size:13px;">
                หากคุณไม่ได้ทำรายการนี้ กรุณาติดต่อผู้ดูแลระบบทันที
            </p>
            """;

        return BaseLayout(content, appUrl);
    }

    // ---------------------------------------------------------------------------
    // Template 5: แจ้งเตือน Deadline เรื่องร้องเรียน
    // ---------------------------------------------------------------------------
    public static string DeadlineReminderEmail(
        string staffName,
        string complaintSubject,
        int complaintId,
        string ticketId,
        DateTime deadlineDate,
        string appUrl)
    {
        var content = $"""
            <p class="greeting">เรียน คุณ{staffName}</p>
            <p class="text">ขอแจ้งเตือนว่าเรื่องร้องเรียนที่คุณได้รับมอบหมายมีกำหนดดำเนินการให้แล้วเสร็จ<strong>ภายในวันนี้ ({deadlineDate:dd/MM/yyyy})</strong> แต่ยังไม่ได้รับการดำเนินการให้เสร็จสิ้น กรุณาดำเนินการโดยเร็ว</p>
            <div class="card">
                <div class="card-row">
                    <span class="card-label">หมายเลขติดตาม (Ticket ID)</span>
                    <span class="card-value" style="font-family:monospace;font-size:13px;">{ticketId}</span>
                </div>
                <div class="card-row">
                    <span class="card-label">เรื่อง</span>
                    <span class="card-value">{complaintSubject}</span>
                </div>
                <div class="card-row">
                    <span class="card-label">กำหนดดำเนินการให้เสร็จ</span>
                    <span class="card-value" style="color:#991b1b;font-weight:700;">{deadlineDate:dd/MM/yyyy}</span>
                </div>
            </div>
            <div style="background:#fee2e2;border:1px solid #fca5a5;border-radius:8px;padding:12px 16px;margin-bottom:20px;">
                <span style="color:#991b1b;font-weight:600;font-size:14px;">⚠️ กรุณาดำเนินการและอัปเดตสถานะในระบบโดยเร็วที่สุด</span>
            </div>
            <a href="{appUrl}/complaints/{complaintId}" class="btn">ดำเนินการในระบบ</a>
            """;

        return BaseLayout(content, appUrl);
    }

    // ---------------------------------------------------------------------------
    // Template 4: แจ้งเจ้าหน้าที่เมื่อมีเรื่องใหม่
    // ---------------------------------------------------------------------------
    public static string NewComplaintNotification(
        string staffName,
        string subject,
        int complaintId,
        string ticketId,
        bool isUrgent,
        string appUrl)
    {
        var urgentBanner = isUrgent
            ? """<div style="background:#fee2e2;border:1px solid #fca5a5;border-radius:8px;padding:12px 16px;margin-bottom:20px;display:flex;align-items:center;gap:8px;"><span style="font-size:18px;">🚨</span><span style="color:#991b1b;font-weight:600;font-size:14px;">เรื่องนี้ถูกทำเครื่องหมายว่า <u>เร่งด่วน</u> กรุณาดำเนินการโดยเร็ว</span></div>"""
            : string.Empty;

        var content = $"""
            <p class="greeting">เรียน คุณ{staffName}</p>
            <p class="text">มีเรื่องร้องเรียนใหม่เข้ามาในระบบ รอการดำเนินการ</p>
            {urgentBanner}
            <div class="card">
                <div class="card-row">
                    <span class="card-label">รหัสเรื่อง (ID)</span>
                    <span class="card-value">#{complaintId}</span>
                </div>
                <div class="card-row">
                    <span class="card-label">Ticket ID</span>
                    <span class="card-value" style="font-family:monospace;font-size:13px;">{ticketId}</span>
                </div>
                <div class="card-row">
                    <span class="card-label">เรื่อง</span>
                    <span class="card-value">{subject}</span>
                </div>
                <div class="card-row">
                    <span class="card-label">ระดับ</span>
                    <span class="card-value">
                        <span class="badge {(isUrgent ? "badge-urgent" : "badge-pending")}">{(isUrgent ? "เร่งด่วน" : "ปกติ")}</span>
                    </span>
                </div>
            </div>
            <p class="text">กรุณาเข้าสู่ระบบเพื่อตรวจสอบและดำเนินการ</p>
            <a href="{appUrl}/dashboard/complaints/{complaintId}" class="btn">ดูเรื่องร้องเรียน</a>
            """;

        return BaseLayout(content, appUrl);
    }
}
