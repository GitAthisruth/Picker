import React, { useEffect, useState } from "react";
import api from "../api";

export default function Products() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api.get("/products")
      .then((res) => setProducts(res.data))
      .catch(() => alert("Failed to load products"));
  }, []);

  const addToCart = async (id) => {
    try {
      await api.post("/cart", { product_id: id, quantity: 1 });
      alert("Added to cart!");
    } catch {
      alert("Please login first!");
    }
  };

  return (
    <div className="container">
      <h2>Available Products</h2>
      {products.map((p) => (
        <div key={p.id} className="card">
          <h4>{p.name}</h4>
          <p>{p.description}</p>
          <p>Price: ₹{p.price}</p>
          <button onClick={() => addToCart(p.id)}>Add to Cart</button>
        </div>
      ))}
    </div>
  );
}
