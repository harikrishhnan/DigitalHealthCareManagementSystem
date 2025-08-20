using Health.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore.Diagnostics;
using System;

namespace Health.Infrastructure.DBContext
{
    public class HealthDBContextDbContext : DbContext
    {
        public DbSet<Doctor> Doctors { get; set; }
        public DbSet<Appointment> Appointments { get; set; }
        public DbSet<User> User { get; set; }
        public DbSet<MedicalRecord> MedicalRecords { get; set; }
        public DbSet<Patient> Patients { get; set; }
        public DbSet<Admin> Admins { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder
                .UseSqlServer("Data Source=.\\SQLEXPRESS;Initial Catalog=HealthDB;Integrated Security=True;Encrypt=True;TrustServerCertificate=True")
                .ConfigureWarnings(w => w.Ignore(RelationalEventId.PendingModelChangesWarning));
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            var passwordHasher = new PasswordHasher<User>();

            // Define relationships


            modelBuilder.Entity<Doctor>()
                .HasOne(d => d.User)
                .WithOne()
                .HasForeignKey<Doctor>(d => d.UserID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Patient>()
                .HasOne(p => p.User)
                .WithOne()
                .HasForeignKey<Patient>(p => p.UserID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Admin>()
                .HasOne(a => a.User)
                .WithOne()
                .HasForeignKey<Admin>(a => a.UserID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.Doctor)
                .WithMany()
                .HasForeignKey(a => a.DoctorId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.Patient)
                .WithMany()
                .HasForeignKey(a => a.PatientId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<MedicalRecord>()
                .HasOne(m => m.Doctor)
                .WithMany()
                .HasForeignKey(m => m.DoctorId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<MedicalRecord>()
                .HasOne(m => m.Patient)
                .WithMany()
                .HasForeignKey(m => m.PatientId)
                .OnDelete(DeleteBehavior.SetNull);

            // Seed Doctors
            modelBuilder.Entity<Doctor>().HasData(
                new Doctor { DoctorId = 1, UserID = "D001", Name = "Dr. John Doe", PhoneNo = "7123456789", Speciality = "Cardiology", Email = "john.health@com" },
                new Doctor { DoctorId = 2, UserID = "D002", Name = "Dr. Jane Smith", PhoneNo = "7234567890", Speciality = "Neurology", Email = "jane.health@com" },
                new Doctor { DoctorId = 3, UserID = "D003", Name = "Dr. Emily Johnson", PhoneNo = "7345678901", Speciality = "Pediatrics", Email = "emily.health@com" },
                new Doctor { DoctorId = 4, UserID = "D004", Name = "Dr. Michael Brown", PhoneNo = "7456789012", Speciality = "Orthopedics", Email = "michael.health@com" },
                new Doctor { DoctorId = 5, UserID = "D005", Name = "Dr. Sarah Davis", PhoneNo = "7567890123", Speciality = "Dermatology", Email = "sarah.health@com" },
                new Doctor { DoctorId = 6, UserID = "D006", Name = "Dr. Robert Wilson", PhoneNo = "7678901234", Speciality = "Gastroenterology", Email = "robert.health@com" }
            );

            // Seed Users
            modelBuilder.Entity<User>().HasData(
                new User { UserId = "D001", Email = "john.health@com", Role = "Doctor", PasswordHash = passwordHasher.HashPassword(null, "PasswordDoctor1") },
                new User { UserId = "D002", Email = "jane.health@com", Role = "Doctor", PasswordHash = passwordHasher.HashPassword(null, "PasswordDoctor2") },
                new User { UserId = "D003", Email = "emily.health@com", Role = "Doctor", PasswordHash = passwordHasher.HashPassword(null, "PasswordDoctor3") },
                new User { UserId = "D004", Email = "michael.health@com", Role = "Doctor", PasswordHash = passwordHasher.HashPassword(null, "PasswordDoctor4") },
                new User { UserId = "D005", Email = "sarah.health@com", Role = "Doctor", PasswordHash = passwordHasher.HashPassword(null, "PasswordDoctor5") },
                new User { UserId = "D006", Email = "robert.health@com", Role = "Doctor", PasswordHash = passwordHasher.HashPassword(null, "PasswordDoctor6") },
                new User { UserId = "P001", Email = "alice@gmail.com", Role = "Patient", PasswordHash = passwordHasher.HashPassword(null, "PasswordPatient1") },
                new User { UserId = "P002", Email = "bob@gmail.com", Role = "Patient", PasswordHash = passwordHasher.HashPassword(null, "PasswordPatient2") },
                new User { UserId = "P003", Email = "charlie@gmail.com", Role = "Patient", PasswordHash = passwordHasher.HashPassword(null, "PasswordPatient3") },
                new User { UserId = "P004", Email = "david@gmail.com", Role = "Patient", PasswordHash = passwordHasher.HashPassword(null, "PasswordPatient4") },
                new User { UserId = "P005", Email = "eve@gmail.com", Role = "Patient", PasswordHash = passwordHasher.HashPassword(null, "PasswordPatient5") },
                new User { UserId = "P006", Email = "frank@gmail.com", Role = "Patient", PasswordHash = passwordHasher.HashPassword(null, "PasswordPatient6") },
                new User { UserId = "A001", Email = "admin1@health.com", Role = "Admin", PasswordHash = passwordHasher.HashPassword(null, "PasswordAdmin1") },
                new User { UserId = "A002", Email = "admin2@health.com", Role = "Admin", PasswordHash = passwordHasher.HashPassword(null, "PasswordAdmin2") },
                new User { UserId = "A003", Email = "admin3@health.com", Role = "Admin", PasswordHash = passwordHasher.HashPassword(null, "PasswordAdmin3") },
                new User { UserId = "A004", Email = "admin4@health.com", Role = "Admin", PasswordHash = passwordHasher.HashPassword(null, "PasswordAdmin4") },
                new User { UserId = "A005", Email = "admin5@health.com", Role = "Admin", PasswordHash = passwordHasher.HashPassword(null, "PasswordAdmin5") },
                new User { UserId = "A006", Email = "admin6@health.com", Role = "Admin", PasswordHash = passwordHasher.HashPassword(null, "PasswordAdmin6") }
            );

            // Seed Patients
            modelBuilder.Entity<Patient>().HasData(
                new Patient { PatientId = 1, UserID = "P001", PatientName = "Alice Smith", PhoneNo = "8123456789", Email = "alice@gmail.com" },
                new Patient { PatientId = 2, UserID = "P002", PatientName = "Bob Johnson", PhoneNo = "8234567890", Email = "bob@gmail.com" },
                new Patient { PatientId = 3, UserID = "P003", PatientName = "Charlie Brown", PhoneNo = "8345678901", Email = "charlie@gmail.com" },
                new Patient { PatientId = 4, UserID = "P004", PatientName = "David Wilson", PhoneNo = "8456789012", Email = "david@gmail.com" },
                new Patient { PatientId = 5, UserID = "P005", PatientName = "Eve Davis", PhoneNo = "8567890123", Email = "eve@gmail.com" },
                new Patient { PatientId = 6, UserID = "P006", PatientName = "Frank Taylor", PhoneNo = "8678901234", Email = "frank@gmail.com" }
            );

            // Seed Admins
            modelBuilder.Entity<Admin>().HasData(
                new Admin { AdminId = 1, UserID = "A001", Name = "Sarah Mitchell", PhoneNo = "9123456789", Email = "admin1@health.com" },
                new Admin { AdminId = 2, UserID = "A002", Name = "Michael Chen", PhoneNo = "9234567890", Email = "admin2@health.com" },
                new Admin { AdminId = 3, UserID = "A003", Name = "Laura Patel", PhoneNo = "9345678901", Email = "admin3@health.com" },
                new Admin { AdminId = 4, UserID = "A004", Name = "James Lee", PhoneNo = "9456789012", Email = "admin4@health.com" },
                new Admin { AdminId = 5, UserID = "A005", Name = "Emma White", PhoneNo = "9567890123", Email = "admin5@health.com" },
                new Admin { AdminId = 6, UserID = "A006", Name = "Daniel Kim", PhoneNo = "9678901234", Email = "admin6@health.com" }
            );

            // Seed Appointments (4 per doctor, total 24, distributed across 6 patients)
            modelBuilder.Entity<Appointment>().HasData(
                // Doctor 1 (Dr. John Doe) - 4 appointments
                new Appointment { AppointmentId = 1, DoctorId = 1, PatientId = 1, AppointmentDate = new DateTime(2025, 8, 6, 9, 0, 0), Status = "Scheduled" },
                new Appointment { AppointmentId = 2, DoctorId = 1, PatientId = 2, AppointmentDate = new DateTime(2025, 8, 8, 10, 0, 0), Status = "Scheduled" },
                new Appointment { AppointmentId = 3, DoctorId = 1, PatientId = 3, AppointmentDate = new DateTime(2025, 8, 10, 11, 0, 0), Status = "Scheduled" },
                new Appointment { AppointmentId = 4, DoctorId = 1, PatientId = 4, AppointmentDate = new DateTime(2025, 8, 12, 12, 0, 0), Status = "Scheduled" },
                // Doctor 2 (Dr. Jane Smith) - 4 appointments
                new Appointment { AppointmentId = 5, DoctorId = 2, PatientId = 2, AppointmentDate = new DateTime(2025, 8, 6, 10, 0, 0), Status = "Scheduled" },
                new Appointment { AppointmentId = 6, DoctorId = 2, PatientId = 3, AppointmentDate = new DateTime(2025, 8, 8, 11, 0, 0), Status = "Scheduled" },
                new Appointment { AppointmentId = 7, DoctorId = 2, PatientId = 4, AppointmentDate = new DateTime(2025, 8, 10, 12, 0, 0), Status = "Scheduled" },
                new Appointment { AppointmentId = 8, DoctorId = 2, PatientId = 5, AppointmentDate = new DateTime(2025, 8, 12, 13, 0, 0), Status = "Scheduled" },
                // Doctor 3 (Dr. Emily Johnson) - 4 appointments
                new Appointment { AppointmentId = 9, DoctorId = 3, PatientId = 3, AppointmentDate = new DateTime(2025, 8, 6, 11, 0, 0), Status = "Scheduled" },
                new Appointment { AppointmentId = 10, DoctorId = 3, PatientId = 4, AppointmentDate = new DateTime(2025, 8, 8, 12, 0, 0), Status = "Scheduled" },
                new Appointment { AppointmentId = 11, DoctorId = 3, PatientId = 5, AppointmentDate = new DateTime(2025, 8, 10, 13, 0, 0), Status = "Scheduled" },
                new Appointment { AppointmentId = 12, DoctorId = 3, PatientId = 6, AppointmentDate = new DateTime(2025, 8, 12, 14, 0, 0), Status = "Cancelled" },
                // Doctor 4 (Dr. Michael Brown) - 4 appointments
                new Appointment { AppointmentId = 13, DoctorId = 4, PatientId = 4, AppointmentDate = new DateTime(2025, 8, 6, 12, 0, 0), Status = "Scheduled" },
                new Appointment { AppointmentId = 14, DoctorId = 4, PatientId = 5, AppointmentDate = new DateTime(2025, 8, 8, 13, 0, 0), Status = "Scheduled" },
                new Appointment { AppointmentId = 15, DoctorId = 4, PatientId = 6, AppointmentDate = new DateTime(2025, 8, 10, 14, 0, 0), Status = "Scheduled" },
                new Appointment { AppointmentId = 16, DoctorId = 4, PatientId = 1, AppointmentDate = new DateTime(2025, 8, 12, 15, 0, 0), Status = "Scheduled" },
                // Doctor 5 (Dr. Sarah Davis) - 4 appointments
                new Appointment { AppointmentId = 17, DoctorId = 5, PatientId = 5, AppointmentDate = new DateTime(2025, 8, 6, 13, 0, 0), Status = "Scheduled" },
                new Appointment { AppointmentId = 18, DoctorId = 5, PatientId = 6, AppointmentDate = new DateTime(2025, 8, 8, 14, 0, 0), Status = "Scheduled" },
                new Appointment { AppointmentId = 19, DoctorId = 5, PatientId = 1, AppointmentDate = new DateTime(2025, 8, 10, 15, 0, 0), Status = "Scheduled" },
                new Appointment { AppointmentId = 20, DoctorId = 5, PatientId = 2, AppointmentDate = new DateTime(2025, 8, 12, 16, 0, 0), Status = "Scheduled" },
                // Doctor 6 (Dr. Robert Wilson) - 4 appointments
                new Appointment { AppointmentId = 21, DoctorId = 6, PatientId = 6, AppointmentDate = new DateTime(2025, 8, 6, 14, 0, 0), Status = "Scheduled" },
                new Appointment { AppointmentId = 22, DoctorId = 6, PatientId = 1, AppointmentDate = new DateTime(2025, 8, 8, 15, 0, 0), Status = "Scheduled" },
                new Appointment { AppointmentId = 23, DoctorId = 6, PatientId = 2, AppointmentDate = new DateTime(2025, 8, 10, 16, 0, 0), Status = "Scheduled" },
                new Appointment { AppointmentId = 24, DoctorId = 6, PatientId = 3, AppointmentDate = new DateTime(2025, 8, 12, 17, 0, 0), Status = "Cancelled" }
            );

            // Seed Medical Records (3 per patient, total 18)
            modelBuilder.Entity<MedicalRecord>().HasData(
                // Patient 1
                new MedicalRecord { RecordId = 1, PatientId = 1, DoctorId = 1, Diagnosis = "Hypertension", Treatment = "Prescribed beta-blockers", Date = new DateTime(2024, 5, 1, 8, 30, 0) },
                new MedicalRecord { RecordId = 2, PatientId = 1, DoctorId = 2, Diagnosis = "Migraine", Treatment = "Prescribed triptans", Date = new DateTime(2024, 6, 15, 9, 0, 0) },
                new MedicalRecord { RecordId = 3, PatientId = 1, DoctorId = 4, Diagnosis = "Arthritis", Treatment = "Prescribed NSAIDs", Date = new DateTime(2024, 7, 20, 10, 0, 0) },
                // Patient 2
                new MedicalRecord { RecordId = 4, PatientId = 2, DoctorId = 2, Diagnosis = "Epilepsy", Treatment = "Prescribed anticonvulsants", Date = new DateTime(2024, 5, 2, 8, 30, 0) },
                new MedicalRecord { RecordId = 5, PatientId = 2, DoctorId = 1, Diagnosis = "High cholesterol", Treatment = "Prescribed statins", Date = new DateTime(2024, 6, 16, 9, 0, 0) },
                new MedicalRecord { RecordId = 6, PatientId = 2, DoctorId = 5, Diagnosis = "Eczema", Treatment = "Prescribed topical steroids", Date = new DateTime(2024, 7, 21, 10, 0, 0) },
                // Patient 3
                new MedicalRecord { RecordId = 7, PatientId = 3, DoctorId = 3, Diagnosis = "Asthma", Treatment = "Prescribed inhaler", Date = new DateTime(2024, 5, 3, 8, 30, 0) },
                new MedicalRecord { RecordId = 8, PatientId = 3, DoctorId = 3, Diagnosis = "Ear infection", Treatment = "Prescribed antibiotics", Date = new DateTime(2024, 6, 17, 9, 0, 0) },
                new MedicalRecord { RecordId = 9, PatientId = 3, DoctorId = 6, Diagnosis = "Gastritis", Treatment = "Prescribed PPIs", Date = new DateTime(2024, 7, 22, 10, 0, 0) },
                // Patient 4
                new MedicalRecord { RecordId = 10, PatientId = 4, DoctorId = 1, Diagnosis = "Heart murmur", Treatment = "Scheduled for echocardiogram", Date = new DateTime(2024, 5, 4, 8, 30, 0) },
                new MedicalRecord { RecordId = 11, PatientId = 4, DoctorId = 2, Diagnosis = "Neuropathy", Treatment = "Prescribed gabapentin", Date = new DateTime(2024, 6, 18, 9, 0, 0) },
                new MedicalRecord { RecordId = 12, PatientId = 4, DoctorId = 4, Diagnosis = "Sprained ankle", Treatment = "RICE protocol advised", Date = new DateTime(2024, 7, 23, 10, 0, 0) },
                // Patient 5
                new MedicalRecord { RecordId = 13, PatientId = 5, DoctorId = 3, Diagnosis = "Bronchitis", Treatment = "Prescribed cough suppressant", Date = new DateTime(2024, 5, 5, 8, 30, 0) },
                new MedicalRecord { RecordId = 14, PatientId = 5, DoctorId = 1, Diagnosis = "Angina", Treatment = "Prescribed nitroglycerin", Date = new DateTime(2024, 6, 19, 9, 0, 0) },
                new MedicalRecord { RecordId = 15, PatientId = 5, DoctorId = 5, Diagnosis = "Psoriasis", Treatment = "Prescribed topical treatment", Date = new DateTime(2024, 7, 24, 10, 0, 0) },
                // Patient 6
                new MedicalRecord { RecordId = 16, PatientId = 6, DoctorId = 6, Diagnosis = "IBS", Treatment = "Dietary changes advised", Date = new DateTime(2024, 5, 6, 8, 30, 0) },
                new MedicalRecord { RecordId = 17, PatientId = 6, DoctorId = 3, Diagnosis = "Allergic rhinitis", Treatment = "Prescribed antihistamines", Date = new DateTime(2024, 6, 20, 9, 0, 0) },
                new MedicalRecord { RecordId = 18, PatientId = 6, DoctorId = 4, Diagnosis = "Lower back pain", Treatment = "Physical therapy recommended", Date = new DateTime(2024, 7, 25, 10, 0, 0) }
            );
        }
    }
}
