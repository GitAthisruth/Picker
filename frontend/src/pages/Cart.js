import React, { useEffect, useState } from "react";
import api from "../api";

export default function Cart() {
  const [cart, setCart] = useState([]);

  const fetchCart = async () => {
    const res = await api.get("/cart");
    setCart(res.data);
  };

  const placeOrder = async () => {
    await api.post("/orders");
    alert("Order placed!");
    fetchCart();
  };

  useEffect(() => {
    fetchCart();
  }, []);

  return (
    <div className="cart">
      <h2>Your Cart</h2>
      {cart.map((item) => (
        <div key={item.id}>
          {item.product} x {item.quantity} — ₹{item.price}
        </div>
      ))}
      <button onClick={placeOrder}>Place Order</button>
    </div>
  );
}
