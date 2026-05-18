using System.Text.Json.Serialization;
using Backend.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// ── CORS: allow React (port 3000) to call this API ──────────────────────────
builder.Services.AddCors(options =>
{
    options.AddPolicy(
        "AllowReact",
        policy =>
        {
            policy.WithOrigins("http://localhost:3000").AllowAnyHeader().AllowAnyMethod();
        }
    );
});

// ── DATABASE: connect to MySQL ───────────────────────────────────────────────
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString))
);

// ── CONTROLLERS ──────────────────────────────────────────────────────────────
builder
    .Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

app.UseCors("AllowReact");
app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();
