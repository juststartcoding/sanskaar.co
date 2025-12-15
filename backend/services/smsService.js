const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const sendSMS = async (to, message) => {
  try {
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to,
    });

    console.log("SMS sent:", result.sid);
    return { success: true, sid: result.sid };
  } catch (error) {
    console.error("SMS error:", error);
    return { success: false, error: error.message };
  }
};

// SMS Templates
const smsTemplates = {
  orderConfirmation: (order) =>
    `Sanskaar: Your order #${order._id
      .toString()
      .slice(-6)} has been confirmed. Total: ₹${order.total}. Track at ${
      process.env.FRONTEND_URL
    }/orders/${order._id}`,

  orderShipped: (order, trackingId) =>
    `Sanskaar: Your order #${order._id
      .toString()
      .slice(-6)} has been shipped. Tracking ID: ${trackingId}`,

  orderDelivered: (order) =>
    `Sanskaar: Your order #${order._id
      .toString()
      .slice(-6)} has been delivered. Thank you for shopping with us!`,

  bookingConfirmation: (booking) =>
    `Sanskaar: Your pooja booking for ${new Date(
      booking.dateTime
    ).toLocaleDateString()} has been confirmed. Booking ID: ${booking._id
      .toString()
      .slice(-6)}`,

  otp: (otp) =>
    `Sanskaar: Your OTP is ${otp}. Valid for 10 minutes. Do not share with anyone.`,
};

module.exports = { sendSMS, smsTemplates };
