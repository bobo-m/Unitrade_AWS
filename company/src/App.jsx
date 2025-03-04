import React, { useState, useEffect } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { loadUserFromLocalStorage } from "../store/actions/authActions";
import Home from "./components/Home";
import Login from "./components/Login";
import ChangePassword from "./components/ChangePassword";
import Forgot from "./components/Forgot";
import PrivateRoute from "./components/PrivateRoute";
import PublicRoute from "./components/PublicRoute";
import Preloader from "./components/Preloader"; // Import the Preloader component
import Withdrawal from "./components/Withdrawal";
import History from "./components/History";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import { Provider } from "react-redux";
import store from "../store/store";
import Profile from "./components/Profile";
import AuthListener from "./components/AuthListener"; // Import AuthListener
import KeyboardFix from "./components/KeyboardFix"; // Import the KeyboardPaddingFix component


store.dispatch(loadUserFromLocalStorage());
function App({ Component, pageProps }) {
  const [isLoading, setIsLoading] = useState(true);
  const token = localStorage.getItem("user");

  useEffect(() => {
    // Initialize Telegram WebApp
    if (window.Telegram && window.Telegram.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      tg.disableVerticalSwipes(); // Disable vertical swipes on mobile
      tg.disableClosingConfirmation();

    }
 


 


    // Timer for preloader
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, []);
  // Add this to your main component (e.g., App.js or a custom hook)




  if (isLoading) {
    return <Preloader />; // Show preloader while loading
  }
  return (
    <Provider store={store}>
      {" "}
      {/* <KeyboardFix /> */}
      <BrowserRouter>
        <AuthListener />
        <Routes>

          <Route
            path="/"
            element={token ? <Navigate to="/home" /> : <Login />}
          />

          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/forgot" element={<Forgot />} />
          </Route>

          <Route element={<PrivateRoute />}>
            <Route path="/home" element={<Home />} />
            <Route path="/withdrawal" element={<Withdrawal />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/history" element={<History />} />
            <Route path="/changePassword" element={<ChangePassword />} />
          </Route>
        </Routes>

      </BrowserRouter>
    </Provider>
  );
}

export default App;
