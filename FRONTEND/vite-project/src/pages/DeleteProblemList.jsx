import { useEffect, useState } from "react";
import axiosClient from "../utils/axiosClient";

export default function DeleteProblemList() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null); // tracks which problem is being deleted

  useEffect(() => {
    axiosClient
      .get("/problem/getAllProblem")
      .then((res) => setProblems(res.data))
      .catch(() => setError("Failed to load problems. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  const deleteProblem = async (id) => {
    if (!window.confirm("Are you sure you want to delete this problem?")) return;

    setDeletingId(id);
    try {
      await axiosClient.delete(`/problem/delete/${id}`);
      setProblems((prev) => prev.filter((p) => p._id !== id));
    } catch {
      alert("Failed to delete problem. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 text-base-content p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Delete Problems</h1>

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
            <button
              onClick={() => deleteProblem(p._id)}
              className="btn btn-error btn-sm"
              disabled={deletingId === p._id}
            >
              {deletingId === p._id
                ? <span className="loading loading-spinner loading-xs" />
                : "Delete"
              }
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}