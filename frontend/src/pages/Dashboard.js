import React, { useEffect, useState } from "react";
import api from "../api";
import {
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Typography,
  Grid,
  CircularProgress,
} from "@mui/material";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/products")
      .then((res) => setProducts(res.data))
      .catch(() => toast.error("Failed to load products"))
      .finally(() => setLoading(false));
  }, []);

  const addToCart = async (id) => {
    try {
      await api.post("/cart", { product_id: id, quantity: 1 });
      toast.success("✅ Added to cart!");
    } catch {
      toast.error("⚠️ Please login or check stock!");
    }
  };

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
        🛍️ Available Products
      </Typography>

      <Grid container spacing={3} justifyContent="center">
        {products.map((p, index) => (
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
                  <Typography
                    variant="h6"
                    color="secondary"
                    sx={{ mt: 1, fontWeight: "bold" }}
                  >
                    ₹{p.price}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: "center", pb: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => addToCart(p.id)}
                    sx={{
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: "bold",
                    }}
                  >
                    Add to Cart
                  </Button>
                </CardActions>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
