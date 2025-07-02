import { useNavigate } from "react-router-dom";
import Xarrow from "react-xarrows";
import logo from "../assets/logo/U.png";
import uniLogo from "../assets/logo/unidigitize-logo.png";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="max-w-lg mx-auto bg-black text-white min-h-screen p-6 font-sans">
      {/* Header Section */}
      <header className="text-center py-6">
        <div className="flex flex-col items-center gap-3">
          <img src={logo} alt="Unitrade Hub" className="w-20" />
          <img src={uniLogo} alt="Unidigitize" className="w-28" />
        </div>
        <h1 className="text-3xl font-bold mt-3">UnitradeHub</h1>
        <p className="text-base text-gray-400">
          A Digital Marketplace by Unidigitize Pvt Ltd
        </p>
        <div className="mt-4 flex justify-center space-x-4">
          <button
            className="bg-white text-black px-4 py-2 rounded-lg font-bold shadow-md"
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </button>
          <button
            className="bg-white text-black px-4 py-2 rounded-lg font-bold shadow-md"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
        </div>
      </header>

      {/* About Us Section */}
      <section className="mt-8 text-center">
        <h2 className="text-2xl font-semibold">About Us</h2>
        <p className="text-base mt-3 text-gray-400">
          UnitradeHub, powered by Unidigitize, is a platform that helps
          businesses establish a strong digital presence. We provide affordable
          and effective digital solutions, ensuring that businesses of all sizes
          can thrive in the digital world.
        </p>
      </section>

      {/* Roadmap Section */}
      <section className="mt-10 text-center relative">
        <h2 className="text-2xl font-semibold">How It Works</h2>
        <div className="mt-6 flex flex-col items-center space-y-20 relative">
          <div
            id="roadmap-1"
            className="w-3/4 bg-gray-800 p-4 rounded-lg text-left self-start relative"
          >
            <h3 className="text-lg font-semibold">Step 1: Subscribe</h3>
            <p className="text-sm text-gray-400">
              Join UnitradeHub with a one-time payment of ₹370 and get 2000
              reward coins.
            </p>
          </div>
          <Xarrow
            start="roadmap-1"
            end="roadmap-2"
            startAnchor={{ position: "bottom", offset: { x: -60 } }}
            endAnchor={{ position: "top", offset: { x: 60 } }}
          />
          <div
            id="roadmap-2"
            className="w-3/4 bg-gray-800 p-4 rounded-lg text-right self-end relative"
          >
            <h3 className="text-lg font-semibold">Step 2: Earn Coins</h3>
            <p className="text-sm text-gray-400">
              Complete simple tasks and earn reward coins for engaging with
              digital services. Earn extra coins through our referral program.
            </p>
          </div>
          <Xarrow
            start="roadmap-2"
            end="roadmap-3"
            startAnchor={{ position: "bottom", offset: { x: 60 } }}
            endAnchor={{ position: "top", offset: { x: -60 } }}
          />
          <div
            id="roadmap-3"
            className="w-3/4 bg-gray-800 p-4 rounded-lg text-left self-start relative"
          >
            <h3 className="text-lg font-semibold">Step 3: Explore Services</h3>
            <p className="text-sm text-gray-400">
              Browse through a variety of digital services on Unidigitize
              tailored to your needs.
            </p>
          </div>
          <Xarrow
            start="roadmap-3"
            end="roadmap-4"
            startAnchor={{ position: "bottom", offset: { x: -60 } }}
            endAnchor={{ position: "top", offset: { x: 60 } }}
          />
          <div
            id="roadmap-4"
            className="w-3/4 bg-gray-800 p-4 rounded-lg text-right self-end relative"
          >
            <h3 className="text-lg font-semibold">Step 4: Redeem Services</h3>
            <p className="text-sm text-gray-400">
              Use your earned coins to purchase services such as branding,
              website development, and marketing.
            </p>
          </div>
          <Xarrow
            start="roadmap-4"
            end="roadmap-5"
            startAnchor={{ position: "bottom", offset: { x: 60 } }}
            endAnchor={{ position: "top", offset: { x: -60 } }}
          />
          <div
            id="roadmap-5"
            className="w-3/4 bg-gray-800 p-4 rounded-lg text-left self-start relative"
          >
            <h3 className="text-lg font-semibold">
              Step 5: Grow Your Business
            </h3>
            <p className="text-sm text-gray-400">
              Leverage digital solutions to expand your brand and reach more
              customers.
            </p>
          </div>
        </div>
      </section>

      {/* Services & Rate List */}
      <section className="mt-10 text-center">
        <h2 className="text-2xl font-semibold">Services & Coin Rate List</h2>
        <p className="text-base text-gray-400 mt-3">
          Redeem your coins for high-quality digital services.
        </p>
        <div className="mt-4 bg-gray-900 p-4 rounded-lg shadow-lg">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-800">
                <th className="p-3 text-gray-300">Service</th>
                <th className="p-3 text-gray-300">Coins Required</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: "Logo Design", coins: 2000 },
                { name: "Banner Design", coins: 2500 },
                { name: "Visiting Card Design", coins: 2200 },
                { name: "Google Business Profile Setup", coins: 3000 },
                { name: "Social Media Page Setup", coins: 2800 },
              ].map((service, index) => (
                <tr
                  key={index}
                  className={`border-t border-gray-700 ${
                    index % 2 === 0 ? "bg-gray-800" : "bg-gray-850"
                  }`}
                >
                  <td className="p-3 text-gray-300">{service.name}</td>
                  <td className="p-3 text-gray-300">{service.coins} Coins</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Premium Add-On Services */}
      <section className="mt-8 text-center">
        <h2 className="text-2xl font-semibold">Exclusive Add-On Services</h2>
        <p className="text-base text-white mt-3">
          Unlock high-quality services for an additional cost.
        </p>
        <p className="text-sm text-gray-400">
          * Please note that these charges cover <b>service fees</b> only and do
          not include products from third-party vendors.
        </p>
        <div className="mt-4 bg-gray-900 p-4 rounded-lg shadow-lg">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-800">
                <th className="p-3 text-gray-300">Service</th>
                <th className="p-3 text-gray-300">Coins Required</th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  name: "Website Development (Minimal Cost for Domain & Hosting)",
                  coins: 8000,
                },
                {
                  name: "E-commerce Onboarding (Amazon, Blinkit & More)",
                  coins: 9000,
                },
                {
                  name: "Video Advertisement & Social Media Marketing",
                  coins: 11000,
                },
                {
                  name: "Additional Branding Services at Discounted Prices",
                  coins: 8500,
                },
                {
                  name: "Ongoing Digital Support & Growth Strategies",
                  coins: 10000,
                },
              ].map((service, index) => (
                <tr
                  key={index}
                  className={`border-t border-gray-700 ${
                    index % 2 === 0 ? "bg-gray-800" : "bg-gray-850"
                  }`}
                >
                  <td className="p-3 text-gray-300">{service.name}</td>
                  <td className="p-3 text-gray-300">{service.coins} Coins</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Subscription Details */}
      <section className="mt-10 bg-white p-6 rounded-lg text-center shadow-lg">
        <h2 className="text-2xl font-semibold text-black">
          UnitradeHub Membership
        </h2>

        <p className="text-lg text-gray-700 mt-3">
          Subscribe for
          <span className="text-xl font-extrabold text-black"> ₹370 </span>
          (including 18% GST) and get
          <span className="font-semibold"> 2000 reward coins.</span>
        </p>

        <div className="mt-4 bg-black text-white font-bold text-xl px-6 py-3 rounded-lg inline-block shadow-md">
          ₹370 One-Time Subscription <br />{" "}
          <span className="text-sm">(Incl. 18% GST)</span>
        </div>

        <p className="text-base text-gray-700 mt-4">
          Earn more coins by completing simple tasks and redeem them for
          <span className="font-bold text-black">
            {" "}
            top-tier digital services
          </span>
          like branding, website development, and social media management from
          <span className="text-blue-600 font-bold"> Unidigitize.</span>
        </p>

        <p className="text-sm text-gray-600 mt-3">
          No recurring payments. Just a simple one-time investment to unlock a
          world of digital opportunities.
        </p>

        <button
          className="mt-5 bg-black text-white px-6 py-3 rounded-lg font-bold shadow-md hover:bg-gray-800 transition-all"
          onClick={() => navigate("/signup")}
        >
          Subscribe Now
        </button>
      </section>

      {/* Policies */}
      <section className="mt-10 text-center">
        <h2 className="text-2xl font-semibold">Policies & Guidelines</h2>
        <p className="text-base text-gray-400 mt-3">
          Read our policies to understand how we ensure transparency and
          fairness in our services.
        </p>
        <div className="mt-4 flex flex-col space-y-2 text-white underline">
          <a href="/termsAndCondition">Terms & Conditions</a>
          <a href="/privacy">Privacy Policy</a>
          <a href="/refund-policy">Refund & Cancellation Policy</a>
        </div>
      </section>

      {/* Contact Info */}
      <footer className="mt-12 text-center text-base border-t border-gray-700 pt-6">
        <h2 className="text-xl font-semibold">Need Help?</h2>
        <p className="text-gray-400">
          We are here to assist you. Contact us for any queries.
        </p>
        <button
          className="mt-4 text-white underline"
          onClick={() => navigate("/contact")}
        >
          Go to Contact Page
        </button>
      </footer>
    </div>
  );
}
