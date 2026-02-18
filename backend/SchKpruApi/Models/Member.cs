using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SchKpruApi.Models;

[Table("members")]
public class Member
{
    [Key] [Column("members_id")] public int MembersId { get; set; }

    [Required] [Column("group_id")] public int GroupId { get; set; }

    [Required] [Column("user_id")] public int UserId { get; set; }

    [Column("created_at")] public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("created_by_user_id")] public int? CreatedByUserId { get; set; }

    // Navigation properties
    [ForeignKey("GroupId")] public virtual Group Group { get; set; } = null!;

    [ForeignKey("UserId")] public virtual User User { get; set; } = null!;

    [ForeignKey("CreatedByUserId")] public virtual User? CreatedByUser { get; set; }
}