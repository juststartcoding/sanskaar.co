import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const RazorpayCheckout = ({ orderData, onSuccess, onFailure }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setLoading(true);

    try {
      // Load Razorpay script
      const res = await loadRazorpay();

      if (!res) {
        toast.error("Razorpay SDK failed to load");
        return;
      }

      // Create order on backend
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/shop/create-order`,
        orderData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const { orderId, razorpayOrderId, amount, currency, key } = response.data;

      // Razorpay options
      const options = {
        key: key,
        amount: amount * 100,
        currency: currency,
        name: "Sanskaar",
        description: "Order Payment",
        order_id: razorpayOrderId,
        handler: async function (response) {
          try {
            // Verify payment
            const verifyResponse = await axios.post(
              `${process.env.REACT_APP_API_URL}/shop/verify-payment`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId: orderId,
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (verifyResponse.data.status === "success") {
              toast.success("Payment successful!");
              if (onSuccess) onSuccess(orderId);
              navigate(`/order-success/${orderId}`);
            } else {
              toast.error("Payment verification failed");
              if (onFailure) onFailure();
            }
          } catch (error) {
            console.error("Verification error:", error);
            toast.error("Payment verification failed");
            if (onFailure) onFailure();
          }
        },
        prefill: {
          name: orderData.shippingAddress.name,
          email: orderData.email || "",
          contact: orderData.shippingAddress.phone,
        },
        theme: {
          color: "#EA580C",
        },
        modal: {
          ondismiss: function () {
            toast.error("Payment cancelled");
            setLoading(false);
            if (onFailure) onFailure();
          },
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error("Payment error:", error);
      toast.error(error.response?.data?.message || "Payment failed");
      if (onFailure) onFailure();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? "Processing..." : "Pay Now"}
    </button>
  );
};

export default RazorpayCheckout;
