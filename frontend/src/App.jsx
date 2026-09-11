import { useState } from "react";
import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Toast from "./components/Toast.jsx";
import Home from "./pages/Home.jsx";
import SetTask from "./pages/SetTask.jsx";
import ViewTasks from "./pages/ViewTasks.jsx";
import History from "./pages/History.jsx";

export default function App() {
  const [toast, setToast] = useState("");
  return <div className="app-shell">
    <Navbar/>
    <Routes>
      <Route path="/" element={<Home onToast={setToast}/>}/>
      <Route path="/set-task" element={<SetTask onToast={setToast}/>}/>
      <Route path="/tasks" element={<ViewTasks onToast={setToast}/>}/>
      <Route path="/history" element={<History onToast={setToast}/>}/>
    </Routes>
    <footer>സമയമുണ്ട് 😂 · Helping students procrastinate with confidence.</footer>
    <Toast message={toast} onClose={() => setToast("")}/>
  </div>;
}
