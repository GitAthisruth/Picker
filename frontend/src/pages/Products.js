import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Grid,
  CircularProgress,
} from "@mui/material";
import { motion } from "framer-motion";
import api from "../api";
import { toast } from "react-toastify";

export default function Products({ products, refreshProducts }) {
  const [cart, setCart] = useState([]);
  const [loadingCart, setLoadingCart] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if user is logged in (token exists)
  const token = localStorage.getItem("token");
  useEffect(() => {
    setIsLoggedIn(!!token);
  }, [token]);

  // Fetch user cart to check quantity
  const fetchCart = async () => {
    if (!token) {
      setLoadingCart(false);
      return; // skip fetching if not logged in
    }

    try {
      const res = await api.get("/cart");
      setCart(res.data);
    } catch (err) {
      console.error(err);
      toast.error("⚠️ Failed to load cart", { autoClose: 3000 });
    } finally {
      setLoadingCart(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [token]);

  const addToCart = async (product) => {
    if (!token) {
      toast.error("⚠️ Please login first!", { autoClose: 3000 });
      return;
    }

    try {
      // Check cart quantity
      const cartItem = cart.find((item) => item.product_id === product.id);
      const cartQty = cartItem ? cartItem.quantity : 0;

      if (cartQty >= product.stock) {
        toast.error("❌ Cannot add more than available stock!", { autoClose: 3000 });
        return;
      }

      await api.post("/cart", { product_id: product.id, quantity: 1 });
      toast.success("✅ Added to cart!", { autoClose: 3000 });

      // Refresh cart and products
      fetchCart();
      if (refreshProducts) refreshProducts();
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        toast.error("⚠️ Please login first!", { autoClose: 3000 });
      } else if (err.response?.data?.error) {
        toast.error(`⚠️ ${err.response.data.error}`, { autoClose: 3000 });
      } else {
        toast.error("⚠️ Something went wrong!", { autoClose: 3000 });
      }
    }
  };

  if (!products || products.length === 0 || loadingCart) {
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
    <Box sx={{ minHeight: "100vh", background: "linear-gradient(to right, #8f94fb, #4e54c8)", p: 4 }}>
      <Typography variant="h4" color="white" textAlign="center" fontWeight="bold" gutterBottom>
        🛍️ Available Products
      </Typography>

      <Grid container spacing={3} justifyContent="center">
        {products.map((p, index) => {
          const cartItem = cart.find((item) => item.product_id === p.id);
          const cartQty = cartItem ? cartItem.quantity : 0;
          const isOutOfStock = p.stock === 0 || cartQty >= p.stock;

          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={p.id}>
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
              >
                <Card
                  sx={{
                    borderRadius: 3,
                    boxShadow: 5,
                    backgroundColor: "#fff",
                    transition: "transform 0.3s ease",
                    "&:hover": { transform: "scale(1.03)" },
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" color="primary" gutterBottom>
                      {p.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {p.description || "No description available."}
                    </Typography>
                    <Typography variant="h6" color="secondary" sx={{ mt: 1, fontWeight: "bold" }}>
                      ₹{p.price}
                    </Typography>
                    {isOutOfStock && (
                      <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                        ❌ Out of Stock
                      </Typography>
                    )}
                  </CardContent>
                  <CardActions sx={{ justifyContent: "center", pb: 2 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      size="large"
                      onClick={() => addToCart(p)}
                      disabled={isOutOfStock || !isLoggedIn}
                      sx={{ borderRadius: 2, textTransform: "none", fontWeight: "bold" }}
                    >
                      {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                    </Button>
                  </CardActions>
                </Card>
              </motion.div>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
