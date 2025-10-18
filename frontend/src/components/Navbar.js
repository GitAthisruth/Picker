import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/main.css";

export default function Navbar() {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem("token");
  const userRole = localStorage.getItem("role"); // 👈 assuming backend returns "admin" or "user"

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <h2 className="logo">Picker 🛍️</h2>
      <div>
        <Link to="/">Home</Link>
        {isLoggedIn && <Link to="/cart">Cart</Link>}
        {isLoggedIn && <Link to="/orders">Orders</Link>}
        {/* 👇 show only for admin users */}
        {isLoggedIn && userRole === "admin" && <Link to="/admin">Add Product</Link>}
        {!isLoggedIn && <Link to="/login">Login</Link>}
        {!isLoggedIn && <Link to="/register">Register</Link>}
        {isLoggedIn && <button onClick={logout}>Logout</button>}
      </div>
    </nav>
  );
}
