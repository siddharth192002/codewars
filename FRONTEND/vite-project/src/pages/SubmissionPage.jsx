import { useEffect, useState } from "react";
import axiosClient from "../utils/axiosClient";
import { NavLink } from "react-router";

export default function SubmissionPage() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const submissionsPerPage = 10;

  useEffect(() => {
    axiosClient
      .get("/submission/getSubmissionByUser")
      .then(({ data }) => setSubmissions(data))
      .catch(() => setError("Failed to load submissions. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  const indexOfLast = currentPage * submissionsPerPage;
  const indexOfFirst = indexOfLast - submissionsPerPage;
  const currentSubmissions = submissions.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(submissions.length / submissionsPerPage);

  // Backend stores status as: 'accepted' | 'wrong' | 'error' | 'pending'
  const getStatusBadge = (status) => {
    switch (status) {
      case "accepted": return <span className="badge badge-success">Accepted</span>;
      case "wrong":    return <span className="badge badge-error">Wrong Answer</span>;
      case "error":    return <span className="badge badge-warning">Runtime Error</span>;
      case "pending":  return <span className="badge badge-neutral">Pending</span>;
      default:         return <span className="badge badge-neutral">{status || "—"}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-base-200 text-base-content p-6">
      <div className="max-w-5xl mx-auto">

        <h1 className="text-3xl font-bold mb-6">Your Submissions</h1>

        {loading && (
          <div className="flex justify-center py-10">
            <span className="loading loading-spinner loading-lg" />
          </div>
        )}

        {error && (
          <div className="alert alert-error mb-4">{error}</div>
        )}

        {!loading && !error && submissions.length === 0 && (
          <div className="text-center py-10 text-base-content/60">
            You haven't submitted any problems yet.
          </div>
        )}

        {!loading && !error && submissions.length > 0 && (
          <div className="overflow-x-auto rounded-lg shadow-lg bg-base-100 border border-base-300">
            <table className="table table-zebra w-full">
              <thead>
                <tr className="text-base">
                  <th>#</th>
                  <th>Problem</th>
                  <th>Language</th>
                  <th>Status</th>
                  <th>Passed</th>
                  <th>Submitted At</th>
                </tr>
              </thead>
              <tbody>
                {currentSubmissions.map((s, index) => (
                  <tr key={s._id}>
                    <th>{indexOfFirst + index + 1}</th>

                    <td className="font-semibold">
                      <NavLink
                        className="link link-hover link-primary"
                        to={`/problem/${s.problemId?._id}`}
                      >
                        {s.problemId?.title ?? "Unknown Problem"}
                      </NavLink>
                    </td>

                    <td>{s.language}</td>

                    {/* fixed: was s.verdict — backend field is s.status */}
                    <td>{getStatusBadge(s.status)}</td>

                    {/* fixed: was s.testCasesPassesd (typo) and s.totalTestCases
                        backend schema fields are testCasesPassed and testCasesTotal */}
                    <td>{s.testCasesPassed ?? 0}/{s.testCasesTotal ?? 0}</td>

                    <td>{new Date(s.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6 gap-2">
            <button
              className="btn btn-sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              « Prev
            </button>
            {[...Array(totalPages).keys()].map((num) => (
              <button
                key={num}
                className={`btn btn-sm ${currentPage === num + 1 ? "btn-active" : ""}`}
                onClick={() => setCurrentPage(num + 1)}
              >
                {num + 1}
              </button>
            ))}
            <button
              className="btn btn-sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next »
            </button>
          </div>
        )}

      </div>
    </div>
  );
}