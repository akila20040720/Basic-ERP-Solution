using Microsoft.EntityFrameworkCore;
using PhoneBookApp.Server.Data;
using PhoneBookApp.Server.Models;

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();
builder.Services.AddProblemDetails();
builder.Services.AddOpenApi();
builder.Services.AddHttpClient();

var mysqlConnection = builder.Configuration.GetConnectionString("MySql");
if (!string.IsNullOrWhiteSpace(mysqlConnection))
{
    builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseMySql(mysqlConnection, ServerVersion.AutoDetect(mysqlConnection)));
}
else
{
    builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseInMemoryDatabase("abc-company-db"));
}

var app = builder.Build();

app.UseExceptionHandler();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();

    if (!db.Departments.Any())
    {
        db.Departments.AddRange(
            new Department { DepartmentName = "Human Resources" },
            new Department { DepartmentName = "Finance" },
            new Department { DepartmentName = "Engineering" }
        );
    }

    if (!db.Positions.Any())
    {
        db.Positions.AddRange(
            new Position { PositionName = "Manager" },
            new Position { PositionName = "Executive" },
            new Position { PositionName = "Developer" }
        );
    }

    db.SaveChanges();
}

var api = app.MapGroup("/api");

api.MapPost("/auth/login", (LoginRequest request) =>
{
    if (string.IsNullOrWhiteSpace(request.Username))
    {
        return Results.BadRequest(new { message = "Username is required." });
    }

    // Optional login for demo usage; accepts any username.
    return Results.Ok(new { token = Guid.NewGuid().ToString("N"), displayName = request.Username.Trim() });
});

var departmentsApi = api.MapGroup("/departments");
departmentsApi.MapGet("/", async (AppDbContext db) =>
    Results.Ok(await db.Departments.OrderBy(x => x.DepartmentName).ToListAsync()));

departmentsApi.MapPost("/", async (DepartmentRequest request, AppDbContext db) =>
{
    if (string.IsNullOrWhiteSpace(request.DepartmentName))
    {
        return Results.BadRequest(new { message = "Department name is required." });
    }

    var exists = await db.Departments.AnyAsync(x => x.DepartmentName == request.DepartmentName.Trim());
    if (exists)
    {
        return Results.Conflict(new { message = "Department already exists." });
    }

    var entity = new Department { DepartmentName = request.DepartmentName.Trim() };
    db.Departments.Add(entity);
    await db.SaveChangesAsync();
    return Results.Created($"/api/departments/{entity.DepartmentId}", entity);
});

departmentsApi.MapPut("/{id:int}", async (int id, DepartmentRequest request, AppDbContext db) =>
{
    var entity = await db.Departments.FindAsync(id);
    if (entity is null)
    {
        return Results.NotFound();
    }

    if (string.IsNullOrWhiteSpace(request.DepartmentName))
    {
        return Results.BadRequest(new { message = "Department name is required." });
    }

    entity.DepartmentName = request.DepartmentName.Trim();
    await db.SaveChangesAsync();
    return Results.Ok(entity);
});

departmentsApi.MapDelete("/{id:int}", async (int id, AppDbContext db) =>
{
    var isUsed = await db.Employees.AnyAsync(x => x.DepartmentId == id);
    if (isUsed)
    {
        return Results.BadRequest(new { message = "Department is assigned to an employee." });
    }

    var entity = await db.Departments.FindAsync(id);
    if (entity is null)
    {
        return Results.NotFound();
    }

    db.Departments.Remove(entity);
    await db.SaveChangesAsync();
    return Results.NoContent();
});

var positionsApi = api.MapGroup("/positions");
positionsApi.MapGet("/", async (AppDbContext db) =>
    Results.Ok(await db.Positions.OrderBy(x => x.PositionName).ToListAsync()));

positionsApi.MapPost("/", async (PositionRequest request, AppDbContext db) =>
{
    if (string.IsNullOrWhiteSpace(request.PositionName))
    {
        return Results.BadRequest(new { message = "Position name is required." });
    }

    var exists = await db.Positions.AnyAsync(x => x.PositionName == request.PositionName.Trim());
    if (exists)
    {
        return Results.Conflict(new { message = "Position already exists." });
    }

    var entity = new Position { PositionName = request.PositionName.Trim() };
    db.Positions.Add(entity);
    await db.SaveChangesAsync();
    return Results.Created($"/api/positions/{entity.PositionId}", entity);
});

