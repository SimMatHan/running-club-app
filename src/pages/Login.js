import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // For redirection
import { auth } from "../firebaseConfig";  // Firebase Authentication
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { db } from "../firebaseConfig";  // Firestore
import { doc, setDoc, getDocs, collection, query, where } from "firebase/firestore";  // Firestore methods
import { useAuthState } from "react-firebase-hooks/auth"; // Firebase hook for auth state
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");  // New username field
  const [isRegistering, setIsRegistering] = useState(false);
  const [message, setMessage] = useState("");    // State for feedback messages
  const [error, setError] = useState("");        // State for error messages

  const [user] = useAuthState(auth); // Track authentication state
  const navigate = useNavigate();  // For redirection

  // Redirect authenticated users to the home page
  useEffect(() => {
    if (user) {
      navigate("/"); // Redirect to the home page if the user is logged in
    }
  }, [user, navigate]);

  // Function to handle user registration
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");  // Clear previous errors
    setMessage("");  // Clear previous messages
  
    try {
      // Check if the username is already taken
      const q = query(collection(db, "users"), where("username", "==", username));
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        setError("This username is already taken. Please choose a different username.");
        return;  // Stop registration if username exists
      }
  
      // If username is unique, proceed with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log("Authenticated user:", user); // Debugging
  
      // Store additional user info in Firestore
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        username: username,
        uid: user.uid,
        createdAt: new Date().toISOString(),
      });

  
      console.log("User data successfully written to Firestore"); // Debugging
  
      setMessage("Registration successful!");
      setTimeout(() => navigate("/"), 2000);  // Redirect to home page after successful registration
    } catch (error) {
      console.error("Registration error", error);
  
      // Handle Firebase errors
      switch (error.code) {
        case "auth/email-already-in-use":
          setError("This email address is already in use. Please use a different email.");
          break;
        case "auth/weak-password":
          setError("The password is too weak. Please use a stronger password.");
          break;
        case "auth/invalid-email":
          setError("The email address is not valid. Please enter a valid email.");
          break;
        case "auth/network-request-failed":
          setError("Network error. Please check your internet connection and try again.");
          break;
        default:
          setError("Registration failed. Please try again later.");
      }
    }
  };  

  // Function to handle user login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");  // Clear previous errors
    setMessage("");  // Clear previous messages

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setMessage("Login successful!");
      setTimeout(() => navigate("/"), 2000);  // Redirect to home page after successful login
    } catch (error) {
      console.error("Login error", error);

      // Handle Firebase errors
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
        case "auth/network-request-failed":
          setError("Network error. Please check your internet connection and try again.");
          break;
        default:
          setError("Login failed. Please try again later.");
      }
    }
  };

  return (
    <div className="login-container">
      {/* Welcome text */}
      <h1>
      Welcome to Club Send IT!
      </h1>
      <div className="welcome-text">
        Manage your running records, connect with others, and stay updated with the latest events.
      </div>
      
      <h2>{isRegistering ? "Register" : "Login"}</h2>
  
      {/* Display feedback message */}
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
  
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
  
      <p>
        {isRegistering ? "Already have an account?" : "Don't have an account?"}
      </p>
      <p>
        <button type="register" onClick={() => setIsRegistering(!isRegistering)}>
          {isRegistering ? "Login" : "Register"}
        </button>
      </p>
    </div>
  );
};

export default Login;
