import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { ThemeProvider } from "@/components/theme-provider"
import { ModeToggle } from "@/components/mode-toggle"
import LoginPage from "@/pages/Login"
import AdminDashboard from "@/pages/AdminDashboard"
import UserDashboard from "@/pages/UserDashboard"


// Prosty komponent strony głównej (to co mieliśmy wcześniej, ale uproszczone)
function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-4xl font-bold text-primary">Róża Różańcowa</h1>
      <a href="/login" className="text-blue-500 hover:underline">Przejdź do logowania</a>
    </div>
  )
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="absolute top-4 right-4 z-50">
        <ModeToggle />
      </div>
      
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/dashboard" element={<UserDashboard />} />
          {/* Przekierowanie nieznanych adresów na stronę główną */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App