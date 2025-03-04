// components/AuthListener.js
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthListener = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleStorageChange = () => {
      const user = localStorage.getItem("user");
      if (!user) {
        navigate("/login");
      }
    };

    // Listen to storage changes
    window.addEventListener("storage", handleStorageChange);

    // Cleanup listener on component unmount
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [navigate]);

  return null;
};

export default AuthListener;
