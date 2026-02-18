using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using SchKpruApi.Data;
using SchKpruApi.Repositories;
using SchKpruApi.Services.Interfaces;
using SchKpruApi.Services;
using Amazon.S3;
using Amazon.Extensions.NETCore.Setup;
using SchKpruApi.Repositories.Interfaces;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Configure Entity Framework
var connectionString = Environment.GetEnvironmentVariable("DB_CONNECTION_STRING")
                       ?? builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

// Configure JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = Environment.GetEnvironmentVariable("JWT_SECRET") ?? jwtSettings["SecretKey"];
var issuer = Environment.GetEnvironmentVariable("JWT_ISSUER") ?? jwtSettings["Issuer"];
var audience = Environment.GetEnvironmentVariable("JWT_AUDIENCE") ?? jwtSettings["Audience"];

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = issuer,
            ValidAudience = audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey!))
        };
    });

builder.Services.AddAuthorization();

// Register Repositories
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IRoleRepository, RoleRepository>();
builder.Services.AddScoped<IDepartmentRepository, DepartmentRepository>();
builder.Services.AddScoped<IComplaintRepository, ComplaintRepository>();
builder.Services.AddScoped<IComplaintAssignmentRepository, ComplaintAssignmentRepository>();
builder.Services.AddScoped<IComplaintLogRepository, ComplaintLogRepository>();
builder.Services.AddScoped<IGroupRepository, GroupRepository>();
builder.Services.AddScoped<IMemberRepository, MemberRepository>();
builder.Services.AddScoped<IAISuggestionRepository, AISuggestionRepository>();

// Register Services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IComplaintService, ComplaintService>();
builder.Services.AddScoped<IComplaintAssignmentService, ComplaintAssignmentService>();
builder.Services.AddScoped<IDepartmentService, DepartmentService>();
builder.Services.AddScoped<IRoleService, RoleService>();
builder.Services.AddScoped<IGroupService, GroupService>();
builder.Services.AddScoped<IMemberService, MemberService>();
builder.Services.AddScoped<IAISuggestionService, AISuggestionService>();

// Register Webhook Services
builder.Services.AddScoped<IWebhookService, WebhookService>();
builder.Services.AddSingleton<IWebhookQueueService, WebhookQueueService>();

#region AWS S3 Services

var awsOptions = builder.Configuration.GetSection("AWS").Get<AWSOptions>();
var s3DevConfig = new AmazonS3Config
{
    ServiceURL = builder.Configuration["AWS:ServiceURL"],
    ForcePathStyle = bool.Parse(builder.Configuration["AWS:ForcePathStyle"] ?? "true"),
    AuthenticationRegion = builder.Configuration["AWS:Region"]
};
var awsaccessKey = builder.Configuration["AWS:AccessKey"];
var awssecretKey = builder.Configuration["AWS:SecretKey"];
var s3Client = new AmazonS3Client(awsaccessKey, awssecretKey, s3DevConfig);
builder.Services.AddSingleton<IAmazonS3>(s3Client);

builder.Services.AddScoped<IStorageService, StorageService>();

#endregion

// Register Background Services
builder.Services.AddHostedService<WebhookQueueBackgroundService>();

// Register HttpClient
builder.Services.AddHttpClient();
builder.Services.AddHttpClient("n8n", client =>
{
    client.Timeout = TimeSpan.FromSeconds(30);
});

// Configure WebhookOptions
builder.Services.Configure<WebhookOptions>(builder.Configuration.GetSection("WebhookOptions"));

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy.WithOrigins("http://localhost:3000", "https://sch-kpru.blurger.dev")
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials();
        });
    options.AddPolicy("AllowAll",
        policy =>
        {
            policy.AllowAnyOrigin()
                .AllowAnyHeader()
                .AllowAnyMethod();
        });
});

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Seed database
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    try
    {
        context.Database.Migrate();
    }
    catch (Exception ex)
    {
        // Log error เผื่อ Database ยังไม่พร้อม
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while migrating the database.");
    }

    await DataSeeder.SeedAsync(context);
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    Console.WriteLine("Running in Development environment");
    Console.WriteLine($"Database Connection String: {connectionString}");
}

app.UseHttpsRedirection();

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();