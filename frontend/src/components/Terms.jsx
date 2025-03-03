import React from "react";
import { useNavigate } from "react-router-dom";

const TermsAndConditions = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-900 text-gray-200 min-h-screen py-6 px-4">
      <div className="max-w-2xl mx-auto bg-gray-800 shadow-lg rounded-lg p-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-400 hover:text-blue-500 transition duration-200 mb-6"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5 mr-2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
          Back
        </button>

        <h1 className="text-2xl sm:text-3xl font-semibold text-white mb-6 text-center">
          UNITRADE HUB
        </h1>
        <h2 className="text-xl sm:text-2xl font-medium text-gray-100 mb-4 text-center">
          Unitrade App Terms and Conditions
        </h2>

        <div className="text-sm sm:text-base">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-100 mt-6 mb-2">
            1. Introduction
          </h3>
          <p className="text-gray-300 mb-4">
            1.1 These Terms and Conditions ("Terms") govern your use of the
            Unitrade  App ("App") and any services provided through the App.
          </p>
          <p className="text-gray-300 mb-4">
            1.2 By downloading, installing, or using the App, you agree to be
            bound by these Terms.
          </p>

          <h3 className="text-lg sm:text-xl font-semibold text-gray-100 mt-6 mb-2">
            2. Eligibility
          </h3>
          <p className="text-gray-300 mb-4">
            2.1 The App is intended for users who are at least 18 years old.
          </p>
          <p className="text-gray-300 mb-4">
            2.2 You must have a valid email address and mobile number to use the
            App.
          </p>

          <h3 className="text-lg sm:text-xl font-semibold text-gray-100 mt-6 mb-2">
            3. Account Registration
          </h3>
          <p className="text-gray-300 mb-4">
            3.1 To use the App, you must create an account by providing accurate
            and up-to-date information.
          </p>
          <p className="text-gray-300 mb-4">
            3.2 You are responsible for maintaining the confidentiality and
            security of your account credentials.
          </p>

          <h3 className="text-lg sm:text-xl font-semibold text-gray-100 mt-6 mb-2">
            4. Transactions
          </h3>
          <p className="text-gray-300 mb-4">
            4.1 Transactions within the Unitrade App are final and cannot be
            reversed.
          </p>
          <p className="text-gray-300 mb-4">
            4.2 You are responsible for verifying transaction details before
            completion.
          </p>

          <h3 className="text-lg sm:text-xl font-semibold text-gray-100 mt-6 mb-2">
            5. Intellectual Property
          </h3>
          <p className="text-gray-300 mb-4">
            5.1 All content in the Unitrade App is protected by intellectual
            property laws.
          </p>
          <p className="text-gray-300 mb-4">
            5.2 Unauthorized reproduction, modification, or distribution of the
            content is prohibited.
          </p>

          <h3 className="text-lg sm:text-xl font-semibold text-gray-100 mt-6 mb-2">
            6. Disclaimer
          </h3>
          <p className="text-gray-300 mb-4">
            6.1 The Unitrade App is provided "as-is" without warranties of any
            kind.
          </p>
          <p className="text-gray-300 mb-4">
            6.2 We are not responsible for any losses resulting from the use of
            the App.
          </p>

          <h3 className="text-lg sm:text-xl font-semibold text-gray-100 mt-6 mb-2">
            7. Contact Us
          </h3>
          <p className="text-gray-300 mb-4">
            If you have any questions or concerns, please contact us at{" "}
            <a
              href="mailto:Support@Unidigitize.com"
              className="text-blue-400 hover:underline"
            >
              Support@Unidigitize.com
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
