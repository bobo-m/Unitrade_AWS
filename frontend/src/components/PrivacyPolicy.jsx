import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserShield,
  faLock,
  faFileContract,
  faDatabase,
  faShieldAlt,
  faEyeSlash,
  faInfoCircle,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import logo from "../assets/logo/U.png";
import { useNavigate } from "react-router-dom";

const PrivacyPolicy = () => {
  const navigate = useNavigate();
  return (
    <div className="bg-black flex justify-center items-center min-h-screen p-6">
      <div className="w-full max-w-sm bg-black rounded-lg text-white shadow-lg overflow-hidden p-6 gap-6 flex flex-col justify-center items-center border border-gray-700">
        {/* Back Button */}
        <div className="w-full flex justify-start">
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
          Privacy Policy
        </h2>

        {/* Introduction */}
        <div className="w-full space-y-3 text-gray-300">
          <h3 className="text-lg font-semibold text-white border-b border-gray-600 pb-2">
            <FontAwesomeIcon icon={faFileContract} className="w-5 h-5 mr-2" />
            Introduction
          </h3>
          <p>
            At UniDigitize, we value your privacy and are committed to
            protecting your personal data. This Privacy Policy outlines how we
            collect, use, share, and safeguard your information when you
            interact with our services, website, and digital marketing
            platforms.
          </p>
          <p>
            By using our services, you agree to the collection and use of your
            personal information as described in this Privacy Policy. We ensure
            that your data is handled responsibly and in compliance with all
            applicable privacy laws.
          </p>
        </div>

        {/* Information We Collect */}
        <div className="w-full space-y-3 text-gray-300">
          <h3 className="text-lg font-semibold text-white border-b border-gray-600 pb-2">
            <FontAwesomeIcon icon={faDatabase} className="w-5 h-5 mr-2" />
            Information We Collect
          </h3>
          <p>
            We collect different types of information to enhance our services.
            The data we gather includes:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>Personal Information:</strong> Name, email address, phone
              number, and account details for service registration.
            </li>
            <li>
              <strong>Payment Information:</strong> Securely processed via
              Cashfree (we do not store credit/debit card details).
            </li>
            <li>
              <strong>Business Details:</strong> If applicable, we collect
              company name, industry, and branding preferences for marketing
              services.
            </li>
            <li>
              <strong>Website Usage Data:</strong> Cookies, IP addresses, device
              information, and browsing activity to improve user experience.
            </li>
            <li>
              <strong>Communication Records:</strong> Emails, chat messages, and
              customer support interactions to assist you better.
            </li>
          </ul>
        </div>

        {/* How We Use Your Information */}
        <div className="w-full space-y-3 text-gray-300">
          <h3 className="text-lg font-semibold text-white border-b border-gray-600 pb-2">
            <FontAwesomeIcon icon={faShieldAlt} className="w-5 h-5 mr-2" />
            How We Use Your Information
          </h3>
          <p>
            We use the information collected to provide, maintain, and improve
            our services, including:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              To create and manage your account, process payments, and enable
              subscriptions.
            </li>
            <li>
              To deliver digital marketing services, such as logo design,
              website setup, and social media management.
            </li>
            <li>
              To send important service-related updates, notifications, and
              marketing communications.
            </li>
            <li>
              To monitor website performance and enhance user experience using
              analytics.
            </li>
            <li>
              To comply with legal, security, and fraud prevention regulations.
            </li>
          </ul>
          <p>
            We ensure that all collected data is used solely for the intended
            purposes and not misused in any way.
          </p>
        </div>

        {/* Data Protection & Security */}
        <div className="w-full space-y-3 text-gray-300">
          <h3 className="text-lg font-semibold text-white border-b border-gray-600 pb-2">
            <FontAwesomeIcon icon={faLock} className="w-5 h-5 mr-2" />
            Data Protection & Security
          </h3>
          <p>
            Keeping your data secure is our top priority. We take the following
            measures to protect your information:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              We use industry-standard encryption to safeguard sensitive
              information.
            </li>
            <li>
              Access to user data is strictly limited to authorized personnel.
            </li>
            <li>
              Our website is secured with HTTPS protocols to prevent data
              interception.
            </li>
            <li>
              Regular security audits are conducted to detect and prevent
              vulnerabilities.
            </li>
          </ul>
          <p>
            Despite our efforts, no online platform is entirely risk-free. We
            encourage users to use strong passwords and avoid sharing account
            details with others.
          </p>
        </div>

        {/* Third-Party Sharing */}
        <div className="w-full space-y-3 text-gray-300">
          <h3 className="text-lg font-semibold text-white border-b border-gray-600 pb-2">
            <FontAwesomeIcon icon={faEyeSlash} className="w-5 h-5 mr-2" />
            Third-Party Sharing
          </h3>
          <p>
            We do not sell or rent your personal information to third parties.
            However, we may share data with:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Payment processors (e.g., Cashfree) to securely handle
              transactions.
            </li>
            <li>
              Legal authorities if required by law or for fraud prevention.
            </li>
            <li>
              Third-party service providers that assist in service delivery
              (e.g., email notifications).
            </li>
          </ul>
          <p>
            Any shared data is strictly controlled and used only for
            service-related purposes.
          </p>
        </div>

        {/* Your Rights & Control */}
        <div className="w-full space-y-3 text-gray-300">
          <h3 className="text-lg font-semibold text-white border-b border-gray-600 pb-2">
            <FontAwesomeIcon icon={faUserShield} className="w-5 h-5 mr-2" />
            Your Rights & Control Over Your Data
          </h3>
          <p>
            As a user, you have the following rights regarding your personal
            data:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>Request access to the personal data we have on file.</li>
            <li>Request corrections to inaccurate information.</li>
            <li>
              Request deletion of personal data, subject to legal limitations.
            </li>
            <li>Opt-out of promotional emails at any time.</li>
          </ul>
        </div>

        {/* Contact Information */}
        <div className="w-full space-y-3 text-gray-300">
          <h3 className="text-lg font-semibold text-white border-b border-gray-600 pb-2">
            <FontAwesomeIcon icon={faInfoCircle} className="w-5 h-5 mr-2" />
            Contact Us
          </h3>
          <p>
            If you have any privacy-related concerns, feel free to reach out to
            us:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Email:{" "}
              <a
                href="mailto:support@unidigitize.com"
                className="text-blue-400 underline"
              >
                support@unidigitize.com
              </a>
            </li>
            <li>
              Website:{" "}
              <a
                href="https://unidigitize.com"
                className="text-blue-400 underline"
              >
                unidigitize.com
              </a>
            </li>
          </ul>
        </div>

        <p className="text-gray-400 text-sm text-center">
          We reserve the right to update this Privacy Policy as needed.
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
