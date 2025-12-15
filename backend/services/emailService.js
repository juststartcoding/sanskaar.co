const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: `"Sanskaar" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Email error:", error);
    return { success: false, error: error.message };
  }
};

// Email Templates
const emailTemplates = {
  orderConfirmation: (order, user) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #EA580C, #DC2626); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; }
        .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .item { display: flex; justify-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .total { font-size: 20px; font-weight: bold; color: #EA580C; padding-top: 15px; }
        .button { display: inline-block; background: #EA580C; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🕉️ Order Confirmed!</h1>
          <p>Thank you for your order, ${user.name}</p>
        </div>
        <div class="content">
          <p>Dear ${user.name},</p>
          <p>Your order has been confirmed and is being processed.</p>
          
          <div class="order-details">
            <h3>Order #${order._id}</h3>
            <p><strong>Order Date:</strong> ${new Date(
              order.createdAt
            ).toLocaleDateString()}</p>
            
            <h4>Items:</h4>
            ${order.items
              .map(
                (item) => `
              <div class="item">
                <span>${item.productId.name.english} x ${item.quantity}</span>
                <span>₹${item.price * item.quantity}</span>
              </div>
            `
              )
              .join("")}
            
            <div class="total">
              Total: ₹${order.total}
            </div>
          </div>
          
          <p><strong>Shipping Address:</strong><br>
          ${order.shippingAddress.name}<br>
          ${order.shippingAddress.address}<br>
          ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${
    order.shippingAddress.pincode
  }<br>
          Phone: ${order.shippingAddress.phone}
          </p>
          
          <center>
            <a href="${process.env.FRONTEND_URL}/orders/${
    order._id
  }" class="button">
              Track Order
            </a>
          </center>
        </div>
        <div class="footer">
          <p>© 2024 Sanskaar. All rights reserved.</p>
          <p>Questions? Contact us at support@sanskaar.co</p>
        </div>
      </div>
    </body>
    </html>
  `,

  bookingConfirmation: (booking, user, pandit) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #EA580C, #DC2626); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; }
        .booking-card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #EA580C; }
        .detail-row { padding: 10px 0; border-bottom: 1px solid #eee; }
        .button { display: inline-block; background: #EA580C; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🕉️ Booking Confirmed!</h1>
          <p>Your pooja booking is confirmed</p>
        </div>
        <div class="content">
          <p>Dear ${user.name},</p>
          <p>Your booking with Pandit ${pandit.name} has been confirmed.</p>
          
          <div class="booking-card">
            <h3>Booking Details</h3>
            <div class="detail-row">
              <strong>Pooja:</strong> ${booking.poojaId.name.english}
            </div>
            <div class="detail-row">
              <strong>Date & Time:</strong> ${new Date(
                booking.dateTime
              ).toLocaleString()}
            </div>
            <div class="detail-row">
              <strong>Location:</strong> ${booking.location}
            </div>
            <div class="detail-row">
              <strong>Pandit:</strong> ${pandit.name}
            </div>
            <div class="detail-row">
              <strong>Amount:</strong> ₹${booking.payment.amount}
            </div>
          </div>
          
          <p><strong>Important Notes:</strong></p>
          <ul>
            <li>Please keep all required pooja materials ready</li>
            <li>The pandit will arrive 15 minutes before scheduled time</li>
            <li>Contact: ${pandit.phone}</li>
          </ul>
          
          <center>
            <a href="${process.env.FRONTEND_URL}/bookings/${
    booking._id
  }" class="button">
              View Booking Details
            </a>
          </center>
        </div>
      </div>
    </body>
    </html>
  `,

  welcome: (user) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #EA580C, #DC2626); color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; }
        .feature { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; display: flex; align-items: center; }
        .button { display: inline-block; background: #EA580C; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🕉️ Welcome to Sanskaar!</h1>
          <p>Namaste, ${user.name}</p>
        </div>
        <div class="content">
          <p>Thank you for joining Sanskaar - your digital companion for Hindu rituals and traditions.</p>
          
          <h3>What you can do:</h3>
          
          <div class="feature">
            📿 <strong style="margin-left: 10px;">Learn authentic poojas</strong> with step-by-step guidance
          </div>
          <div class="feature">
            🛒 <strong style="margin-left: 10px;">Shop for pooja samagri</strong> with fast delivery
          </div>
          <div class="feature">
            👨‍🦱 <strong style="margin-left: 10px;">Book experienced pandits</strong> for home ceremonies
          </div>
          <div class="feature">
            🏛️ <strong style="margin-left: 10px;">Discover temples</strong> across India
          </div>
          
          <center>
            <a href="${process.env.FRONTEND_URL}" class="button">
              Start Exploring
            </a>
          </center>
          
          <p style="margin-top: 30px; color: #666;">
            Need help? Our support team is always ready to assist you at support@sanskaar.co
          </p>
        </div>
      </div>
    </body>
    </html>
  `,
};

module.exports = { sendEmail, emailTemplates };
