import { NavLink } from "react-router";

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-base-200 text-base-content flex justify-center items-center p-6">
      <div className="bg-base-100 p-10 rounded-xl shadow-xl w-full max-w-lg border border-base-300">
        
        <h1 className="text-3xl font-bold text-center mb-8">
          Admin Dashboard
        </h1>

        <div className="flex flex-col gap-6">

          {/* CREATE BUTTON */}
          <NavLink
            to="/admin/create"
            className="btn btn-primary btn-lg w-full"
          >
            Create New Problem
          </NavLink>

          {/* EDIT BUTTON */}
          <NavLink
            to="/admin/edit-list"
            className="btn btn-secondary btn-lg w-full"
          >
            Edit Existing Problems
          </NavLink>

          {/* DELETE BUTTON */}
          <NavLink
            to="/admin/delete-list"
            className="btn btn-error btn-lg w-full"
          >
            Delete Problems
          </NavLink>
        </div>
      </div>
    </div>
  );
}
