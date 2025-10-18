import React, { useEffect, useState } from "react";
import api from "../api";

export default function Orders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api.get("/orders").then((res) => setOrders(res.data));
  }, []);

  return (
    <div className="orders">
      <h2>Your Orders</h2>
      {orders.map((o) => (
        <div key={o.order_id} className="order-card">
          <h4>Order #{o.order_id}</h4>
          <p>Total: ₹{o.total_amount}</p>
          <p>Status: {o.status}</p>
          <ul>
            {o.items.map((i, idx) => (
              <li key={idx}>{i.product} x {i.quantity} — ₹{i.price}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
