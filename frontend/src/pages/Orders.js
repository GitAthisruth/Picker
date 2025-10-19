import React, { useEffect, useState } from "react";
import api from "../api";
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Grid,
  Chip,
  Divider,
} from "@mui/material";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/orders")
      .then((res) => setOrders(res.data))
      .catch(() => toast.error("Failed to load orders"))
      .finally(() => setLoading(false));
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
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(to right, #8f94fb, #4e54c8)",
        p: 4,
      }}
    >
      <Typography
        variant="h4"
        color="white"
        textAlign="center"
        fontWeight="bold"
        gutterBottom
      >
        📦 Your Orders
      </Typography>

      {orders.length === 0 ? (
        <Typography color="white" textAlign="center" variant="h6" sx={{ mt: 4 }}>
          You haven’t placed any orders yet 🛒
        </Typography>
      ) : (
        <Grid container spacing={3} justifyContent="center">
          {orders.map((o, index) => (
            <Grid item xs={12} sm={8} md={6} lg={4} key={o.order_id}>
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
                    "&:hover": { transform: "scale(1.02)" },
                  }}
                >
                  <CardContent>
                    <Typography
                      variant="h6"
                      color="primary"
                      fontWeight="bold"
                      gutterBottom
                    >
                      Order #{o.order_id}
                    </Typography>
                    <Typography color="text.secondary">
                      Total: ₹{o.total_amount}
                    </Typography>

                    <Chip
                      label={o.status || "Processing"}
                      color={
                        o.status === "Delivered"
                          ? "success"
                          : o.status === "Cancelled"
                          ? "error"
                          : "warning"
                      }
                      size="small"
                      sx={{ mt: 1 }}
                    />

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="subtitle2" fontWeight="bold">
                      Items:
                    </Typography>
                    <ul style={{ marginTop: "8px", paddingLeft: "20px" }}>
                      {o.items.map((i, idx) => (
                        <li key={idx}>
                          {i.product} x {i.quantity} — ₹{i.price}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
