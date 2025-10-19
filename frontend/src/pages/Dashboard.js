import React, { useEffect, useState } from "react";
import Products from "../pages/Products"; // Import your Products component
import api from "../api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Box, CircularProgress } from "@mui/material";

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/products");
      setProducts(res.data);
    } catch {
      toast.error("Failed to load products", { autoClose: 3000 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        sx={{ background: "linear-gradient(to right, #8f94fb, #4e54c8)" }}
      >
        <CircularProgress color="inherit" />
      </Box>
    );
  }

  return (
    <div>
      {/* Render Products component and pass fetchProducts as prop to refresh stock */}
      <Products products={products} refreshProducts={fetchProducts} />
    </div>
  );
}
