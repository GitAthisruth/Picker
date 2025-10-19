import React, { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  CircularProgress,
} from "@mui/material";
import { motion } from "framer-motion";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/login", form);

      // Store token and role
      localStorage.setItem("token", res.data.token);
      const role =
        res.data.is_admin === true || res.data.is_admin === 1
          ? "admin"
          : "user";
      localStorage.setItem("role", role);

      // Redirect based on role
      navigate(role === "admin" ? "/admin" : "/");
    } catch (err) {
      console.error(err);
      alert("❌ Invalid credentials or server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      sx={{
        background:
          "linear-gradient(135deg, #4e54c8 0%, #8f94fb 50%, #a9c9ff 100%)",
        px: 2,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ width: "100%", maxWidth: 420 }}
      >
        <Card
          sx={{
            borderRadius: 4,
            boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
            backgroundColor: "#fff",
            backdropFilter: "blur(10px)",
          }}
        >
          <CardContent sx={{ textAlign: "center", p: 5 }}>
            <Typography
              variant="h4"
              fontWeight="bold"
              color="primary"
              gutterBottom
            >
              Welcome Back 👋
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              gutterBottom
              sx={{ mb: 2 }}
            >
              Log in to continue to your dashboard
            </Typography>

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                margin="normal"
                label="Email"
                type="email"
                variant="outlined"
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    "&:hover fieldset": { borderColor: "#4e54c8" },
                    "&.Mui-focused fieldset": {
                      borderColor: "#8f94fb",
                      boxShadow: "0 0 8px rgba(79, 86, 230, 0.3)",
                    },
                  },
                }}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Password"
                type="password"
                variant="outlined"
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    "&:hover fieldset": { borderColor: "#4e54c8" },
                    "&.Mui-focused fieldset": {
                      borderColor: "#8f94fb",
                      boxShadow: "0 0 8px rgba(79, 86, 230, 0.3)",
                    },
                  },
                }}
              />

              <Button
                fullWidth
                variant="contained"
                color="primary"
                type="submit"
                sx={{
                  mt: 3,
                  py: 1.4,
                  fontWeight: "bold",
                  borderRadius: 3,
                  textTransform: "none",
                  background:
                    "linear-gradient(to right, #4e54c8, #8f94fb, #a9c9ff)",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
                  "&:hover": {
                    boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
                    background:
                      "linear-gradient(to right, #4348b8, #7b81fa, #90b5ff)",
                  },
                }}
                disabled={loading}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Login"
                )}
              </Button>
            </form>

            <Typography variant="body2" sx={{ mt: 3 }}>
              Don’t have an account?{" "}
              <span
                style={{
                  color: "#4e54c8",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
                onClick={() => navigate("/register")}
              >
                Register
              </span>
            </Typography>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
}
