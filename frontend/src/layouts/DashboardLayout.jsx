import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-base-200">
      <Sidebar />

      <main className="flex-1 min-w-0 p-6">
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardLayout;