import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./pages/Dashboard";
import { AuthProvider } from "./context/AuthContext";
import AdminDashboard from "./pages/AdminDashboard/AdminDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard/EmployeeDashboard";
import AdminLogin from "./admin/Adminlogin";
import Profile from "./pages/EmployeeDashboard/Profile";
import Home from "./pages/Home";
import Securitykeys from "./pages/AdminDashboard/Securitykeys";
import EmployeeList from "./pages/AdminDashboard/Employeelist";
import AdminList from "./pages/SuperadminDashboard/AminList";
import FIEmployeeDashboard from "./pages/Finance/FIEmployeeDashboard";
import HREmployeeDashboard from "./pages/HR/HREmployeeDashboard";
import ITEmployeeDashboard from "./pages/IT/ITEmployeeDashboard";
import SuperAdminDashboard from "./pages/SuperAdminDashboard/SuperAdminDashboard";

function App() {
  

  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Landing page → Login */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/employee/dashboard" element={<EmployeeDashboard />} />          
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/home" element={<Home />} />
          <Route path="/AdminDashboard" element={<Securitykeys />} />
          <Route path="/employee-list" element={<EmployeeList />} />
          
          {/* Employee Routes */}
          <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
          <Route path="/employee/profile" element={<Profile />} />

          {/* Department Dashboard */}
          <Route path="/finance/dashboard" element={<FIEmployeeDashboard />} />
          <Route path="/hr/dashboard" element={<HREmployeeDashboard />} />
          <Route path="/it/dashboard" element={<ITEmployeeDashboard />} />


          {/** Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        
          {/* Super Admin */}
          <Route path="/SuperAdmin/dashboard" element={<SuperAdminDashboard />} />
          <Route path="/admin-list" element={<AdminList />} />    

          {/* Optional: redirect unknown routes */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
