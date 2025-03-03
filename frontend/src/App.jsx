import React, { useState, useEffect } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import store from "../store/store";
import { loadUserFromLocalStorage } from "../store/actions/authActions";
import desktopImage from "./images/desktop3.png"; // Import the image

// Component Imports
import Confirm from "./components/Confirm";
import Friend from "./components/Friend";
import Home from "./components/Home";
import Tasks from "./components/Tasks";
import Login from "./components/Login";
import Signup from "./components/Signup";
import ForgotPassword from "./components/Forgot";
import PrivateRoute from "./components/PrivateRoute";
import PublicRoute from "./components/PublicRoute";
import Preloader from "./components/Preloader";
import Payment from "./components/Payment";
import Withdrawal from "./components/Withdrawal";
import History from "./components/History";
import Profile from "./components/Profile";
import AuthListener from "./components/AuthListener";
import TermsAndConditions from "./components/Terms";
import InstructionPage from "./components/Instruction";
import Verify from "./components/Verify";
// Styles
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

// Dispatch initial load action
store.dispatch(loadUserFromLocalStorage());

function App() {
  // const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const token = localStorage.getItem("user");
useEffect(() => {
  setTimeout(() => {
    setIsLoading(false);
  }, 1000); // 1 second delay for smooth transition
}, []);

  // useEffect(() => {
  //   const checkDevice = () => {
  //     const userAgent = navigator.userAgent || navigator.vendor || window.opera;

  //     // Strict mobile detection: Requires both a mobile user agent and touch capability
  //     const isTouchDevice =
  //       "ontouchstart" in window ||
  //       navigator.maxTouchPoints > 0 ||
  //       navigator.msMaxTouchPoints > 0;

  //     const isMobileUserAgent = /android|iPhone|iPad|iPod/i.test(userAgent);

  //     // Final condition for detecting real mobile devices
  //     const isMobileDevice = isTouchDevice && isMobileUserAgent;

  //     setIsMobile(isMobileDevice);
  //   };

  //   // Perform initial device check
  //   checkDevice();

  //   // Listen for screen resize events (for DevTools simulation toggling)
  //   const handleResize = () => checkDevice();
  //   window.addEventListener("resize", handleResize);

  //   // Telegram WebApp Initialization
  //   if (window.Telegram?.WebApp) {
  //     const tg = window.Telegram.WebApp;

  //     // Only proceed if the device is detected as mobile
  //     if (isMobile) {
  //       tg.ready();
  //       tg.expand();
  //       tg.disableClosingConfirmation();
  //     }
  //   }

  //   // Remove loading state after setup
  //   setIsLoading(false);

  //   // Cleanup event listener on component unmount
  //   return () => {
  //     window.removeEventListener("resize", handleResize);
  //   };
  // }, [isMobile]);

  useEffect(() => {
    // Prevent body scroll and manage touch gestures within the content area
    document.body.style.overflow = "hidden";

    const content = document.getElementById("scrollable-content");

    const handleTouchStart = (e) => {
      const { scrollTop, scrollHeight, clientHeight } = content;
      content.dataset.scrollStartY = e.touches[0].clientY; // Save the initial touch position

      // Check if scrolling is needed
      if (scrollHeight > clientHeight) {
        content.dataset.isScrollable = true;
      } else {
        content.dataset.isScrollable = false;
      }
    };
    const handleTouchMove = (e) => {
      const { scrollTop, scrollHeight, clientHeight, dataset } = content;
      const deltaY = e.touches[0].clientY - dataset.scrollStartY;

      // Prevent scrolling outside the content area
      if (
        (scrollTop === 0 && deltaY > 0) || // At the top and trying to scroll up
        (scrollTop + clientHeight >= scrollHeight && deltaY < 0) // At the bottom and trying to scroll down
      ) {
        e.preventDefault(); // Stop the event
      }

      // Allow scrolling only if the content is scrollable
      if (dataset.isScrollable === "false") {
        e.preventDefault();
      }
    };

    if (content) {
      content.addEventListener("touchstart", handleTouchStart);
      content.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      });
    }
    return () => {
      document.body.style.overflow = ""; // Restore body scroll
      if (content) {
        content.removeEventListener("touchstart", handleTouchStart);
        content.removeEventListener("touchmove", handleTouchMove);
      }
    };
  }, []);

  if (isLoading) {
    return <Preloader />;
  }
  // if (!isMobile) {
  //   // If not on mobile (desktop or other platforms), show the message and image
  //   return (
  //     <div className="desktop-message">
  //       <img
  //         src={desktopImage}
  //         alt="Open on Mobile"
  //         style={{
  //           width: "100%", // Adjust the width of the image as needed
  //           display: "block", // Make sure it's displayed as a block element
  //         }}
  //       />
  //     </div>
  //   );
  // }

  return (
    <Provider store={store}>
      <BrowserRouter>
        <AuthListener />
        <div
          id="app-container"
          className=" w-screen  h-screen overflow-hidden bg-black"
        >
          {/* Scrollable content */}
          <div
            id="scrollable-content"
            className="h-full w-full overflow-y-auto"
          >
            <Routes>
              {/* Redirect based on token existence */}
              <Route
                path="/"
                element={token ? <Navigate to="/home" /> : <Signup />}
              />

              {/* Public Routes */}
              <Route element={<PublicRoute />}>
                <Route path="/login" element={<Login />} />
                <Route path="/payment/:id" element={<Payment />} />
                <Route path="/forgot" element={<ForgotPassword />} />
                <Route path="/confirm" element={<Confirm />} />
                <Route
                  path="/termsAndCondition"
                  element={<TermsAndConditions />}
                />
                <Route path="/verify" element={<Verify />} />
              </Route>

              {/* Private Routes */}
              <Route element={<PrivateRoute />}>
                <Route path="/home" element={<Home />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/friend" element={<Friend />} />
                <Route path="/withdrawal" element={<Withdrawal />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/history" element={<History />} />
                <Route path="/instruction" element={<InstructionPage />} />
              </Route>
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
