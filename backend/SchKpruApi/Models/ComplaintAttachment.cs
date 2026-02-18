using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SchKpruApi.Models;

[Table("complaint_attachments")]
public class ComplaintAttachment
{
    [Key] [Column("attachment_id")] public int AttachmentId { get; set; }

    [Required] [Column("complaint_id")] public int ComplaintId { get; set; }

    [Required] [Column("file_name")] public string FileName { get; set; } = string.Empty;

    [Required]
    [Column("original_file_name")]
    public string OriginalFileName { get; set; } = string.Empty;

    [Required] [Column("s3_key")] public string S3Key { get; set; } = string.Empty;

    [Required] [Column("s3_url")] public string S3Url { get; set; } = string.Empty;

    [Required] [Column("content_type")] public string ContentType { get; set; } = string.Empty;

    [Column("file_size")] public long FileSize { get; set; }

    [Column("uploaded_at")] public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    [ForeignKey("ComplaintId")] public virtual Complaint Complaint { get; set; } = null!;
}