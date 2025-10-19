import React from "react";
import { Link, useNavigate } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { FaSignOutAlt } from "react-icons/fa";
import { motion } from "framer-motion";

export default function Navbar() {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <AppBar
        position="sticky"
        sx={{
          backdropFilter: "blur(10px)",
          background: "rgba(78, 84, 200, 0.85)",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
          borderBottom: "1px solid rgba(255,255,255,0.2)",
        }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between", px: 4 }}>
          <Typography
            variant="h5"
            sx={{
              cursor: "pointer",
              fontWeight: "bold",
              color: "#fff",
              letterSpacing: 0.5,
            }}
            onClick={() => navigate("/")}
          >
            Picker 🛍️
          </Typography>

          <div>
            <Button
              color="inherit"
              component={Link}
              to="/"
              sx={{ mx: 1, fontWeight: 500 }}
            >
              Home
            </Button>
            {isLoggedIn && (
              <Button
                color="inherit"
                component={Link}
                to="/cart"
                sx={{ mx: 1, fontWeight: 500 }}
              >
                Cart
              </Button>
            )}
            {isLoggedIn && (
              <Button
                color="inherit"
                component={Link}
                to="/orders"
                sx={{ mx: 1, fontWeight: 500 }}
              >
                Orders
              </Button>
            )}
            {isLoggedIn && userRole === "admin" && (
              <Button
                color="inherit"
                component={Link}
                to="/admin"
                sx={{ mx: 1, fontWeight: 500 }}
              >
                Add Product
              </Button>
            )}
            {!isLoggedIn && (
              <>
                <Button
                  color="inherit"
                  component={Link}
                  to="/login"
                  sx={{ mx: 1, fontWeight: 500 }}
                >
                  Login
                </Button>
                <Button
                  color="inherit"
                  component={Link}
                  to="/register"
                  sx={{ mx: 1, fontWeight: 500 }}
                >
                  Register
                </Button>
              </>
            )}
            {isLoggedIn && (
              <Button
                color="inherit"
                onClick={logout}
                startIcon={<FaSignOutAlt />}
                sx={{
                  mx: 1,
                  fontWeight: 500,
                  "&:hover": { color: "#ffeb3b" },
                }}
              >
                Logout
              </Button>
            )}
          </div>
        </Toolbar>
      </AppBar>
    </motion.div>
  );
}
