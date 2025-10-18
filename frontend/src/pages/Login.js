import React, { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const res = await api.post("/auth/login", form);

    // Store token
    localStorage.setItem("token", res.data.token);

    // Store role safely
    const role = res.data.is_admin === true || res.data.is_admin === 1 ? "admin" : "user";
    localStorage.setItem("role", role);

    // Redirect
    if (role === "admin") navigate("/admin");
    else navigate("/");

  } catch (err) {
    console.error(err);
    alert("Invalid credentials or server error");
  }
};


  return (
    <div className="form-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
