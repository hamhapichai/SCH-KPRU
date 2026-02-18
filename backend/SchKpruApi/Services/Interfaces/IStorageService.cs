namespace SchKpruApi.Services.Interfaces;

public interface IStorageService
{
    /// <summary>อัปโหลดไฟล์ไปยัง S3 และคืน public URL</summary>
    Task<string> UploadFileAsync(IFormFile file, string folder);

    /// <summary>ดาวน์โหลดไฟล์จาก S3 โดยใช้ key</summary>
    Task<Stream> DownloadFileAsync(string key);

    /// <summary>ลบไฟล์จาก S3 โดยใช้ key</summary>
    Task DeleteFileAsync(string key);
}