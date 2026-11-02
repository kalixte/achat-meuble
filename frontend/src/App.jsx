
import sidebar from "./components/sidebar";
import Dashboard from "./Pages/Dashboard";

function App() {
  return (
    <div className="flex min-h-screen">
      <sidebar />
      <Dashboard />
    </div>
  );
}

export default App;
