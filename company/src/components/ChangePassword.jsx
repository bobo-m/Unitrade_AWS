import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { updatePassword, clearAuthState  } from '../../store/actions/authActions';
import { Link , useNavigate} from 'react-router-dom'; // Import Link for navigation
import Footer from "./Footer";

const ChangePassword = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { loading, message, error } = useSelector((state) => state.auth);

    const [formData, setFormData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const { oldPassword, newPassword, confirmPassword } = formData;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match!');
            return;
        }
        dispatch(updatePassword(formData));
    };

  // Monitor success and error states
  useEffect(() => {
    if (error) {
        toast.error(error);
        console.log('error', error)
        dispatch(clearAuthState()); // Clear Redux error state after displaying the toast
    }
    if (message) {
        toast.success(message);
        setTimeout(() => {
            navigate('/home'); // Navigate to home page after toast
            dispatch(clearAuthState()); // Clear Redux state after navigation
        }, 2000);
    }
}, [error, message, dispatch, navigate]);

// Clear Redux state when unmounting or entering the page
useEffect(() => {
    return () => {
        dispatch(clearAuthState());
    };
}, [dispatch]);

    return (
        <div className="bg-black flex justify-center items-center min-h-screen p-4">
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar theme="dark" />
            <div className="w-full max-w-md bg-black text-white rounded-lg shadow-lg overflow-hidden border border-white p-6">
                <h2 className="text-2xl font-bold text-center mb-4">Change Password</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="block text-gray-400 text-sm">Old Password</label>
                        <input
                            type="password"
                            name="oldPassword"
                            value={oldPassword}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-white placeholder-gray-500"
                            placeholder="Enter old password"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-gray-400 text-sm">New Password</label>
                        <input
                            type="password"
                            name="newPassword"
                            value={newPassword}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-white placeholder-gray-500"
                            placeholder="Enter new password"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-gray-400 text-sm">Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={confirmPassword}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-white placeholder-gray-500"
                            placeholder="Confirm new password"
                        />
                    </div>
                    <div className="flex justify-center">
                        <button
                            type="submit"
                            className={`w-full py-3 text-lg font-bold text-black bg-white rounded-lg shadow-md transform transition duration-300 ease-in-out hover:scale-105 hover:bg-gray-200 ${
                                loading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            disabled={loading}
                        >
                            {loading ? 'Updating...' : 'Update Password'}
                        </button>
                    </div>
                </form>
            </div>
            <Footer />
        </div>
    );
};

export default ChangePassword;
