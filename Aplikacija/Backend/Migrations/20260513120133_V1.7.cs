using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class V17 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Friends_Users_ReceiverID",
                table: "Friends");

            migrationBuilder.DropIndex(
                name: "IX_Friends_ReceiverID",
                table: "Friends");

            migrationBuilder.AddColumn<int>(
                name: "ReciverID",
                table: "Friends",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Friends_ReciverID",
                table: "Friends",
                column: "ReciverID");

            migrationBuilder.AddForeignKey(
                name: "FK_Friends_Users_ReciverID",
                table: "Friends",
                column: "ReciverID",
                principalTable: "Users",
                principalColumn: "ID",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
