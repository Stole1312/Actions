using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class V19 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Picture",
                table: "SlikeSaAkcije");

            migrationBuilder.RenameColumn(
                name: "DateAndTime",
                table: "Akcije",
                newName: "DTStart");

            migrationBuilder.AddColumn<string>(
                name: "PictureUrl",
                table: "SlikeSaAkcije",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ActionPicture",
                table: "Akcije",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DTEnd",
                table: "Akcije",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PictureUrl",
                table: "SlikeSaAkcije");

            migrationBuilder.DropColumn(
                name: "ActionPicture",
                table: "Akcije");

            migrationBuilder.DropColumn(
                name: "DTEnd",
                table: "Akcije");

            migrationBuilder.RenameColumn(
                name: "DTStart",
                table: "Akcije",
                newName: "DateAndTime");

            migrationBuilder.AddColumn<string>(
                name: "Picture",
                table: "SlikeSaAkcije",
                type: "text",
                nullable: false,
                defaultValue: "");
        }
    }
}
