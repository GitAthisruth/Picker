import React, { useEffect, useState } from "react";
import api from "../api";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Divider,
  CircularProgress,
  CardActions,
} from "@mui/material";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Cart() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);

  // Fetch cart from backend
  const fetchCart = async () => {
    try {
      const res = await api.get("/cart");
      setCart(res.data);
    } catch {
      toast.error("Failed to load cart. Please login first!", { autoClose: 3000 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // Update cart item quantity
  const changeCartQuantity = async (item, delta) => {
    try {
      const newQty = item.quantity + delta;

      if (newQty < 0) return; // prevent negative
      if (newQty > item.available_stock) {
        toast.error("❌ Cannot exceed stock!", { autoClose: 3000 });
        return;
      }

      await api.patch(`/cart/${item.product_id}`, { quantity: newQty });
      fetchCart();
    } catch {
      toast.error("⚠️ Failed to update cart", { autoClose: 3000 });
    }
  };

  // Delete cart item
  const deleteCartItem = async (item) => {
    try {
      await api.patch(`/cart/${item.product_id}`, { quantity: 0 });
      toast.success("🗑️ Item removed from cart", { autoClose: 2000 });
      fetchCart();
    } catch {
      toast.error("⚠️ Failed to remove item", { autoClose: 3000 });
    }
  };

  // Place order
  const placeOrder = async () => {
    try {
      setPlacingOrder(true);
      await api.post("/orders");
      toast.success("🎉 Order placed successfully!", { autoClose: 3000 });
      fetchCart();
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || "Failed to place order. Please try again.";
      toast.error(`⚠️ ${errorMessage}`, { autoClose: 3000 });
    } finally {
      setPlacingOrder(false);
    }
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

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
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(to right, #8f94fb, #4e54c8)",
        p: 4,
      }}
    >
      <Typography variant="h4" color="white" textAlign="center" fontWeight="bold" gutterBottom>
        🛒 Your Cart
      </Typography>

      {cart.length === 0 ? (
        <Typography color="white" textAlign="center" variant="h6" sx={{ mt: 4 }}>
          Your cart is empty — go add some items! 🛍️
        </Typography>
      ) : (
        <>
          <Grid container spacing={3} justifyContent="center">
            {cart.map((item, index) => (
              <Grid item xs={12} sm={8} md={6} lg={4} key={item.id}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
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
                      <Typography variant="h6" color="primary" fontWeight="bold">
                        {item.product}
                      </Typography>
                      <Typography color="text.secondary">Price: ₹{item.price}</Typography>
                    </CardContent>

                    <CardActions sx={{ justifyContent: "space-between", px: 2, pb: 1 }}>
                      <Button
                        size="small"
                        onClick={() => changeCartQuantity(item, -1)}
                        disabled={item.quantity <= 0}
                      >
                        −
                      </Button>

                      <Typography>{item.quantity}</Typography>

                      <Button
                        size="small"
                        onClick={() => changeCartQuantity(item, 1)}
                        disabled={item.quantity >= item.available_stock}
                      >
                        +
                      </Button>

                      <Button
                        size="small"
                        color="error"
                        onClick={() => deleteCartItem(item)}
                      >
                        🗑️ Delete
                      </Button>
                    </CardActions>

                    {item.available_stock === 0 && (
                      <Typography color="error" variant="body2" sx={{ mt: 1, textAlign: "center" }}>
                        ❌ Out of stock
                      </Typography>
                    )}
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Box textAlign="center">
            <Typography variant="h6" color="white" gutterBottom>
              Total: ₹{totalAmount}
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              onClick={placeOrder}
              disabled={placingOrder}
              sx={{
                backgroundColor: "#ff4081",
                color: "white",
                borderRadius: 2,
                px: 4,
                py: 1,
                "&:hover": { backgroundColor: "#f50057" },
              }}
            >
              {placingOrder ? "Placing Order..." : "Place Order"}
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
}
