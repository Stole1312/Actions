using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class V16 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Ratings_UserID_ActionID",
                table: "Ratings");

            migrationBuilder.DropColumn(
                name: "ActionID",
                table: "Ratings");

            migrationBuilder.CreateIndex(
                name: "IX_Ratings_UserID_AkcijaID",
                table: "Ratings",
                columns: new[] { "UserID", "AkcijaID" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Ratings_UserID_AkcijaID",
                table: "Ratings");

            migrationBuilder.AddColumn<int>(
                name: "ActionID",
                table: "Ratings",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Ratings_UserID_ActionID",
                table: "Ratings",
                columns: new[] { "UserID", "ActionID" },
                unique: true);
        }
    }
}
