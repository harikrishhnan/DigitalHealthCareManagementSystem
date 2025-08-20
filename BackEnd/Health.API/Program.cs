using Health.Application.Services;
using Health.Domain;
using Health.Infrastructure.Contracts;
using Health.Infrastructure.Repositories;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using Health.Infrastructure.DBContext;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        // ✅ 1. Register DbContext
        builder.Services.AddDbContext<HealthDBContextDbContext>();
        // ✅ 2. Register HTTP Context Accessor
        builder.Services.AddHttpContextAccessor();

        // ✅ 3. Register password hasher
        builder.Services.AddScoped<IPasswordHasher<User>, PasswordHasher<User>>();

        // ✅ 4. Register Application Layer Services
        builder.Services.AddScoped<IUserService, UserService>();
        builder.Services.AddScoped<IMedicalRecordService, MedicalRecordService>();
        builder.Services.AddScoped<IDoctorService, DoctorService>();
        builder.Services.AddScoped<IAppointmentService, AppointmentService>();
        builder.Services.AddScoped<IAdminService, AdminService>();
        builder.Services.AddScoped<IPatientService, PatientService>();

        // ✅ 5. Register Infrastructure Layer Repositories
        builder.Services.AddScoped<IUserContract, UserRepository>();
        builder.Services.AddScoped<IMedicalRecordContract, MedicalRecordRepository>();
        builder.Services.AddScoped<IDoctorContract, DoctorRepository>();
        builder.Services.AddScoped<IAppointmentContract, AppointmentRepository>();
        builder.Services.AddScoped<IAdminContract, AdminRepository>();
        builder.Services.AddScoped<IPatientContract, PatientRepository>();

        // ✅ 6. Add JWT Authentication
        var jwtKey = builder.Configuration["Jwt:Key"] ?? "ThisIsASecretKey1234567890"; // Replace with secure key
        var key = Encoding.ASCII.GetBytes(jwtKey);

        builder.Services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.RequireHttpsMetadata = false;
            options.SaveToken = true;
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = false,
                ValidateAudience = false,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key)
            };
        });

        // ✅ 7. Add Authorization
        builder.Services.AddAuthorization();
        // ✅ 8. Add CORS
        builder.Services.AddCors(options =>
        {
            options.AddPolicy("AllowAllOrigins",
                builder => builder.AllowAnyOrigin()// Allow any origin
                                  .AllowAnyMethod()// Allow any HTTP method
                                  .AllowAnyHeader());// Allow any header like Authorization, request, etc.
        });
        // ✅ 9. Swagger with JWT Bearer token support
        builder.Services.AddSwaggerGen(c =>
        {
            c.SwaggerDoc("v1", new OpenApiInfo { Title = "Health API", Version = "v1" });

            c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                Name = "Authorization",
                Type = SecuritySchemeType.Http,
                Scheme = "Bearer",
                BearerFormat = "JWT",
                In = ParameterLocation.Header,
                Description = "Enter your JWT token in the format: Bearer {token}"
            });

            c.AddSecurityRequirement(new OpenApiSecurityRequirement {
    {
        new OpenApiSecurityScheme {
            Reference = new OpenApiReference {
                Type = ReferenceType.SecurityScheme,
                Id = "Bearer"
            }
        },
        Array.Empty<string>()
    }});
        });


        builder.Services.AddControllers();
        builder.Services.AddEndpointsApiExplorer();

        var app = builder.Build();

        // ✅ 10. Enable Swagger & Middleware
        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }
        app.UseCors("AllowAllOrigins");// enable CORS policy

        app.UseAuthentication(); // Enable Authentication
        app.UseAuthorization(); // Enable Authorization
        // difference between UseAuthentication and UseAuthorization is that UseAuthentication checks the token, while UseAuthorization checks the user's permissions based on roles or policies.

        app.MapControllers(); // Map controllers to routes
        app.Run();// Run the application
    }
}
