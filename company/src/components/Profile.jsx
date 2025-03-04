import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { BsPencil, BsFillSaveFill } from "react-icons/bs";
import { FaChevronLeft } from "react-icons/fa";
import Footer from "./Footer";
import { useDispatch, useSelector } from "react-redux";
import { fetchCompanyData , updateCoinRate} from "../../store/actions/homeActions";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from './Loader';

function Profile() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const apiData = useSelector((state) => state.apiData.data);
  const userData = apiData?.me?.data || null;
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [loader, setLoader] = useState(false);
  const [coinRate, setCoinRate] = useState('');

  useEffect(() => {
    //   //   // Fetch user and coin data on component mount
    const fetchData = async () => {
      try {
        await dispatch(fetchCompanyData());
        setLoader(false); // Set loading to false after data is fetched
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoader(false); // Set loading to false if there's an error
      }
    };
    fetchData();
  }, [dispatch]);



  // Handle coin rate update
  const handleUpdateCoinRate = () => {
    if (!coinRate) {
      toast.error('Coin rate is required!');
      return;
    }

    dispatch(updateCoinRate(coinRate))
      .then(() => {
        toast.success('Coin rate updated successfully!');
        navigate('/home'); // Navigate to home page
      })
      .catch((error) => {
        toast.error(error.message || 'Failed to update coin rate!');
      });
  };

 



  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const sparkles = [];
    const maxSparkles = 60;

    class Sparkle {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = Math.random() * 2 + 1;
        this.alpha = 1;
        this.speed = Math.random() * 1 + 0.5;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
        ctx.fill();
      }

      update() {
        this.alpha -= 0.01;
        this.y -= this.speed;
      }
    }

    const addSparkle = () => {
      if (sparkles.length < maxSparkles) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        sparkles.push(new Sparkle(x, y));
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      sparkles.forEach((sparkle, index) => {
        sparkle.update();
        sparkle.draw();
        if (sparkle.alpha <= 0) {
          sparkles.splice(index, 1);
        }
      });
      addSparkle();
      requestAnimationFrame(animate);
    };

    animate();

    // Cleanup on component unmount
    return () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, []);

  // Handle coin rate change
  const handleCoinRateChange = (e) => {
    setCoinRate(e.target.value);
  };

  return (
    <div className="relative min-h-screen flex justify-center items-center bg-black overflow-auto">
      {/* Back Button at the top */}
      <div className="absolute top-4 left-4 z-10">
        <button onClick={() => navigate(-1)} className="text-2xl text-white cursor-pointer">
          <FaChevronLeft />
        </button>
      </div>

      <ToastContainer
    position="top-right"
    autoClose={500}
    hideProgressBar={false}
    closeOnClick
    pauseOnHover
    draggable
    theme="dark"
  />

      {/* Canvas background */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />

      {/* Profile Section */}
      {loader ? (
        <Loader />
      ) : (
        <section className="relative z-10 w-full max-w-md bg-black text-white shadow-lg rounded-lg px-4 py-6 overflow-y-auto">
          <div className="flex flex-col items-center space-y-4">
            {/* Profile Picture */}
            <div className="relative">
              <div className="cursor-pointer">
                <img
                  src="/src/Img/images.png"
                  alt="Profile"
                  className="w-24 h-24 object-cover rounded-full border-4 border-gray-600"
                />
                <div className="absolute bottom-1 right-1 bg-gray-800 rounded-full p-2">
                  <BsPencil className="text-white text-xs" />
                </div>
              </div>

            </div>
            <div className="text-center mt-4">
              {/* User Name */}
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-blue-300 to-white bg-clip-text text-transparent">
                {userData?.user_name}
              </h1>
            </div>

          </div>

          {/* Form Section */}
          <div className="space-y-4 mt-6">
            <h2 className="text-gray-300"> Update Coin Rate</h2>

            {/* Coin Rate Input */}
            <div className="flex items-center border border-gray-700 rounded p-2 bg-gray-800 w-full">
              <input
                type="number"
                name="coin_rate"
                value={coinRate}
                onChange={handleCoinRateChange}
                className="w-full bg-transparent focus:outline-none text-white"
                placeholder="Enter Coin Rate"
              />
            </div>
          </div>

          {/* Update Button */}
          <div className="mt-6">
            <button
              onClick={handleUpdateCoinRate}
              className="w-full bg-white text-black font-semibold py-2 rounded hover:bg-gray-600 transition flex items-center justify-center"
              disabled={loading} // Disable the button when loading
            >
              {loading ? (
                <svg
                  className="animate-spin h-5 w-5 text-gray-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4v2m0 12v2m4-10h2m-12 0H4m6-6l1.5 1.5M9 5l1.5-1.5m6 6l1.5-1.5m-6 6l1.5 1.5"
                  />
                </svg>
              ) : (
                'Update'
              )}
            </button>
          </div>
        </section>
      )}

      {/* Footer */}
      <Footer />
    </div>


  );
}

export default Profile;
