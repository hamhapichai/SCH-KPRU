namespace SchKpruApi.DTOs
{
    public class GroupCreateDto
    {
        public int DepartmentId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
    }

    public class GroupUpdateDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool IsActive { get; set; } = true;
    }

    public class GroupResponseDto
    {
        public int GroupId { get; set; }
        public int DepartmentId { get; set; }
        public string DepartmentName { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string? CreatedByUserName { get; set; }
        public string? UpdatedByUserName { get; set; }
        public int MemberCount { get; set; }
    }

    public class MemberCreateDto
    {
        public int GroupId { get; set; }
        public int UserId { get; set; }
    }

    public class MemberResponseDto
    {
        public int MembersId { get; set; }
        public int GroupId { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string UserEmail { get; set; } = string.Empty;
        public string UserFullName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public string? CreatedByUserName { get; set; }
    }
}