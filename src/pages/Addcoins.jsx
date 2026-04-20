import React, { useState } from "react";
import { FaWallet, FaCoins, FaArrowRight, FaCheckCircle, FaRupeeSign } from "react-icons/fa";
import { useSelector } from "react-redux";
import { handleAddBallance } from "../api/allApi";

const Addcoins = () => {
  const [balance, setBalance] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");

  const { user } = useSelector((state) => state.user);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
   
    
    setIsSubmitting(true);
    setError("");

    try {
      // Prepare data for API
      const data = {
        userId: user?.id,
        balance: parseFloat(balance)
      };
      
      // Call the API
      const response = await handleAddBallance(data);
      
      console.log("API Response:", response);
      
      // Check if API call was successful
      if (response && response.success) {
        setShowSuccess(true);
        setBalance("");
        
        // Hide success message after 2 seconds
        setTimeout(() => {
          setShowSuccess(false);
        }, 2000);
      } else {
        setError(response?.message || "Failed to add balance. Please try again.");
      }
    } catch (error) {
      console.error("Error adding balance:", error);
      setError(error?.message || "An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-md mx-auto">
       

        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex p-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl shadow-lg mb-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
              <FaCoins className="text-white text-4xl" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Add Balance
          </h1>
          <p className="text-gray-500">
            Add funds to your wallet securely
          </p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
            <h2 className="text-white font-semibold text-lg flex items-center gap-2">
              <FaWallet className="text-yellow-300" />
              Add Money to Wallet
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
           

            {/* Amount Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Enter Amount (₹)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaRupeeSign className="text-green-500 text-xl" />
                </div>
                <input
                  type="number"
                  placeholder="0"
                  value={balance}
                  onChange={(e) => {
                    setBalance(e.target.value);
                    setError(""); // Clear error when user types
                  }}
                  required
                  min="1"
                  step="1"
                  className="w-full pl-10 pr-4 py-4 text-2xl font-semibold border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 text-gray-800 placeholder-gray-300"
                />
              </div>
              
              {/* Preset Amount Buttons */}
              <div className="grid grid-cols-4 gap-2 mt-3">
                {[100, 500, 1000, 5000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setBalance(preset.toString());
                      setError("");
                    }}
                    className="py-2 text-sm font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-600 transition-all duration-200 hover:scale-105"
                  >
                    ₹{preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Summary Card */}
            {balance && parseFloat(balance) > 0 && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100 animate-fade-in">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Amount to Add:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    ₹{parseFloat(balance).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Admin Wallet:</span>
                  <span className="font-mono">{user?.email || "Admin"}</span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !balance || parseFloat(balance) <= 0}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold text-lg hover:shadow-lg hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <FaArrowRight className="text-sm" />
                  Add Balance
                </>
              )}
            </button>
          </form>
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <FaCoins className="text-blue-500 text-sm" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-1">
                Transaction Information
              </h3>
              <p className="text-xs text-gray-500">
                Funds will be added to your wallet immediately. All transactions are secure and logged for your records.
              </p>
            </div>
          </div>
        </div>

        {/* Current Balance Display */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-400">
            Secure transaction • Instant credit
          </p>
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        } 
      `}</style>
    </div>
  );
};

export default Addcoins;