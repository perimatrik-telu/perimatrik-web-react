import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./Router"; // Import AppRoutes
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext"; // Import ThemeProvider
import { ToastContainer } from 'react-toastify'; // Import ToastContainer
import 'react-toastify/dist/ReactToastify.css'; // Import toastify CSS
import './assets/css/theme.css'; // Import theme CSS

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
          <ToastContainer /> {/* Add ToastContainer here */}
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
