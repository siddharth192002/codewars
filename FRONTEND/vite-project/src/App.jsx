import { Routes, Route, Navigate } from "react-router";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminDashboard from "./pages/AdminDashboard";
import EditProblemList from "./pages/EditProblemList";
import DeleteProblemList from "./pages/DeleteProblemList";
import AdminPanel from "./pages/AdminPanel";
import SubmissionPage from "./pages/SubmissionPage";
import HomePage from "./pages/Homepage";
import ProblemPage from "./pages/ProblemPage";
import EditProblem from "./pages/EditProblem";

import { checkUser } from "./authSlice";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkUser());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  const isAdmin = isAuthenticated && user?.role === 'admin';

  return (
    <Routes>
      {/* Public / auth routes */}
      <Route path="/login"  element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
      <Route path="/signup" element={isAuthenticated ? <Navigate to="/" /> : <Signup />} />

      {/* Protected user routes */}
      <Route path="/"           element={isAuthenticated ? <HomePage />      : <Navigate to="/signup" />} />
      <Route path="/submissions" element={isAuthenticated ? <SubmissionPage /> : <Navigate to="/login" />} />
      <Route path="/problem/:problemId" element={isAuthenticated ? <ProblemPage /> : <Navigate to="/login" />} />

      {/* Protected admin routes */}
      <Route path="/admin"             element={isAdmin ? <AdminDashboard />   : <Navigate to="/" />} />
      <Route path="/admin/create"      element={isAdmin ? <AdminPanel />       : <Navigate to="/" />} />
      <Route path="/admin/edit-list"   element={isAdmin ? <EditProblemList />  : <Navigate to="/" />} />
      <Route path="/admin/delete-list" element={isAdmin ? <DeleteProblemList />: <Navigate to="/" />} />
      <Route path="/admin/edit/:id"    element={isAdmin ? <EditProblem />      : <Navigate to="/" />} />

    </Routes>
  );
}

export default App;