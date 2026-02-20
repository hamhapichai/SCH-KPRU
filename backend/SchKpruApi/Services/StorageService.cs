using Amazon.S3;
using Amazon.S3.Model;
using SchKpruApi.Services.Interfaces;

namespace SchKpruApi.Services;

public class StorageService : IStorageService
{
    private readonly string _bucketName;
    private readonly IAmazonS3 _s3Client;

    public StorageService(IAmazonS3 s3Client, IConfiguration configuration)
    {
        _s3Client = s3Client;
        _bucketName = configuration["AWS:S3BucketName"]
                      ?? throw new ArgumentNullException("AWS:S3BucketName", "S3 bucket name is not configured.");
    }

    public async Task<string> UploadFileAsync(IFormFile file, string folder)
    {
        var ext = Path.GetExtension(file.FileName);
        var uniqueFileName = $"{Guid.NewGuid()}{ext}";
        var key = $"{folder.TrimEnd('/')}/{uniqueFileName}";

        using var stream = file.OpenReadStream();

        var request = new PutObjectRequest
        {
            BucketName = _bucketName,
            Key = key,
            InputStream = stream,
            ContentType = file.ContentType,
            // ให้ไฟล์อ่านได้สาธารณะ (ปรับตาม bucket policy ถ้าใช้ pre-signed URL)
            CannedACL = S3CannedACL.PublicRead
        };

        await _s3Client.PutObjectAsync(request);

        // คืน URL โดยใช้ ServiceURL จาก config (รองรับทั้ง real AWS และ S3-compatible)
        var baseUrl = _s3Client.Config.ServiceURL?.TrimEnd('/');
        if (!string.IsNullOrEmpty(baseUrl)) return $"{baseUrl}/{_bucketName}/{key}";

        return $"https://{_bucketName}.s3.amazonaws.com/{key}";
    }

    public async Task<Stream> DownloadFileAsync(string key)
    {
        var request = new GetObjectRequest
        {
            BucketName = _bucketName,
            Key = key
        };

        var response = await _s3Client.GetObjectAsync(request);
        return response.ResponseStream;
    }

    public async Task DeleteFileAsync(string key)
    {
        var request = new DeleteObjectRequest
        {
            BucketName = _bucketName,
            Key = key
        };

        await _s3Client.DeleteObjectAsync(request);
    }
}