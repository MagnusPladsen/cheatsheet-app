import { BrowserRouter, Routes, Route } from "react-router";
import LandingPage from "./pages/LandingPage.tsx";
import CheatsheetApp from "./pages/CheatsheetApp.tsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={<CheatsheetApp />} />
      </Routes>
    </BrowserRouter>
  );
}
