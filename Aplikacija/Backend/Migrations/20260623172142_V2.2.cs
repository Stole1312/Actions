using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class V22 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Reports_Users_SenderID",
                table: "Reports");

            migrationBuilder.DropIndex(
                name: "IX_Reports_SenderID",
                table: "Reports");

            migrationBuilder.DropColumn(
                name: "SenderID",
                table: "Reports");

            migrationBuilder.CreateIndex(
                name: "IX_Reports_InitiatorID",
                table: "Reports",
                column: "InitiatorID");

            migrationBuilder.AddForeignKey(
                name: "FK_Reports_Users_InitiatorID",
                table: "Reports",
                column: "InitiatorID",
                principalTable: "Users",
                principalColumn: "ID",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Reports_Users_InitiatorID",
                table: "Reports");

            migrationBuilder.DropIndex(
                name: "IX_Reports_InitiatorID",
                table: "Reports");

            migrationBuilder.AddColumn<int>(
                name: "SenderID",
                table: "Reports",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Reports_SenderID",
                table: "Reports",
                column: "SenderID");

            migrationBuilder.AddForeignKey(
                name: "FK_Reports_Users_SenderID",
                table: "Reports",
                column: "SenderID",
                principalTable: "Users",
                principalColumn: "ID",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
