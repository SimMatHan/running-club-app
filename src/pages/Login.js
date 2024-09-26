import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebaseConfig";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { db } from "../firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");  // Only required for registration
  const [isRegistering, setIsRegistering] = useState(false);  // Toggle between login and register
  const [error, setError] = useState("");  // Error messages
  const [message, setMessage] = useState("");  // Success message

  const [user] = useAuthState(auth);  // Check if the user is already logged in
  const navigate = useNavigate();  // For navigation

  // Redirect authenticated users to the home page
  useEffect(() => {
    if (user) {
      navigate("/");  // Redirect to home page if the user is logged in
    }
  }, [user, navigate]);

  // Simplified user registration
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");  // Clear previous errors
    setMessage("");

    if (password.length < 6) {
      setError("Password should be at least 6 characters.");
      return;
    }

    try {
      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save user data to Firestore
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        username: username,
        uid: user.uid,
        createdAt: new Date().toISOString(),
        showGuide: true  // Default value, can be updated later
      });

      setMessage("Registration successful!");
      navigate("/");  // Redirect to home page after successful registration
    } catch (error) {
      console.error("Registration error:", error);
      setError("An error occurred during registration. Please try again.");
    }
  };

  // Simplified user login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");  // Clear previous errors
    setMessage("");

    try {
      // Login with Firebase Authentication
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");  // Redirect to home page after successful login
    } catch (error) {
      console.error("Login error:", error);

      // Handle Firebase login errors
      switch (error.code) {
        case "auth/wrong-password":
          setError("Incorrect password. Please try again.");
          break;
        case "auth/user-not-found":
          setError("No account found with this email. Please register first.");
          break;
        case "auth/invalid-email":
          setError("Invalid email format. Please enter a valid email.");
          break;
        default:
          setError("Login failed. Please try again later.");
      }
    }
  };

  return (
    <div className="login-container">
      <h1>Welcome to Club Send IT!</h1>
      <div className="welcome-text">
        Manage your running records, connect with others, and stay updated with the latest events.
      </div>
      
      <h2>{isRegistering ? "Register" : "Login"}</h2>

      {/* Display feedback messages */}
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}

      {/* Login/Register form */}
      <form onSubmit={isRegistering ? handleRegister : handleLogin}>
        {isRegistering && (
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">{isRegistering ? "Register" : "Login"}</button>
      </form>

      {/* Toggle between Register and Login */}
      <p>{isRegistering ? "Already have an account?" : "Don't have an account?"}</p>
      <p>
        <button onClick={() => setIsRegistering(!isRegistering)}>
          {isRegistering ? "Login" : "Register"}
        </button>
      </p>
    </div>
  );
};

export default Login;
