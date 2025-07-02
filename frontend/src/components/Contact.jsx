import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faGlobe,
  faArrowLeft,
  faMapMarkerAlt,
} from "@fortawesome/free-solid-svg-icons";
import logo from "../assets/logo/U.png";
import { useNavigate } from "react-router-dom";

const ContactUs = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-black flex justify-center items-center h-screen p-6">
      <div className="w-full h-full relative max-w-sm bg-black rounded-lg text-white shadow-lg overflow-hidden p-6 gap-6 flex flex-col justify-center items-center border border-gray-700">
        {/* Back Button */}
        <div className="w-full flex justify-start absolute top-6 left-6">
          <button
            onClick={() => navigate(-1)}
            className="text-blue-400 hover:text-blue-300 flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="w-5 h-5" />
            Back
          </button>
        </div>
        {/* Logo */}
        <div className="w-full flex flex-col items-center justify-center">
          <img src={logo} alt="Logo" className="w-20 h-20 opacity-90" />
        </div>

        {/* Heading */}
        <h2 className="text-2xl font-semibold text-white text-center">
          Contact Us
        </h2>

        {/* Description */}
        <p className="text-gray-300 text-center">
          Get in touch with with Unitrade Hub - A Subsidiary of UNIDIGITIZE
          PRIVATE LIMITED
        </p>

        {/* Contact Info */}
        <div className="w-full space-y-3 text-gray-300">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon
              icon={faEnvelope}
              className="text-blue-400 w-5 h-5"
            />
            <span>
              Email:{" "}
              <a
                href="mailto:support@unidigitize.com"
                className="text-blue-400 underline"
              >
                support@unidigitize.com
              </a>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faGlobe} className="text-blue-400 w-5 h-5" />
            <span>
              Website:{" "}
              <a
                href="https://unidigitize.com"
                className="text-blue-400 underline"
              >
                unidigitize.com
              </a>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <FontAwesomeIcon
              icon={faMapMarkerAlt}
              className="text-blue-400 w-5 h-5"
            />
            <span>
              Location: Pn -cp - 45 & 46, 104, Ff, Studio Apartment, Vishwakarma
              Industrial Area, Jaipur, Rajasthan, India, 302013
            </span>
          </div>
        </div>

        {/* Footer */}
        <p className="text-gray-400 text-sm text-center">
          For support, inquiries, or feedback, feel free to reach out to us
          anytime.
        </p>
      </div>
    </div>
  );
};

export default ContactUs;
