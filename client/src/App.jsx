import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import ChainList from "./pages/ChainList";
import ChainDetail from "./pages/ChainDetail";
import NewChain from "./pages/NewChain";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedRoute from "./components/ProtectedRoute";

const toastOptions = {
  style: {
    background: "#1c1816",
    color: "#f6f0e9",
    border: "1px solid #3b322c",
    borderRadius: "12px",
    fontSize: "14px",
  },
  success: { iconTheme: { primary: "#ff8f3f", secondary: "#1a0f08" } },
};

function App() {
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} toastOptions={toastOptions} />
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/chains"
            element={
              <ProtectedRoute>
                <ChainList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chains/new"
            element={
              <ProtectedRoute>
                <NewChain />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chains/:chainId"
            element={
              <ProtectedRoute>
                <ChainDetailWrapper />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;

function ChainDetailWrapper() {
  const { chainId } = useParams();
  return <ChainDetail chainId={chainId} />;
}