positionsApi.MapPut("/{id:int}", async (int id, PositionRequest request, AppDbContext db) =>
{
    var entity = await db.Positions.FindAsync(id);
    if (entity is null)
    {
        return Results.NotFound();
    }

    if (string.IsNullOrWhiteSpace(request.PositionName))
    {
        return Results.BadRequest(new { message = "Position name is required." });
    }

    entity.PositionName = request.PositionName.Trim();
    await db.SaveChangesAsync();
    return Results.Ok(entity);
});

positionsApi.MapDelete("/{id:int}", async (int id, AppDbContext db) =>
{
    var isUsed = await db.Employees.AnyAsync(x => x.PositionId == id);
    if (isUsed)
    {
        return Results.BadRequest(new { message = "Position is assigned to an employee." });
    }

    var entity = await db.Positions.FindAsync(id);
    if (entity is null)
    {
        return Results.NotFound();
    }

    db.Positions.Remove(entity);
    await db.SaveChangesAsync();
    return Results.NoContent();
});

var employeesApi = api.MapGroup("/employees");
employeesApi.MapGet("/", async (string? search, AppDbContext db) =>
{
    var query = db.Employees
        .Include(x => x.Department)
        .Include(x => x.Position)
        .AsQueryable();

    if (!string.IsNullOrWhiteSpace(search))
    {
        var term = search.Trim().ToLower();
        query = query.Where(x =>
            x.EmployeeNo.ToLower().Contains(term) ||
            x.EmployeeName.ToLower().Contains(term) ||
            x.Email.ToLower().Contains(term) ||
            x.Mobile.ToLower().Contains(term) ||
            x.Phone.ToLower().Contains(term));
    }

    var items = await query
        .OrderBy(x => x.EmployeeName)
        .Select(x => new EmployeeResponse(
            x.Id,
            x.EmployeeNo,
            x.EmployeeName,
            x.Gender,
            x.DepartmentId,
            x.Department != null ? x.Department.DepartmentName : string.Empty,
            x.PositionId,
            x.Position != null ? x.Position.PositionName : string.Empty,
            x.Mobile,
            x.Phone,
            x.Email,
            x.Fax,
            x.Picture
        ))
        .ToListAsync();

    return Results.Ok(items);
});

employeesApi.MapGet("/image-url/{employeeNo}", async (string employeeNo, IConfiguration config, IHttpClientFactory factory) =>
{
    var apiUrl = config["ExternalImageApi:Url"];
    if (string.IsNullOrWhiteSpace(apiUrl))
    {
        return Results.Ok(new { imageUrl = string.Empty, message = "ExternalImageApi.Url is not configured." });
    }

    try
    {
        var client = factory.CreateClient();
        // Call external API with employee_no parameter
        var uri = $"{apiUrl.TrimEnd('?')}" + (apiUrl.Contains('?') ? "&" : "?") + $"employee_no={Uri.EscapeDataString(employeeNo)}";
        
        var options = new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true };
        var response = await client.GetFromJsonAsync<ExternalImageApiResponse>(uri, options);
        
        return Results.Ok(new 
        { 
            imageUrl = response?.picture ?? string.Empty,
            employee_no = response?.employee_no ?? employeeNo,
            message = string.IsNullOrWhiteSpace(response?.picture) ? "No image found" : "Success"
        });
    }
    catch (Exception ex)
    {
        return Results.Ok(new { imageUrl = string.Empty, employee_no = employeeNo, message = $"Failed to fetch image: {ex.Message}" });
    }
});

employeesApi.MapPost("/", async (EmployeeRequest request, AppDbContext db) =>
{
    var validationError = await ValidateEmployeeRequestAsync(request, db);
    if (validationError is not null)
    {
        return validationError;
    }

    var entity = new Employee
    {
        EmployeeNo = request.EmployeeNo.Trim(),
        EmployeeName = request.EmployeeName.Trim(),
        Gender = request.Gender.Trim(),
        DepartmentId = request.DepartmentId,
        PositionId = request.PositionId,
        Mobile = request.Mobile.Trim(),
        Phone = request.Phone.Trim(),
        Email = request.Email.Trim(),
        Fax = request.Fax.Trim(),
        Picture = request.Picture.Trim()
    };

    db.Employees.Add(entity);
    await db.SaveChangesAsync();
    return Results.Created($"/api/employees/{entity.Id}", entity);
});

