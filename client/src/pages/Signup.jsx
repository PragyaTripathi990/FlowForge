import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { signup } from "../api/auth";
import AuthLayout from "../components/AuthLayout";
import { SpinnerIcon } from "../components/Icons";

export default function Signup() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });

  const mutation = useMutation({
    mutationFn: signup,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["currentUser"] });
      toast.success("Welcome to FlowForge");
      navigate("/chains");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Signup failed");
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
      title="Create your account"
      subtitle="Start building AI workflows in a couple of minutes."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-ember-400 hover:text-ember-300">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="name" className="field-label">Full name</label>
          <input
            id="name"
            type="text"
            name="name"
            autoComplete="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Ada Lovelace"
            className="field"
            required
          />
        </div>
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
            autoComplete="new-password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Choose a password"
            className="field"
            required
          />
        </div>
        <button type="submit" disabled={mutation.isPending} className="btn btn-primary btn-lg w-full">
          {mutation.isPending && <SpinnerIcon />}
          {mutation.isPending ? "Creating account…" : "Create account"}
        </button>
      </form>
    </AuthLayout>
  );
}
