import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUndoAlt, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import logo from "../assets/logo/U.png";
import { useNavigate } from "react-router-dom";

const RefundPolicy = () => {
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
          Refund & Cancellation Policy
        </h2>

        {/* Refund Policy */}
        <div className="w-full space-y-3 text-gray-300">
          <h3 className="text-lg font-semibold text-white border-b border-gray-600 pb-2">
            <FontAwesomeIcon icon={faUndoAlt} className="w-5 h-5 mr-2" />
            Refund Policy
          </h3>
          <p>
            We strive to provide the best services to our customers, and our
            refund policy ensures fair usage:
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
            <li>Refunds are processed within 7 business days of approval.</li>
          </ul>
        </div>

        {/* Cancellation Policy */}
        <div className="w-full space-y-3 text-gray-300">
          <h3 className="text-lg font-semibold text-white border-b border-gray-600 pb-2">
            <FontAwesomeIcon icon={faUndoAlt} className="w-5 h-5 mr-2" />
            Cancellation Policy
          </h3>
          <p>
            Customers may cancel their subscriptions anytime, but the following
            conditions apply:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Cancellations must be requested at least 24 hours before the next
              billing cycle.
            </li>
            <li>
              No partial refunds are provided for mid-cycle cancellations.
            </li>
            <li>
              Cancellation requests should be sent via email to our support
              team.
            </li>
          </ul>
        </div>

        {/* Contact Support */}
        <p className="text-sm text-gray-400 text-center">
          If you have any questions or concerns, please contact us at{" "}
          <a
            href="mailto:support@unidigitize.com"
            className="text-blue-400 underline"
          >
            support@unidigitize.com
          </a>
          .
        </p>
      </div>
    </div>
  );
};

export default RefundPolicy;
