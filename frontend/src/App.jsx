import { useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Toast from "./components/Toast.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import Home from "./pages/Home.jsx";
import SetTask from "./pages/SetTask.jsx";
import ViewTasks from "./pages/ViewTasks.jsx";
import History from "./pages/History.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";

export default function App() {
  const [toast, setToast] = useState("");

  return (
    <AuthProvider>
      <div className="app-shell">
        <Navbar />
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Application Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home onToast={setToast} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/set-task"
            element={
              <ProtectedRoute>
                <SetTask onToast={setToast} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks"
            element={
              <ProtectedRoute>
                <ViewTasks onToast={setToast} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <History onToast={setToast} />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <footer>സമയമുണ്ട് 😂 · Helping students procrastinate with confidence.</footer>
        <Toast message={toast} onClose={() => setToast("")} />
      </div>
    </AuthProvider>
  );
}
