import { NavLink } from "react-router";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axiosClient from "../utils/axiosClient";
import { logoutUser } from "../authSlice";

function HomePage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [problemsPerPage, setProblemsPerPage] = useState(10);

  const [filters, setFilters] = useState({
    difficulty: "all",
    tag: "all",
    status: "all",
  });

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const { data } = await axiosClient.get("/problem/getAllProblem");
        setProblems(data);
      } catch (error) {
        console.error("Error fetching problems:", error);
      }
    };

    const fetchSolvedProblems = async () => {
      try {
        const { data } = await axiosClient.get("/problem/problemSolvedByUser");
        setSolvedProblems(data);
      } catch (error) {
        console.error("Error fetching solved problems:", error);
      }
    };

    fetchProblems();
    if (user) fetchSolvedProblems();
  }, [user]);

  const handleLogout = () => {
    dispatch(logoutUser());
    // solved list cleared by logoutUser.fulfilled in the reducer
    setSolvedProblems([]);
  };

  const filteredProblems = problems.filter((problem) => {
    const difficultyMatch =
      filters.difficulty === "all" || problem.difficulty === filters.difficulty;

    // tags is an array on backend — use .includes() not ===
    const tagMatch =
      filters.tag === "all" ||
      (Array.isArray(problem.tags)
        ? problem.tags.includes(filters.tag)
        : problem.tags === filters.tag);

    const isSolved = solvedProblems.some((sp) => sp._id === problem._id);

    const statusMatch =
      filters.status === "all" ||
      (filters.status === "solved" && isSolved);

    return difficultyMatch && tagMatch && statusMatch;
  });

  const indexOfLast = currentPage * problemsPerPage;
  const indexOfFirst = indexOfLast - problemsPerPage;
  const currentProblems = filteredProblems.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredProblems.length / problemsPerPage);
  const pageNumbers = [...Array(totalPages).keys()].map((n) => n + 1);

  return (
    <div className="min-h-screen bg-base-200">

      {/* NAVBAR */}
      <nav className="navbar bg-base-100 shadow-lg px-4">
        <div className="flex-1">
          <NavLink to="/" className="btn btn-ghost text-xl">CodeThrone</NavLink>
        </div>

        <div className="flex-none flex items-center gap-4">
          <NavLink to="/submissions" className="btn btn-secondary">
            Submissions
          </NavLink>

          {user?.role === "admin" && (
            <NavLink to="/admin" className="btn btn-primary">
              Admin Panel
            </NavLink>
          )}

          {user && <div className="text-sm">Welcome, {user.firstName}</div>}

          <div className="dropdown dropdown-end">
            <div tabIndex={0} className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full bg-neutral text-neutral-content flex items-center justify-center">
                {(user?.firstName?.[0] || user?.emailId?.[0] || "U").toUpperCase()}
              </div>
            </div>
            <ul className="mt-3 p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
              <li><button onClick={handleLogout}>Logout</button></li>
            </ul>
          </div>
        </div>
      </nav>

      {/* CONTENT */}
      <div className="container mx-auto p-4">

        {/* FILTERS */}
        <div className="flex flex-wrap gap-4 mb-6">
          <select
            className="select select-bordered"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="all">All Problems</option>
            <option value="solved">Solved Problems</option>
          </select>

          <select
            className="select select-bordered"
            value={filters.difficulty}
            onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          <select
            className="select select-bordered"
            value={filters.tag}
            onChange={(e) => setFilters({ ...filters, tag: e.target.value })}
          >
            <option value="all">All Tags</option>
            <option value="array">Array</option>
            <option value="linkedlist">Linked List</option>
            <option value="graph">Graph</option>
            <option value="dp">DP</option>
            <option value="string">String</option>
            <option value="hashmap">HashMap</option>
            <option value="tree">Tree</option>
            <option value="stack">Stack</option>
          </select>

          <select
            className="select select-bordered"
            value={problemsPerPage}
            onChange={(e) => {
              setProblemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value={5}>5 / page</option>
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
            <option value={50}>50 / page</option>
          </select>
        </div>

        {/* PROBLEM LIST */}
        <div className="grid gap-4">
          {currentProblems.map((problem) => (
            <NavLink
              key={problem._id}
              to={`/problem/${problem._id}`}
              className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow"
            >
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <h2 className="card-title">{problem.title}</h2>
                  {solvedProblems.some((sp) => sp._id === problem._id) && (
                    <div className="badge badge-success gap-2">Solved</div>
                  )}
                </div>
                <div className="flex gap-2 flex-wrap">
                  <div className={`badge ${getDifficultyBadgeColor(problem.difficulty)}`}>
                    {problem.difficulty}
                  </div>
                  {/* tags is an array — render all of them */}
                  {(Array.isArray(problem.tags) ? problem.tags : [problem.tags]).map((tag) => (
                    <div key={tag} className="badge badge-info">{tag}</div>
                  ))}
                </div>
              </div>
            </NavLink>
          ))}
        </div>

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
            {pageNumbers.map((num) => (
              <button
                key={num}
                onClick={() => setCurrentPage(num)}
                className={`btn btn-sm ${currentPage === num ? "btn-active" : ""}`}
              >
                {num}
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

        {currentProblems.length === 0 && (
          <div className="text-center py-12 text-base-content/60">
            No problems found matching your filters.
          </div>
        )}
      </div>
    </div>
  );
}

const getDifficultyBadgeColor = (difficulty) => {
  switch ((difficulty || "").toLowerCase()) {
    case "easy":   return "badge-success";
    case "medium": return "badge-warning";
    case "hard":   return "badge-error";
    default:       return "badge-neutral";
  }
};

export default HomePage;