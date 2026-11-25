import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { login } from "../api/auth";
import AuthLayout from "../components/AuthLayout";
import { SpinnerIcon } from "../components/Icons";

export default function Login() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({ email: "", password: "" });

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["currentUser"] });
      toast.success("Welcome back!");
      navigate("/chains");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Login failed");
    },
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to pick up where your workflows left off."
      footer={
        <>
          New to FlowForge?{" "}
          <Link to="/signup" className="font-semibold text-ember-400 hover:text-ember-300">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="field-label">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            className="field"
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="field-label">Password</label>
          <input
            id="password"
            type="password"
            name="password"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Your password"
            className="field"
            required
          />
        </div>
        <button type="submit" disabled={mutation.isPending} className="btn btn-primary btn-lg w-full">
          {mutation.isPending && <SpinnerIcon />}
          {mutation.isPending ? "Logging in…" : "Log in"}
        </button>
      </form>
    </AuthLayout>
  );
}
