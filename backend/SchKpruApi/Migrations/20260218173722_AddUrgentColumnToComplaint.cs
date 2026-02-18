using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SchKpruApi.Migrations
{
    /// <inheritdoc />
    public partial class AddUrgentColumnToComplaint : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "urgent",
                table: "complaints",
                type: "boolean",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "urgent",
                table: "complaints");
        }
    }
}
