import { useEffect, useState } from "react";
import axiosClient from "../utils/axiosClient";
import { NavLink } from "react-router";

export default function EditProblemList() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axiosClient
      .get("/problem/getAllProblem")
      .then((res) => setProblems(res.data))
      .catch(() => setError("Failed to load problems. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-base-200 text-base-content p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Edit Problems</h1>

      <div className="max-w-4xl mx-auto bg-base-100 p-6 rounded-lg shadow-lg border border-base-300">

        {loading && (
          <div className="flex justify-center py-8">
            <span className="loading loading-spinner loading-lg" />
          </div>
        )}

        {error && (
          <div className="alert alert-error mb-4">{error}</div>
        )}

        {!loading && !error && problems.length === 0 && (
          <p className="text-center opacity-60 py-8">No problems found.</p>
        )}

        {problems.map((p) => (
          <div
            key={p._id}
            className="p-4 border border-base-300 rounded-lg mb-3 flex justify-between items-center"
          >
            <div>
              <p className="font-bold">{p.title}</p>
              <p className="text-sm opacity-60">{p.difficulty}</p>
            </div>
            {/* Route /admin/edit/:id must exist in App.jsx */}
            <NavLink
              to={`/admin/edit/${p._id}`}
              className="btn btn-secondary btn-sm"
            >
              Edit
            </NavLink>
          </div>
        ))}
      </div>
    </div>
  );
}