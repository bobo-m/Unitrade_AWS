import React, { useEffect } from "react";

const KeyboardFix = () => {
  useEffect(() => {
    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);

    if (isIOS) {
      // Function to adjust the view when the keyboard appears
      const adjustView = () => {
        const activeElement = document.activeElement;
        if (activeElement && (activeElement.tagName === "INPUT" || activeElement.tagName === "TEXTAREA")) {
          setTimeout(() => {
            activeElement.scrollIntoView({ behavior: "smooth", block: "center" });
          }, 300); // Delay to allow keyboard to fully appear
        }
      };

      // Reset height when the keyboard hides
      const resetView = () => {
        document.body.style.height = "100vh";
        document.body.style.overflow = "auto";
      };

      window.addEventListener("focusin", adjustView); // Input focus
      window.addEventListener("focusout", resetView); // Input blur

      return () => {
        window.removeEventListener("focusin", adjustView);
        window.removeEventListener("focusout", resetView);
      };
    }
  }, []);

  return null;
};

export default KeyboardFix;
