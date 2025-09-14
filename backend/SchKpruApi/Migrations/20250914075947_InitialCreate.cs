using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace SchKpruApi.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "roles",
                columns: table => new
                {
                    role_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    role_name = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_roles", x => x.role_id);
                });

            migrationBuilder.CreateTable(
                name: "ai_suggestions",
                columns: table => new
                {
                    ai_suggestion_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    complaint_id = table.Column<int>(type: "integer", nullable: false),
                    suggested_dept_id = table.Column<int>(type: "integer", nullable: true),
                    suggested_category = table.Column<string>(type: "text", nullable: true),
                    summarized_by_ai = table.Column<string>(type: "text", nullable: true),
                    confidence_score = table.Column<float>(type: "real", precision: 5, scale: 4, nullable: true),
                    suggested_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ai_suggestions", x => x.ai_suggestion_id);
                });

            migrationBuilder.CreateTable(
                name: "complaint_assignments",
                columns: table => new
                {
                    assignment_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    complaint_id = table.Column<int>(type: "integer", nullable: false),
                    assigned_by_user_id = table.Column<int>(type: "integer", nullable: false),
                    assigned_to_dept_id = table.Column<int>(type: "integer", nullable: true),
                    assigned_to_group_id = table.Column<int>(type: "integer", nullable: true),
                    assigned_to_user_id = table.Column<int>(type: "integer", nullable: true),
                    target_date = table.Column<int>(type: "integer", nullable: true),
                    status = table.Column<string>(type: "text", nullable: false),
                    assigned_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    received_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    completed_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    closed_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by_user_id = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_complaint_assignments", x => x.assignment_id);
                });

            migrationBuilder.CreateTable(
                name: "complaint_logs",
                columns: table => new
                {
                    log_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    complaint_id = table.Column<int>(type: "integer", nullable: false),
                    user_id = table.Column<int>(type: "integer", nullable: true),
                    department_id = table.Column<int>(type: "integer", nullable: true),
                    action = table.Column<string>(type: "text", nullable: false),
                    notes = table.Column<string>(type: "text", nullable: true),
                    previous_status = table.Column<string>(type: "text", nullable: true),
                    new_status = table.Column<string>(type: "text", nullable: true),
                    timestamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    metadata = table.Column<string>(type: "text", nullable: true),
                    related_assignment_id = table.Column<int>(type: "integer", nullable: true),
                    created_by_user_id = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_complaint_logs", x => x.log_id);
                    table.ForeignKey(
                        name: "FK_complaint_logs_complaint_assignments_related_assignment_id",
                        column: x => x.related_assignment_id,
                        principalTable: "complaint_assignments",
                        principalColumn: "assignment_id");
                });

            migrationBuilder.CreateTable(
                name: "complaints",
                columns: table => new
                {
                    complaint_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    contact_name = table.Column<string>(type: "text", nullable: true),
                    contact_email = table.Column<string>(type: "text", nullable: true),
                    contact_phone = table.Column<string>(type: "text", nullable: true),
                    subject = table.Column<string>(type: "text", nullable: false),
                    message = table.Column<string>(type: "text", nullable: false),
                    submission_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    current_status = table.Column<string>(type: "text", nullable: false),
                    is_anonymous = table.Column<bool>(type: "boolean", nullable: false),
                    ticket_id = table.Column<Guid>(type: "uuid", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by_user_id = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_complaints", x => x.complaint_id);
                });

            migrationBuilder.CreateTable(
                name: "departments",
                columns: table => new
                {
                    department_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    department_name = table.Column<string>(type: "text", nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    is_admin_or_dean_dept = table.Column<bool>(type: "boolean", nullable: false),
                    is_deleted = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_by_user_id = table.Column<int>(type: "integer", nullable: true),
                    updated_by_user_id = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_departments", x => x.department_id);
                });

            migrationBuilder.CreateTable(
                name: "users",
                columns: table => new
                {
                    user_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    username = table.Column<string>(type: "text", nullable: false),
                    password_hash = table.Column<string>(type: "text", nullable: false),
                    email = table.Column<string>(type: "text", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    lastname = table.Column<string>(type: "text", nullable: false),
                    bio = table.Column<string>(type: "text", nullable: true),
                    role_id = table.Column<int>(type: "integer", nullable: false),
                    department_id = table.Column<int>(type: "integer", nullable: true),
                    last_login_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    last_login_ip = table.Column<string>(type: "text", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_by_user_id = table.Column<int>(type: "integer", nullable: true),
                    updated_by_user_id = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_users", x => x.user_id);
                    table.ForeignKey(
                        name: "FK_users_departments_department_id",
                        column: x => x.department_id,
                        principalTable: "departments",
                        principalColumn: "department_id");
                    table.ForeignKey(
                        name: "FK_users_roles_role_id",
                        column: x => x.role_id,
                        principalTable: "roles",
                        principalColumn: "role_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_users_users_created_by_user_id",
                        column: x => x.created_by_user_id,
                        principalTable: "users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_users_users_updated_by_user_id",
                        column: x => x.updated_by_user_id,
                        principalTable: "users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "groups",
                columns: table => new
                {
                    group_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    department_id = table.Column<int>(type: "integer", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_by_user_id = table.Column<int>(type: "integer", nullable: true),
                    updated_by_user_id = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_groups", x => x.group_id);
                    table.ForeignKey(
                        name: "FK_groups_departments_department_id",
                        column: x => x.department_id,
                        principalTable: "departments",
                        principalColumn: "department_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_groups_users_created_by_user_id",
                        column: x => x.created_by_user_id,
                        principalTable: "users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_groups_users_updated_by_user_id",
                        column: x => x.updated_by_user_id,
                        principalTable: "users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "members",
                columns: table => new
                {
                    members_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    group_id = table.Column<int>(type: "integer", nullable: false),
                    user_id = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by_user_id = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_members", x => x.members_id);
                    table.ForeignKey(
                        name: "FK_members_groups_group_id",
                        column: x => x.group_id,
                        principalTable: "groups",
                        principalColumn: "group_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_members_users_created_by_user_id",
                        column: x => x.created_by_user_id,
                        principalTable: "users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_members_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ai_suggestions_complaint_id",
                table: "ai_suggestions",
                column: "complaint_id");

            migrationBuilder.CreateIndex(
                name: "IX_ai_suggestions_suggested_dept_id",
                table: "ai_suggestions",
                column: "suggested_dept_id");

            migrationBuilder.CreateIndex(
                name: "IX_complaint_assignments_assigned_by_user_id",
                table: "complaint_assignments",
                column: "assigned_by_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_complaint_assignments_assigned_to_dept_id",
                table: "complaint_assignments",
                column: "assigned_to_dept_id");

            migrationBuilder.CreateIndex(
                name: "IX_complaint_assignments_assigned_to_group_id",
                table: "complaint_assignments",
                column: "assigned_to_group_id");

            migrationBuilder.CreateIndex(
                name: "IX_complaint_assignments_assigned_to_user_id",
                table: "complaint_assignments",
                column: "assigned_to_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_complaint_assignments_complaint_id",
                table: "complaint_assignments",
                column: "complaint_id");

            migrationBuilder.CreateIndex(
                name: "IX_complaint_assignments_updated_by_user_id",
                table: "complaint_assignments",
                column: "updated_by_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_complaint_logs_complaint_id",
                table: "complaint_logs",
                column: "complaint_id");

            migrationBuilder.CreateIndex(
                name: "IX_complaint_logs_created_by_user_id",
                table: "complaint_logs",
                column: "created_by_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_complaint_logs_department_id",
                table: "complaint_logs",
                column: "department_id");

            migrationBuilder.CreateIndex(
                name: "IX_complaint_logs_related_assignment_id",
                table: "complaint_logs",
                column: "related_assignment_id");

            migrationBuilder.CreateIndex(
                name: "IX_complaint_logs_user_id",
                table: "complaint_logs",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_complaints_ticket_id",
                table: "complaints",
                column: "ticket_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_complaints_updated_by_user_id",
                table: "complaints",
                column: "updated_by_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_departments_created_by_user_id",
                table: "departments",
                column: "created_by_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_departments_department_name",
                table: "departments",
                column: "department_name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_departments_updated_by_user_id",
                table: "departments",
                column: "updated_by_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_groups_created_by_user_id",
                table: "groups",
                column: "created_by_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_groups_department_id",
                table: "groups",
                column: "department_id");

            migrationBuilder.CreateIndex(
                name: "IX_groups_updated_by_user_id",
                table: "groups",
                column: "updated_by_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_members_created_by_user_id",
                table: "members",
                column: "created_by_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_members_group_id",
                table: "members",
                column: "group_id");

            migrationBuilder.CreateIndex(
                name: "IX_members_user_id",
                table: "members",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_roles_role_name",
                table: "roles",
                column: "role_name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_users_created_by_user_id",
                table: "users",
                column: "created_by_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_users_department_id",
                table: "users",
                column: "department_id");

            migrationBuilder.CreateIndex(
                name: "IX_users_email",
                table: "users",
                column: "email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_users_role_id",
                table: "users",
                column: "role_id");

            migrationBuilder.CreateIndex(
                name: "IX_users_updated_by_user_id",
                table: "users",
                column: "updated_by_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_users_username",
                table: "users",
                column: "username",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_ai_suggestions_complaints_complaint_id",
                table: "ai_suggestions",
                column: "complaint_id",
                principalTable: "complaints",
                principalColumn: "complaint_id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ai_suggestions_departments_suggested_dept_id",
                table: "ai_suggestions",
                column: "suggested_dept_id",
                principalTable: "departments",
                principalColumn: "department_id");

            migrationBuilder.AddForeignKey(
                name: "FK_complaint_assignments_complaints_complaint_id",
                table: "complaint_assignments",
                column: "complaint_id",
                principalTable: "complaints",
                principalColumn: "complaint_id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_complaint_assignments_departments_assigned_to_dept_id",
                table: "complaint_assignments",
                column: "assigned_to_dept_id",
                principalTable: "departments",
                principalColumn: "department_id");

            migrationBuilder.AddForeignKey(
                name: "FK_complaint_assignments_groups_assigned_to_group_id",
                table: "complaint_assignments",
                column: "assigned_to_group_id",
                principalTable: "groups",
                principalColumn: "group_id");

            migrationBuilder.AddForeignKey(
                name: "FK_complaint_assignments_users_assigned_by_user_id",
                table: "complaint_assignments",
                column: "assigned_by_user_id",
                principalTable: "users",
                principalColumn: "user_id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_complaint_assignments_users_assigned_to_user_id",
                table: "complaint_assignments",
                column: "assigned_to_user_id",
                principalTable: "users",
                principalColumn: "user_id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_complaint_assignments_users_updated_by_user_id",
                table: "complaint_assignments",
                column: "updated_by_user_id",
                principalTable: "users",
                principalColumn: "user_id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_complaint_logs_complaints_complaint_id",
                table: "complaint_logs",
                column: "complaint_id",
                principalTable: "complaints",
                principalColumn: "complaint_id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_complaint_logs_departments_department_id",
                table: "complaint_logs",
                column: "department_id",
                principalTable: "departments",
                principalColumn: "department_id");

            migrationBuilder.AddForeignKey(
                name: "FK_complaint_logs_users_created_by_user_id",
                table: "complaint_logs",
                column: "created_by_user_id",
                principalTable: "users",
                principalColumn: "user_id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_complaint_logs_users_user_id",
                table: "complaint_logs",
                column: "user_id",
                principalTable: "users",
                principalColumn: "user_id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_complaints_users_updated_by_user_id",
                table: "complaints",
                column: "updated_by_user_id",
                principalTable: "users",
                principalColumn: "user_id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_departments_users_created_by_user_id",
                table: "departments",
                column: "created_by_user_id",
                principalTable: "users",
                principalColumn: "user_id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_departments_users_updated_by_user_id",
                table: "departments",
                column: "updated_by_user_id",
                principalTable: "users",
                principalColumn: "user_id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_users_departments_department_id",
                table: "users");

            migrationBuilder.DropTable(
                name: "ai_suggestions");

            migrationBuilder.DropTable(
                name: "complaint_logs");

            migrationBuilder.DropTable(
                name: "members");

            migrationBuilder.DropTable(
                name: "complaint_assignments");

            migrationBuilder.DropTable(
                name: "complaints");

            migrationBuilder.DropTable(
                name: "groups");

            migrationBuilder.DropTable(
                name: "departments");

            migrationBuilder.DropTable(
                name: "users");

            migrationBuilder.DropTable(
                name: "roles");
        }
    }
}
