using Microsoft.EntityFrameworkCore;
using SchKpruApi.Data;
using SchKpruApi.Models;
using BCrypt.Net;

namespace SchKpruApi.Data
{
    public static class DataSeeder
    {
        public static async Task SeedAsync(ApplicationDbContext context)
        {
            await context.Database.EnsureCreatedAsync();

            // Check if data already exists
            if (await context.Roles.AnyAsync())
                return;

            // Seed Roles
            var roles = new[]
            {
                new Role { RoleName = "Admin" },
                new Role { RoleName = "Dean" },
                new Role { RoleName = "Deputy" },
                new Role { RoleName = "Staff" },
                new Role { RoleName = "Public" }
            };

            await context.Roles.AddRangeAsync(roles);
            await context.SaveChangesAsync();

            // Seed Departments
            var departments = new[]
            {
                new Department
                {
                    DepartmentName = "Admin Department",
                    Description = "Admin Department",
                    IsAdminOrDeanDept = true,
                    CreatedAt = DateTime.UtcNow
                },
                new Department
                {
                    DepartmentName = "Dean Department",
                    Description = "Dean Department",
                    IsAdminOrDeanDept = true,
                    CreatedAt = DateTime.UtcNow
                }
            };

            await context.Departments.AddRangeAsync(departments);
            await context.SaveChangesAsync();

            // Get seeded data for foreign keys
            var adminRole = await context.Roles.FirstAsync(r => r.RoleName == "Admin");
            var adminDepartment = await context.Departments.FirstAsync(d => d.DepartmentName == "Admin Department");

            // Seed default admin user
            var adminUser = new User
            {
                Username = "admin",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("P@ssw0rd"),
                Email = "admin@kpru.ac.th",
                Name = "System",
                Lastname = "Administrator",
                Bio = "Default system administrator",
                RoleId = adminRole.RoleId,
                DepartmentId = adminDepartment.DepartmentId,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            await context.Users.AddAsync(adminUser);
            await context.SaveChangesAsync();

            Console.WriteLine("Database seeded successfully!");
        }
    }
}