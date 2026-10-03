import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import HomePage from "./pages/HomePage";
import RegistrationPage from "./pages/RegistrationPage";
import EQExamPage from "./pages/EQExamPage";
import IQExamPage from "./pages/IQExamPage";
import CompletePage from "./pages/CompletePage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<HomePage />}
        />

        <Route
          path="/registration"
          element={<RegistrationPage />}
        />

        <Route
          path="/eq/exam"
          element={<EQExamPage />}
        />

        <Route
          path="/iq/exam"
          element={<IQExamPage />}
        />

        <Route
          path="/completed"
          element={<CompletePage />}
        />

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;