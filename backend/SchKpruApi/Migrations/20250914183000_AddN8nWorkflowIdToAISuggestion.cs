using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SchKpruApi.Migrations
{
    /// <inheritdoc />
    public partial class AddN8nWorkflowIdToAISuggestion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "n8n_workflow_id",
                table: "ai_suggestions",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "n8n_workflow_id",
                table: "ai_suggestions");
        }
    }
}
