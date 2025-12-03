import React from "react";
import { FaDownload } from "react-icons/fa";
import { toast } from "react-toastify";

/**
 * Reusable CSV Download Button
 * @param {Object[]} employees - Array of employee objects
 * @param {string[]} departments - Array of department names
 * @param {Object[]} shoutouts - Array of shoutout objects
 * @param {Object} employeeOfMonth - Employee of the Month object
 * @param {Object[]} topContributors - Array of top contributors [{ name, count }]
 * @param {Object} mostTagged - Most tagged employee { name, count }
 */
const DownloadCSVButton = ({
  employees = [],
  departments = [],
  shoutouts = [],
  employeeOfMonth = null,
  topContributors = [],
  mostTagged = null,
}) => {
  const formatLocalTime = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleDownloadCSV = () => {
    try {
      const csvRows = [];

      // ---------------------- SECTION 1: Employees ----------------------
      csvRows.push("EMPLOYEES");
      csvRows.push("ID,Name,Email,Department");
      employees.forEach((emp) => {
        csvRows.push(
          `${emp.id},"${emp.name || emp.username || "-"}","${emp.email || "-"}","${emp.department || "-"}"`
        );
      });
      csvRows.push("");

      // ---------------------- SECTION 2: Departments ----------------------
      csvRows.push("DEPARTMENTS");
      csvRows.push("Department Name");
      departments.forEach((d) => csvRows.push(`"${d}"`));
      csvRows.push("");

      // ---------------------- SECTION 3: Shoutouts ----------------------
      csvRows.push("SHOUTOUTS");
      csvRows.push("ID,Author,Message,Department,Date,Status");
      shoutouts.forEach((s) => {
        csvRows.push(
          `${s.id},"${s.author_name || "Anonymous"}","${(s.message || "")
            .replace(/"/g, '""')
            .replace(/\n/g, " ")}","${s.department || "-"}","${formatLocalTime(
            s.created_at
          )}","${s.is_reported ? "Reported" : "Clean"}"`
        );
      });
      csvRows.push("");

      // ---------------------- SECTION 4: Employee of the Month ----------------------
      csvRows.push("EMPLOYEE OF THE MONTH");
      if (employeeOfMonth) {
        csvRows.push("Name,Department,Month-Year,Announced On");
        csvRows.push(
          `"${employeeOfMonth.name}","${employeeOfMonth.department}","${employeeOfMonth.month_year || "-"}","${formatLocalTime(
            employeeOfMonth.created_at
          )}"`
        );
      } else {
        csvRows.push("No Employee of the Month announced yet.");
      }
      csvRows.push("");

      // ---------------------- SECTION 5: Top Contributors ----------------------
      csvRows.push("TOP CONTRIBUTORS");
      csvRows.push("Rank,Name,Posts Given");
      if (topContributors && topContributors.length > 0) {
        topContributors.forEach(([name, count], idx) => {
          csvRows.push(`${idx + 1},"${name}",${count}`);
        });
      } else {
        csvRows.push("No contributors data available.");
      }
      csvRows.push("");

      // ---------------------- SECTION 6: Most Tagged ----------------------
      csvRows.push("MOST TAGGED EMPLOYEE");
      if (mostTagged && mostTagged.name) {
        csvRows.push("Name,Times Tagged");
        csvRows.push(`"${mostTagged.name}",${mostTagged.count}`);
      } else {
        csvRows.push("No tagging data available.");
      }

      // ---------------------- CREATE & DOWNLOAD FILE ----------------------
      const csvString = csvRows.join("\n");
      const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `BragBoard_Report_${new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/[:T]/g, "-")}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      toast.success("CSV report downloaded successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate CSV.");
    }
  };

  return (
    <button className="download-btn" onClick={handleDownloadCSV}>
      <FaDownload /> Download CSV
    </button>
  );
};

export default DownloadCSVButton;
