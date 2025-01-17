import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  TextField,
  Button,
  Box,
  Avatar,
  CssBaseline,
  Typography,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useAuth } from "../../AuthContext";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { setAuth } = useAuth();

  const handleSubmit = async (e, action) => {
    e.preventDefault();
    const url =
      action === "login"
        ? "http://127.0.0.1:5000/login"
        : "http://127.0.0.1:5000/register";

    try {
      // Send the login request to Flask
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username, // Sending username
          password: password, // Sending password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message); // Login success message

        // Store token and set authentication state
        if (data.token) {
          localStorage.setItem("token", data.token);
          setAuth({ username });

          // Navigate to home page
          navigate("/home");
        }
      } else {
        setMessage(data.message || "An error occurred"); // Error message
      }
    } catch (error) {
      setMessage("Error connecting to server"); // In case of network issues
    }
  };

  return (
    <Container component="main" maxWidth="s">
      <CssBaseline />
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Login
        </Typography>
        <Box
          component="form"
          onSubmit={(e) => handleSubmit(e, "login")}
          sx={{ mt: 1 }}
        >
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            autoComplete=""
            value={username}
            variant="standard"
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            variant="standard"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Typography color="error" component="h1" variant="body2">
            {message}
          </Typography>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            color="primary"
            sx={{ mt: 3 }}
          >
            Log In
          </Button>
          <Button
            fullWidth
            variant="contained"
            size="large"
            color="secondary"
            sx={{ mt: 3, mb: 2 }}
            onClick={(e) => handleSubmit(e, "register")}
          >
            Register
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

export default Login;
