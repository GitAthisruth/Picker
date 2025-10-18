import React, { useEffect, useState } from "react";
import api from "../api";

export default function Dashboard() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api.get("/products").then((res) => setProducts(res.data));
  }, []);

  const addToCart = async (id) => {
    try {
      await api.post("/cart", { product_id: id, quantity: 1 });
      alert("Added to cart!");
    } catch {
      alert("Login required");
    }
  };

  return (
    <div className="dashboard">
      <h2>🛒 Available Products</h2>
      <div className="product-grid">
        {products.map((p) => (
          <div key={p.id} className="product-card">
            <h3>{p.name}</h3>
            <p>{p.description}</p>
            <p>₹{p.price}</p>
            <button onClick={() => addToCart(p.id)}>Add to Cart</button>
          </div>
        ))}
      </div>
    </div>
  );
}
