import { NavLink } from "react-router";
import { Plus, Edit, Trash2 } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-base-300 text-base-content py-16 px-6">
      <div className="max-w-5xl mx-auto flex flex-col items-center">
        
        <h1 className="text-4xl font-bold mb-3">Admin Panel</h1>
        <p className="text-base-content/60 mb-12">Manage coding problems on your platform</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          
          {/* CREATE CARD */}
          <div className="bg-base-100 p-10 rounded-2xl flex flex-col items-center text-center shadow-lg hover:-translate-y-1 transition-transform duration-300">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-6">
              <Plus className="w-8 h-8 text-success" />
            </div>
            <h2 className="text-xl font-bold mb-3">Create Problem</h2>
            <p className="text-sm text-base-content/60 mb-8 flex-1">
              Add a new coding problem to the platform
            </p>
            <NavLink
              to="/admin/create"
              className="btn btn-success text-success-content px-8 rounded-lg font-semibold border-none"
            >
              Create Problem
            </NavLink>
          </div>

          {/* UPDATE CARD */}
          <div className="bg-base-100 p-10 rounded-2xl flex flex-col items-center text-center shadow-lg hover:-translate-y-1 transition-transform duration-300">
            <div className="w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center mb-6">
              <Edit className="w-8 h-8 text-warning" />
            </div>
            <h2 className="text-xl font-bold mb-3">Update Problem</h2>
            <p className="text-sm text-base-content/60 mb-8 flex-1">
              Edit existing problems and their details
            </p>
            <NavLink
              to="/admin/edit-list"
              className="btn btn-warning text-warning-content px-8 rounded-lg font-semibold border-none"
            >
              Update Problem
            </NavLink>
          </div>

          {/* DELETE CARD */}
          <div className="bg-base-100 p-10 rounded-2xl flex flex-col items-center text-center shadow-lg hover:-translate-y-1 transition-transform duration-300">
            <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mb-6">
              <Trash2 className="w-8 h-8 text-error" />
            </div>
            <h2 className="text-xl font-bold mb-3">Delete Problem</h2>
            <p className="text-sm text-base-content/60 mb-8 flex-1">
              Remove problems from the platform
            </p>
            <NavLink
              to="/admin/delete-list"
              className="btn btn-error text-error-content px-8 rounded-lg font-semibold border-none"
            >
              Delete Problem
            </NavLink>
          </div>

        </div>
      </div>
    </div>
  );
}
