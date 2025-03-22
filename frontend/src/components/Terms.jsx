import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileContract,
  faShieldAlt,
  faUserShield,
  faUndoAlt,
  faShippingFast,
  faInfoCircle,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import logo from "../assets/logo/U.png";
import { useNavigate } from "react-router-dom";

const TermsAndConditions = () => {
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
          Terms & Conditions
        </h2>

        {/* Introduction */}
        <div className="w-full space-y-3 text-gray-300">
          <h3 className="text-lg font-semibold text-white border-b border-gray-600 pb-2">
            <FontAwesomeIcon icon={faFileContract} className="w-5 h-5 mr-2" />
            Introduction
          </h3>
          <p>
            Welcome to UniDigitize. By using our services, website, or
            subscription-based digital marketing offerings, you agree to abide
            by these Terms & Conditions. These terms are legally binding and
            govern your access to and use of UniDigitize's services, ensuring a
            fair and transparent relationship between our platform and its
            users.
          </p>
        </div>

        {/* Eligibility */}
        <div className="w-full space-y-3 text-gray-300">
          <h3 className="text-lg font-semibold text-white border-b border-gray-600 pb-2">
            <FontAwesomeIcon icon={faUserShield} className="w-5 h-5 mr-2" />
            Eligibility
          </h3>
          <p>
            To use our services, you must meet the following eligibility
            criteria:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>You must be at least 18 years old to subscribe.</li>
            <li>
              Accurate personal details (name, email, phone) must be provided at
              registration.
            </li>
            <li>
              UniDigitize reserves the right to deny service if any user
              violates our policies.
            </li>
          </ul>
          <p>
            If we detect any suspicious activity or false information in your
            account, we reserve the right to suspend or terminate your access
            without prior notice.
          </p>
        </div>

        {/* Subscription & Payments */}
        <div className="w-full space-y-3 text-gray-300">
          <h3 className="text-lg font-semibold text-white border-b border-gray-600 pb-2">
            <FontAwesomeIcon icon={faFileContract} className="w-5 h-5 mr-2" />
            Subscription & Payments
          </h3>
          <p>
            By subscribing to our services, you acknowledge and agree to the
            following:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Subscription fee: ₹370 (including GST), payable via Cashfree.
            </li>
            <li>
              Users receive access to premium digital marketing services at
              discounted rates.
            </li>
            <li>
              All payments must be made in full before the subscription is
              activated.
            </li>
          </ul>
          <p>
            Failure to complete the payment will result in delayed activation of
            services. We do not store payment details and rely on secure
            third-party payment processors to handle transactions.
          </p>
        </div>

        {/* Refund & Cancellation Policy */}
        <div className="w-full space-y-3 text-gray-300">
          <h3 className="text-lg font-semibold text-white border-b border-gray-600 pb-2">
            <FontAwesomeIcon icon={faUndoAlt} className="w-5 h-5 mr-2" />
            Refund & Cancellation Policy
          </h3>
          <p>
            We understand that circumstances may change, and users may need to
            cancel their subscriptions. However, to maintain service integrity,
            we follow the policies below:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>Refunds are not permitted once a service has been availed.</li>
            <li>
              If you cancel before receiving any service, you may be eligible
              for a full refund.
            </li>
            <li>
              Refund requests must be submitted via{" "}
              <a
                href="mailto:support@unidigitize.com"
                className="text-blue-400 underline"
              >
                support@unidigitize.com
              </a>
              .
            </li>
            <li>
              Users can cancel subscriptions anytime; however, cancellations
              must be requested at least 24 hours before the next billing cycle.
            </li>
          </ul>
        </div>

        {/* Shipping & Delivery Policy */}
        <div className="w-full space-y-3 text-gray-300">
          <h3 className="text-lg font-semibold text-white border-b border-gray-600 pb-2">
            <FontAwesomeIcon icon={faShippingFast} className="w-5 h-5 mr-2" />
            Service Delivery Timeline
          </h3>
          <p>
            Once a user subscribes, we begin service delivery within the
            following estimated timeframes:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Digital services such as logo design, website setup, or social
              media marketing typically take 3-7 business days.
            </li>
            <li>
              Service timelines may vary depending on complexity and client
              requirements.
            </li>
            <li>
              Clients will receive updates via email regarding the progress of
              their service request.
            </li>
          </ul>
          <p>
            In case of unexpected delays, we will inform you in advance and
            provide an updated timeline.
          </p>
        </div>

        {/* Privacy Policy */}
        <div className="w-full space-y-3 text-gray-300">
          <h3 className="text-lg font-semibold text-white border-b border-gray-600 pb-2">
            <FontAwesomeIcon icon={faShieldAlt} className="w-5 h-5 mr-2" />
            Privacy Policy
          </h3>
          <p>
            Your privacy is our priority. We collect only essential information
            to deliver our services effectively.
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              We collect name, email, phone number, and business details for
              service communication.
            </li>
            <li>
              Payments are securely processed via Cashfree, and we do not store
              payment details.
            </li>
            <li>Your data is protected and will not be shared or misused.</li>
          </ul>
        </div>

        {/* Support */}
        <div className="w-full space-y-3 text-gray-300">
          <h3 className="text-lg font-semibold text-white border-b border-gray-600 pb-2">
            <FontAwesomeIcon icon={faInfoCircle} className="w-5 h-5 mr-2" />
            Customer Support & Assistance
          </h3>
          <p>
            Our support team is here to assist you with any questions or
            concerns.
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
            <li>Response time is typically within 24 hours.</li>
          </ul>
        </div>

        {/* Footer */}
        <p className="text-gray-400 text-sm text-center">
          We reserve the right to update these terms at any time.
        </p>
      </div>
    </div>
  );
};

export default TermsAndConditions;
