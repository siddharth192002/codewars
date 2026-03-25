import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from 'zod';
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, NavLink } from "react-router";
import { loginUser } from "../authSlice";

const LoginSchema = z.object({
  emailId: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters")
});

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(LoginSchema)
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = (data) => {
    dispatch(loginUser(data));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title justify-center text-3xl">CodeThrone</h2>

          <form onSubmit={handleSubmit(onSubmit)}>

            {/* EMAIL */}
            <div className="form-control mt-4">
              <label className="label mb-1">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                placeholder="Enter email"
                className={`input input-bordered ${errors.emailId ? 'input-error' : ''}`}
                {...register('emailId')}
              />
              {errors.emailId && (
                <span className="text-error text-sm mt-1">{errors.emailId.message}</span>
              )}
            </div>

            {/* PASSWORD */}
            <div className="form-control mt-4">
              <label className="label mb-1">
                <span className="label-text">Password</span>
              </label>
              <input
                type="password"
                placeholder="Enter password"
                className={`input input-bordered ${errors.password ? 'input-error' : ''}`}
                {...register('password')}
              />
              {errors.password && (
                <span className="text-error text-sm mt-1">{errors.password.message}</span>
              )}
            </div>

            {/* SERVER ERROR — shown when backend rejects login */}
            {error && (
              <div className="alert alert-error mt-4 text-sm">
                {typeof error === 'string' ? error : JSON.stringify(error)}
              </div>
            )}

            {/* SUBMIT */}
            <div className="form-control mt-6">
              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={loading}
              >
                {loading ? <span className="loading loading-spinner loading-sm" /> : 'Login'}
              </button>
            </div>

          </form>

          <p className="text-center text-sm mt-4">
            Don't have an account?{' '}
            <NavLink to="/signup" className="link link-primary">Sign up</NavLink>
          </p>

        </div>
      </div>
    </div>
  );
}

export default Login;