employeesApi.MapPut("/{id:int}", async (int id, EmployeeRequest request, AppDbContext db) =>
{
    var entity = await db.Employees.FindAsync(id);
    if (entity is null)
    {
        return Results.NotFound();
    }

    var validationError = await ValidateEmployeeRequestAsync(request, db, id);
    if (validationError is not null)
    {
        return validationError;
    }

    entity.EmployeeNo = request.EmployeeNo.Trim();
    entity.EmployeeName = request.EmployeeName.Trim();
    entity.Gender = request.Gender.Trim();
    entity.DepartmentId = request.DepartmentId;
    entity.PositionId = request.PositionId;
    entity.Mobile = request.Mobile.Trim();
    entity.Phone = request.Phone.Trim();
    entity.Email = request.Email.Trim();
    entity.Fax = request.Fax.Trim();
    entity.Picture = request.Picture.Trim();

    await db.SaveChangesAsync();
    return Results.Ok(entity);
});

employeesApi.MapDelete("/{id:int}", async (int id, AppDbContext db) =>
{
    var entity = await db.Employees.FindAsync(id);
    if (entity is null)
    {
        return Results.NotFound();
    }

    db.Employees.Remove(entity);
    await db.SaveChangesAsync();
    return Results.NoContent();
});

// Health check endpoint
app.MapGet("/health", () => Results.Ok(new { status = "healthy" }))
    .WithName("HealthCheck")
    .Produces(200);

// File server for static files
app.UseFileServer();

// SPA fallback - serve index.html for non-API routes
app.MapFallback(async (context) =>
{
    // Don't intercept API requests
    if (context.Request.Path.StartsWithSegments("/api", StringComparison.OrdinalIgnoreCase))
    {
        context.Response.StatusCode = 404;
        await context.Response.CompleteAsync();
        return;
    }

    // For all other paths, serve index.html (SPA routing)
    var indexPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "index.html");
    if (File.Exists(indexPath))
    {
        context.Response.ContentType = "text/html";
        await context.Response.SendFileAsync(indexPath);
    }
    else
    {
        context.Response.StatusCode = 404;
        await context.Response.WriteAsJsonAsync(new { message = "Frontend not found" });
    }
});

app.MapDefaultEndpoints();
app.Run();

static async Task<IResult?> ValidateEmployeeRequestAsync(EmployeeRequest request, AppDbContext db, int? currentId = null)
{
    if (string.IsNullOrWhiteSpace(request.EmployeeNo) || string.IsNullOrWhiteSpace(request.EmployeeName))
    {
        return Results.BadRequest(new { message = "EmployeeNo and EmployeeName are required." });
    }

    var departmentExists = await db.Departments.AnyAsync(d => d.DepartmentId == request.DepartmentId);
    if (!departmentExists)
    {
        return Results.BadRequest(new { message = "Department is invalid." });
    }

    var positionExists = await db.Positions.AnyAsync(p => p.PositionId == request.PositionId);
    if (!positionExists)
    {
        return Results.BadRequest(new { message = "Position is invalid." });
    }

    var duplicateNo = await db.Employees.AnyAsync(e => e.EmployeeNo == request.EmployeeNo.Trim() && (!currentId.HasValue || e.Id != currentId));
    if (duplicateNo)
    {
        return Results.Conflict(new { message = "Employee number already exists." });
    }

    return null;
}

record LoginRequest(string Username, string Password);
record DepartmentRequest(string DepartmentName);
record PositionRequest(string PositionName);
record EmployeeRequest(
    string EmployeeNo,
    string EmployeeName,
    string Gender,
    int DepartmentId,
    int PositionId,
    string Mobile,
    string Phone,
    string Email,
    string Fax,
    string Picture
);

record EmployeeResponse(
    int Id,
    string EmployeeNo,
    string EmployeeName,
    string Gender,
    int DepartmentId,
    string DepartmentName,
    int PositionId,
    string PositionName,
    string Mobile,
    string Phone,
    string Email,
    string Fax,
    string Picture
);

record ImageApiResponse(string ImageUrl);

// External API response model - matches https://apps.singersl.lk/tech/getemployeeimage.php
record ExternalImageApiResponse(
    string employee_no,
    string picture
);
