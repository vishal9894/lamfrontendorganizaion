import { useEffect, useState } from "react";
import { handleGetWallet } from "../api/allApi";
import { useSelector } from "react-redux";
import { FaWallet } from "react-icons/fa";

const DashBoard = () => {
  const { user } = useSelector((state) => state.user);
  const [wallet, setWallet] = useState(0);

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const res = await handleGetWallet(user?.id);
        
        setWallet(res?.balance || 0);
      } catch (error) {
        console.log(error);
      }
    };

    if (user?.id) fetchWallet();
  }, [user]);

  return (
    <div className="p-6 bg-gray-100 ">
      <div className="max-w-sm bg-white rounded-2xl shadow-md p-6 border border-gray-200">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-gray-500 text-sm font-medium">Wallet Balance</p>
            <h1 className="text-3xl font-bold text-gray-800 mt-2">
              ₹{wallet}
            </h1>
          </div>

          <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 text-2xl">
            <FaWallet />
          </div>
        </div>

        <p className="text-sm text-gray-400 mt-4">
          Available amount in your wallet
        </p>
      </div>
    </div>
  );
};

export default DashBoard;