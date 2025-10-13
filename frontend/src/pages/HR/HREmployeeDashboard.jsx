import Navbar from "../../components/Navbar";
import "../EmployeeDashboard/EmployeeDashboard.scss";
import "../../styles/Navbar.scss"

export default function EmployeeDashboard() {
  return (
    <>
      <Navbar />
      <div className="dashboard-container">
        <h1>Employee Dashboard</h1>
        <p>Welcome to HR department</p>
      </div>
    </>
  );
}
