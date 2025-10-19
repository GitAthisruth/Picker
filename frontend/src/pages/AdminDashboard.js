import React, { useState } from "react";
import api from "../api";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { motion } from "framer-motion";

export default function AdminDashboard() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/products", {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        stock: parseInt(form.stock),
      });
      setAlert({
        open: true,
        message: "✅ Product added successfully!",
        severity: "success",
      });
      setForm({ name: "", description: "", price: "", stock: "" });
    } catch {
      setAlert({
        open: true,
        message: "❌ Error: Only admins can add products!",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(to right, #8f94fb, #4e54c8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 3,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Paper
          elevation={8}
          sx={{
            p: 5,
            width: "400px",
            borderRadius: 4,
            textAlign: "center",
            backgroundColor: "rgba(255,255,255,0.95)",
          }}
        >
          <Typography variant="h5" fontWeight="bold" color="primary" gutterBottom>
            🛍️ Add New Product
          </Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Product Name"
              name="name"
              variant="outlined"
              margin="normal"
              required
              value={form.name}
              onChange={handleChange}
            />
            <TextField
              fullWidth
              label="Description"
              name="description"
              variant="outlined"
              margin="normal"
              multiline
              rows={2}
              value={form.description}
              onChange={handleChange}
            />
            <TextField
              fullWidth
              label="Price (₹)"
              name="price"
              variant="outlined"
              margin="normal"
              type="number"
              required
              value={form.price}
              onChange={handleChange}
            />
            <TextField
              fullWidth
              label="Stock Quantity"
              name="stock"
              variant="outlined"
              margin="normal"
              type="number"
              required
              value={form.stock}
              onChange={handleChange}
            />

            <Box mt={3}>
              <Button
                type="submit"
                variant="contained"
                color="secondary"
                size="large"
                fullWidth
                disabled={loading}
                sx={{
                  borderRadius: 3,
                  py: 1.2,
                  fontWeight: "bold",
                  backgroundColor: "#ff4081",
                  "&:hover": { backgroundColor: "#f50057" },
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Add Product"}
              </Button>
            </Box>
          </form>
        </Paper>
      </motion.div>

      <Snackbar
        open={alert.open}
        autoHideDuration={3000}
        onClose={() => setAlert({ ...alert, open: false })}
      >
        <Alert
          severity={alert.severity}
          sx={{ width: "100%", borderRadius: "8px" }}
          onClose={() => setAlert({ ...alert, open: false })}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
