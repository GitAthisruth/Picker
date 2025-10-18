import React, { useState } from "react";
import api from "../api";

export default function AdminDashboard() {
  const [form, setForm] = useState({ name: "", description: "", price: "", stock: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/products", {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        stock: parseInt(form.stock)
      });
      alert("Product added!");
      setForm({ name: "", description: "", price: "", stock: "" });
    } catch (err) {
      alert("Error: Only admins can add products!");
    }
  };

  return (
    <div className="admin-dashboard">
      <h2>Add New Product</h2>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Product Name" value={form.name} onChange={handleChange} required />
        <input name="description" placeholder="Description" value={form.description} onChange={handleChange} />
        <input name="price" placeholder="Price" type="number" value={form.price} onChange={handleChange} required />
        <input name="stock" placeholder="Stock" type="number" value={form.stock} onChange={handleChange} required />
        <button type="submit">Add Product</button>
      </form>
    </div>
  );
}
