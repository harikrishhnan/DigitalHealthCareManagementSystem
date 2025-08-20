using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Health.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "User",
                columns: table => new
                {
                    UserId = table.Column<string>(type: "varchar(10)", nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    Email = table.Column<string>(type: "varchar(80)", maxLength: 80, nullable: false),
                    Role = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_User", x => x.UserId);
                });

            migrationBuilder.CreateTable(
                name: "Admins",
                columns: table => new
                {
                    AdminId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserID = table.Column<string>(type: "varchar(10)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    PhoneNo = table.Column<string>(type: "varchar(15)", maxLength: 15, nullable: false),
                    Email = table.Column<string>(type: "varchar(80)", maxLength: 80, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Admins", x => x.AdminId);
                    table.ForeignKey(
                        name: "FK_Admins_User_UserID",
                        column: x => x.UserID,
                        principalTable: "User",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Doctors",
                columns: table => new
                {
                    DoctorId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserID = table.Column<string>(type: "varchar(10)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    PhoneNo = table.Column<string>(type: "varchar(15)", maxLength: 15, nullable: false),
                    Speciality = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "varchar(80)", maxLength: 80, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Doctors", x => x.DoctorId);
                    table.ForeignKey(
                        name: "FK_Doctors_User_UserID",
                        column: x => x.UserID,
                        principalTable: "User",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Patients",
                columns: table => new
                {
                    PatientId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserID = table.Column<string>(type: "varchar(10)", nullable: false),
                    PatientName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    PhoneNo = table.Column<string>(type: "varchar(15)", maxLength: 15, nullable: false),
                    Email = table.Column<string>(type: "varchar(80)", maxLength: 80, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Patients", x => x.PatientId);
                    table.ForeignKey(
                        name: "FK_Patients_User_UserID",
                        column: x => x.UserID,
                        principalTable: "User",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Appointments",
                columns: table => new
                {
                    AppointmentId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DoctorId = table.Column<int>(type: "int", nullable: true),
                    PatientId = table.Column<int>(type: "int", nullable: true),
                    AppointmentDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Status = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Appointments", x => x.AppointmentId);
                    table.ForeignKey(
                        name: "FK_Appointments_Doctors_DoctorId",
                        column: x => x.DoctorId,
                        principalTable: "Doctors",
                        principalColumn: "DoctorId",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Appointments_Patients_PatientId",
                        column: x => x.PatientId,
                        principalTable: "Patients",
                        principalColumn: "PatientId",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "MedicalRecords",
                columns: table => new
                {
                    RecordId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PatientId = table.Column<int>(type: "int", nullable: true),
                    DoctorId = table.Column<int>(type: "int", nullable: true),
                    Diagnosis = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Treatment = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Date = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MedicalRecords", x => x.RecordId);
                    table.ForeignKey(
                        name: "FK_MedicalRecords_Doctors_DoctorId",
                        column: x => x.DoctorId,
                        principalTable: "Doctors",
                        principalColumn: "DoctorId",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_MedicalRecords_Patients_PatientId",
                        column: x => x.PatientId,
                        principalTable: "Patients",
                        principalColumn: "PatientId",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.InsertData(
                table: "User",
                columns: new[] { "UserId", "Email", "PasswordHash", "Role" },
                values: new object[,]
                {
                    { "A001", "admin1@health.com", "AQAAAAIAAYagAAAAEJsVl2sN/ghDVFOxPvAyUxiuCChOSX0qKhm/CcO2aly9zjCq/1w8+INNK0BmYCe62Q==", "Admin" },
                    { "A002", "admin2@health.com", "AQAAAAIAAYagAAAAEEtVEsqDY5Z96Tf0g4c3wWcfu6bY4+oaT79FfTwnQoJmSW5gx4FO4bY44rZENlQV5g==", "Admin" },
                    { "A003", "admin3@health.com", "AQAAAAIAAYagAAAAENZsg4RvglYW8ry71IzyzGGsI1FKqNzz+eontipmcnUDWgwTnqSorFXlEwAkJibuDg==", "Admin" },
                    { "A004", "admin4@health.com", "AQAAAAIAAYagAAAAEMjGTijeBnpDXUM+oJ2lJidCtsNf6hZty1NK6n5g5fnWbjxWiN5R/p+Nzj2rUCzxsw==", "Admin" },
                    { "A005", "admin5@health.com", "AQAAAAIAAYagAAAAEGagcOxGkBYuGGHH74Nqm6KSpqmPlbTduH6BAOhfYTHgydiNyzlmi1hqWz84efn/wQ==", "Admin" },
                    { "A006", "admin6@health.com", "AQAAAAIAAYagAAAAEPDA8yNBrbR0YP08EA31OrAu0VZpoQFwy9lluhjsDzx3WpLaBIQCrc3p4OYaAJDOvw==", "Admin" },
                    { "D001", "john.health@com", "AQAAAAIAAYagAAAAEAkKM3/kn7yaGtXVgpB4gg54RsxbrDEVWOxKI/wbMvyqmoKPzZ6ArWP2MUsY7Hf6Vw==", "Doctor" },
                    { "D002", "jane.health@com", "AQAAAAIAAYagAAAAEONz4scTb3bEjpHXRQAQ1E84s11ne9lj/NNZXOjnpmEiLP0c2gHdEkgzRLYPeOv3Zw==", "Doctor" },
                    { "D003", "emily.health@com", "AQAAAAIAAYagAAAAEMB3aek9fd7FuWfOQ/bPlTyjAmDWNFo6jZolxHSCPyoieBeUS7WYVU/CZ53ABabXHg==", "Doctor" },
                    { "D004", "michael.health@com", "AQAAAAIAAYagAAAAEJ/Al82EUnqODjsIF47SBWZ4xoP1rImnKcER065drDGuIqVubwENU1H4ckJP/Lmw6Q==", "Doctor" },
                    { "D005", "sarah.health@com", "AQAAAAIAAYagAAAAELvSM+2mP+SsrjZQkinOjQytGWZWgG9OwjH/wb+I+9CiNQJA7ZwlrvMcMkangZJ5zw==", "Doctor" },
                    { "D006", "robert.health@com", "AQAAAAIAAYagAAAAEHaiCuE+3RNMSQVcD4i5etA8gnrWRrAIw8KcmFnJ9U+nerqqywh/k6NH0J5UoqT6CQ==", "Doctor" },
                    { "P001", "alice@gmail.com", "AQAAAAIAAYagAAAAEAkdvrUJcaJYc3x3s3ffCY7SUHyURZCAbXWZltJY8k3j4Zb/0u87H26SoXbu9xvsmw==", "Patient" },
                    { "P002", "bob@gmail.com", "AQAAAAIAAYagAAAAEPp1IgF1hK0sR1RP4cA7JhCXt3muptoWuJHSHHHySzkrVPkCB/9spY9CHv/p9oEZ3A==", "Patient" },
                    { "P003", "charlie@gmail.com", "AQAAAAIAAYagAAAAEKTLh3K2FUZ51JULLbuXch5XHfZ5G9r/kTUhNLw1hK0jcxsJNSixOhbGpoLmH1i+fQ==", "Patient" },
                    { "P004", "david@gmail.com", "AQAAAAIAAYagAAAAEC+SPdengWuy1rKmeFUeanP6yvVToThUixMAU/ugz3UXiiOopxYHFOITIr/P8XzDcw==", "Patient" },
                    { "P005", "eve@gmail.com", "AQAAAAIAAYagAAAAEED4VVlbbZ+4epFPflGviUFTD0eTmklAC7A7c2WbThaXu2F+BCasPH8CRw9HgjLjHQ==", "Patient" },
                    { "P006", "frank@gmail.com", "AQAAAAIAAYagAAAAEF1EQfFd+E8eBETTifRuWCm3I0nN60hkyd/lD7NzPwG1VBg6HxVMI/1MDVMKQzBo5Q==", "Patient" }
                });

            migrationBuilder.InsertData(
                table: "Admins",
                columns: new[] { "AdminId", "Email", "Name", "PhoneNo", "UserID" },
                values: new object[,]
                {
                    { 1, "admin1@health.com", "Sarah Mitchell", "9123456789", "A001" },
                    { 2, "admin2@health.com", "Michael Chen", "9234567890", "A002" },
                    { 3, "admin3@health.com", "Laura Patel", "9345678901", "A003" },
                    { 4, "admin4@health.com", "James Lee", "9456789012", "A004" },
                    { 5, "admin5@health.com", "Emma White", "9567890123", "A005" },
                    { 6, "admin6@health.com", "Daniel Kim", "9678901234", "A006" }
                });

            migrationBuilder.InsertData(
                table: "Doctors",
                columns: new[] { "DoctorId", "Email", "Name", "PhoneNo", "Speciality", "UserID" },
                values: new object[,]
                {
                    { 1, "john.health@com", "Dr. John Doe", "7123456789", "Cardiology", "D001" },
                    { 2, "jane.health@com", "Dr. Jane Smith", "7234567890", "Neurology", "D002" },
                    { 3, "emily.health@com", "Dr. Emily Johnson", "7345678901", "Pediatrics", "D003" },
                    { 4, "michael.health@com", "Dr. Michael Brown", "7456789012", "Orthopedics", "D004" },
                    { 5, "sarah.health@com", "Dr. Sarah Davis", "7567890123", "Dermatology", "D005" },
                    { 6, "robert.health@com", "Dr. Robert Wilson", "7678901234", "Gastroenterology", "D006" }
                });

            migrationBuilder.InsertData(
                table: "Patients",
                columns: new[] { "PatientId", "Email", "PatientName", "PhoneNo", "UserID" },
                values: new object[,]
                {
                    { 1, "alice@gmail.com", "Alice Smith", "8123456789", "P001" },
                    { 2, "bob@gmail.com", "Bob Johnson", "8234567890", "P002" },
                    { 3, "charlie@gmail.com", "Charlie Brown", "8345678901", "P003" },
                    { 4, "david@gmail.com", "David Wilson", "8456789012", "P004" },
                    { 5, "eve@gmail.com", "Eve Davis", "8567890123", "P005" },
                    { 6, "frank@gmail.com", "Frank Taylor", "8678901234", "P006" }
                });

            migrationBuilder.InsertData(
                table: "Appointments",
                columns: new[] { "AppointmentId", "AppointmentDate", "DoctorId", "PatientId", "Status" },
                values: new object[,]
                {
                    { 1, new DateTime(2025, 8, 6, 9, 0, 0, 0, DateTimeKind.Unspecified), 1, 1, "Scheduled" },
                    { 2, new DateTime(2025, 8, 8, 10, 0, 0, 0, DateTimeKind.Unspecified), 1, 2, "Scheduled" },
                    { 3, new DateTime(2025, 8, 10, 11, 0, 0, 0, DateTimeKind.Unspecified), 1, 3, "Scheduled" },
                    { 4, new DateTime(2025, 8, 12, 12, 0, 0, 0, DateTimeKind.Unspecified), 1, 4, "Scheduled" },
                    { 5, new DateTime(2025, 8, 6, 10, 0, 0, 0, DateTimeKind.Unspecified), 2, 2, "Scheduled" },
                    { 6, new DateTime(2025, 8, 8, 11, 0, 0, 0, DateTimeKind.Unspecified), 2, 3, "Scheduled" },
                    { 7, new DateTime(2025, 8, 10, 12, 0, 0, 0, DateTimeKind.Unspecified), 2, 4, "Scheduled" },
                    { 8, new DateTime(2025, 8, 12, 13, 0, 0, 0, DateTimeKind.Unspecified), 2, 5, "Scheduled" },
                    { 9, new DateTime(2025, 8, 6, 11, 0, 0, 0, DateTimeKind.Unspecified), 3, 3, "Scheduled" },
                    { 10, new DateTime(2025, 8, 8, 12, 0, 0, 0, DateTimeKind.Unspecified), 3, 4, "Scheduled" },
                    { 11, new DateTime(2025, 8, 10, 13, 0, 0, 0, DateTimeKind.Unspecified), 3, 5, "Scheduled" },
                    { 12, new DateTime(2025, 8, 12, 14, 0, 0, 0, DateTimeKind.Unspecified), 3, 6, "Cancelled" },
                    { 13, new DateTime(2025, 8, 6, 12, 0, 0, 0, DateTimeKind.Unspecified), 4, 4, "Scheduled" },
                    { 14, new DateTime(2025, 8, 8, 13, 0, 0, 0, DateTimeKind.Unspecified), 4, 5, "Scheduled" },
                    { 15, new DateTime(2025, 8, 10, 14, 0, 0, 0, DateTimeKind.Unspecified), 4, 6, "Scheduled" },
                    { 16, new DateTime(2025, 8, 12, 15, 0, 0, 0, DateTimeKind.Unspecified), 4, 1, "Scheduled" },
                    { 17, new DateTime(2025, 8, 6, 13, 0, 0, 0, DateTimeKind.Unspecified), 5, 5, "Scheduled" },
                    { 18, new DateTime(2025, 8, 8, 14, 0, 0, 0, DateTimeKind.Unspecified), 5, 6, "Scheduled" },
                    { 19, new DateTime(2025, 8, 10, 15, 0, 0, 0, DateTimeKind.Unspecified), 5, 1, "Scheduled" },
                    { 20, new DateTime(2025, 8, 12, 16, 0, 0, 0, DateTimeKind.Unspecified), 5, 2, "Scheduled" },
                    { 21, new DateTime(2025, 8, 6, 14, 0, 0, 0, DateTimeKind.Unspecified), 6, 6, "Scheduled" },
                    { 22, new DateTime(2025, 8, 8, 15, 0, 0, 0, DateTimeKind.Unspecified), 6, 1, "Scheduled" },
                    { 23, new DateTime(2025, 8, 10, 16, 0, 0, 0, DateTimeKind.Unspecified), 6, 2, "Scheduled" },
                    { 24, new DateTime(2025, 8, 12, 17, 0, 0, 0, DateTimeKind.Unspecified), 6, 3, "Cancelled" }
                });

            migrationBuilder.InsertData(
                table: "MedicalRecords",
                columns: new[] { "RecordId", "Date", "Diagnosis", "DoctorId", "PatientId", "Treatment" },
                values: new object[,]
                {
                    { 1, new DateTime(2024, 5, 1, 8, 30, 0, 0, DateTimeKind.Unspecified), "Hypertension", 1, 1, "Prescribed beta-blockers" },
                    { 2, new DateTime(2024, 6, 15, 9, 0, 0, 0, DateTimeKind.Unspecified), "Migraine", 2, 1, "Prescribed triptans" },
                    { 3, new DateTime(2024, 7, 20, 10, 0, 0, 0, DateTimeKind.Unspecified), "Arthritis", 4, 1, "Prescribed NSAIDs" },
                    { 4, new DateTime(2024, 5, 2, 8, 30, 0, 0, DateTimeKind.Unspecified), "Epilepsy", 2, 2, "Prescribed anticonvulsants" },
                    { 5, new DateTime(2024, 6, 16, 9, 0, 0, 0, DateTimeKind.Unspecified), "High cholesterol", 1, 2, "Prescribed statins" },
                    { 6, new DateTime(2024, 7, 21, 10, 0, 0, 0, DateTimeKind.Unspecified), "Eczema", 5, 2, "Prescribed topical steroids" },
                    { 7, new DateTime(2024, 5, 3, 8, 30, 0, 0, DateTimeKind.Unspecified), "Asthma", 3, 3, "Prescribed inhaler" },
                    { 8, new DateTime(2024, 6, 17, 9, 0, 0, 0, DateTimeKind.Unspecified), "Ear infection", 3, 3, "Prescribed antibiotics" },
                    { 9, new DateTime(2024, 7, 22, 10, 0, 0, 0, DateTimeKind.Unspecified), "Gastritis", 6, 3, "Prescribed PPIs" },
                    { 10, new DateTime(2024, 5, 4, 8, 30, 0, 0, DateTimeKind.Unspecified), "Heart murmur", 1, 4, "Scheduled for echocardiogram" },
                    { 11, new DateTime(2024, 6, 18, 9, 0, 0, 0, DateTimeKind.Unspecified), "Neuropathy", 2, 4, "Prescribed gabapentin" },
                    { 12, new DateTime(2024, 7, 23, 10, 0, 0, 0, DateTimeKind.Unspecified), "Sprained ankle", 4, 4, "RICE protocol advised" },
                    { 13, new DateTime(2024, 5, 5, 8, 30, 0, 0, DateTimeKind.Unspecified), "Bronchitis", 3, 5, "Prescribed cough suppressant" },
                    { 14, new DateTime(2024, 6, 19, 9, 0, 0, 0, DateTimeKind.Unspecified), "Angina", 1, 5, "Prescribed nitroglycerin" },
                    { 15, new DateTime(2024, 7, 24, 10, 0, 0, 0, DateTimeKind.Unspecified), "Psoriasis", 5, 5, "Prescribed topical treatment" },
                    { 16, new DateTime(2024, 5, 6, 8, 30, 0, 0, DateTimeKind.Unspecified), "IBS", 6, 6, "Dietary changes advised" },
                    { 17, new DateTime(2024, 6, 20, 9, 0, 0, 0, DateTimeKind.Unspecified), "Allergic rhinitis", 3, 6, "Prescribed antihistamines" },
                    { 18, new DateTime(2024, 7, 25, 10, 0, 0, 0, DateTimeKind.Unspecified), "Lower back pain", 4, 6, "Physical therapy recommended" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Admins_UserID",
                table: "Admins",
                column: "UserID",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Appointments_DoctorId",
                table: "Appointments",
                column: "DoctorId");

            migrationBuilder.CreateIndex(
                name: "IX_Appointments_PatientId",
                table: "Appointments",
                column: "PatientId");

            migrationBuilder.CreateIndex(
                name: "IX_Doctors_UserID",
                table: "Doctors",
                column: "UserID",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MedicalRecords_DoctorId",
                table: "MedicalRecords",
                column: "DoctorId");

            migrationBuilder.CreateIndex(
                name: "IX_MedicalRecords_PatientId",
                table: "MedicalRecords",
                column: "PatientId");

            migrationBuilder.CreateIndex(
                name: "IX_Patients_UserID",
                table: "Patients",
                column: "UserID",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Admins");

            migrationBuilder.DropTable(
                name: "Appointments");

            migrationBuilder.DropTable(
                name: "MedicalRecords");

            migrationBuilder.DropTable(
                name: "Doctors");

            migrationBuilder.DropTable(
                name: "Patients");

            migrationBuilder.DropTable(
                name: "User");
        }
    }
}
