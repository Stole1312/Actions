using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class V15 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_VerificationRequests_Users_ReviewerID",
                table: "VerificationRequests");

            migrationBuilder.AlterColumn<int>(
                name: "ReviewerID",
                table: "VerificationRequests",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddForeignKey(
                name: "FK_VerificationRequests_Users_ReviewerID",
                table: "VerificationRequests",
                column: "ReviewerID",
                principalTable: "Users",
                principalColumn: "ID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_VerificationRequests_Users_ReviewerID",
                table: "VerificationRequests");

            migrationBuilder.AlterColumn<int>(
                name: "ReviewerID",
                table: "VerificationRequests",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_VerificationRequests_Users_ReviewerID",
                table: "VerificationRequests",
                column: "ReviewerID",
                principalTable: "Users",
                principalColumn: "ID",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
