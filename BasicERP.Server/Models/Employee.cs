namespace PhoneBookApp.Server.Models;

public class Employee
{
    public int Id { get; set; }
    public string EmployeeNo { get; set; } = string.Empty;
    public string EmployeeName { get; set; } = string.Empty;
    public string Gender { get; set; } = string.Empty;
    public int DepartmentId { get; set; }
    public int PositionId { get; set; }
    public string Mobile { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Fax { get; set; } = string.Empty;
    public string Picture { get; set; } = string.Empty;

    public Department? Department { get; set; }
    public Position? Position { get; set; }
}
