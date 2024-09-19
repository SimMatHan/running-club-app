import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // For redirection
import { auth } from "../firebaseConfig";  // Firebase Authentication
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { db } from "../firebaseConfig";  // Firestore
import { doc, setDoc, getDocs, collection, query, where } from "firebase/firestore";  // Firestore methods
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");  // New username field
  const [isRegistering, setIsRegistering] = useState(false);
  const [message, setMessage] = useState("");    // State for feedback messages
  const [error, setError] = useState("");        // State for error messages

  const navigate = useNavigate();  // For redirecting to the home page

  // Function to handle user login
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setMessage("Login successful!");
      setError(""); // Clear errors if any
      navigate("/");  // Redirect to home page after login
    } catch (error) {
      console.error("Login error", error);
      setError("Login failed: " + error.message);  // Display login error
    }
  };

  // Function to check if the username is already in use
  const checkUsernameExists = async (username) => {
    const q = query(collection(db, "users"), where("username", "==", username));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;  // Return true if username exists
  };

  // Function to handle user registration
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // Check if username is already taken
      const usernameExists = await checkUsernameExists(username);
      if (usernameExists) {
        setError("Username is already taken.");
        return;
      }

      // Create a new user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Store additional user info in Firestore
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        username: username,  // Store the username entered during registration
        uid: user.uid,
        createdAt: new Date().toISOString(),  // Add a creation timestamp
      });

      setMessage("Registration successful!");
      setError(""); // Clear any errors
      navigate("/");  // Redirect to home page after successful registration
    } catch (error) {
      console.error("Registration error", error);
      setError("Registration failed: " + error.message);  // Display registration error
    }
  };

  return (
    <div className="login-container">
      <h1>{isRegistering ? "Register" : "Login"}</h1>

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
        <button onClick={() => setIsRegistering(!isRegistering)}>
          {isRegistering ? "Login" : "Register"}
        </button>
      </p>
    </div>
  );
};

export default Login;
