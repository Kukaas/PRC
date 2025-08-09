import nodemailer from "nodemailer";
import { ENV } from "../connections/env.js";

// Create transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: ENV.EMAIL_USER,
    pass: ENV.EMAIL_PASS,
  },
});

export const sendVerificationEmail = async (email, token, name) => {
  const verificationUrl = `${ENV.FRONTEND_URL}/verify-email?token=${token}`;

  const mailOptions = {
    from: ENV.EMAIL_USER,
    to: email,
    subject: "Email Verification - PRC Volunteer System",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa;">
        <div style="background: linear-gradient(135deg, #5ce1e6 0%, #4bc0c6 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">PRC Volunteer System</h1>
          <p style="color: white; margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">Join our community of volunteers</p>
        </div>
        
        <div style="padding: 30px; background-color: #ffffff; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #2c3e50; margin: 0 0 20px 0; font-size: 24px;">Hello ${name}!</h2>
          
          <p style="color: #34495e; line-height: 1.6; margin-bottom: 20px;">Thank you for signing up to become a volunteer. To complete your registration, please verify your email address by clicking the button below:</p>
          
          <div style="text-align: center; margin: 35px 0;">
            <a href="${verificationUrl}" 
               style="background: linear-gradient(135deg, #5ce1e6 0%, #4bc0c6 100%); color: white; padding: 15px 35px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(92, 225, 230, 0.3); transition: all 0.3s ease;">
              Verify Email Address
            </a>
          </div>
          
          <p style="color: #7f8c8d; line-height: 1.6; margin-bottom: 15px;">If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #5ce1e6; background-color: #f8f9fa; padding: 12px; border-radius: 6px; border-left: 4px solid #5ce1e6; font-family: monospace; font-size: 14px;">${verificationUrl}</p>
          
          <div style="background-color: #e8f4f8; border: 1px solid #5ce1e6; border-radius: 8px; padding: 20px; margin: 25px 0;">
            <p style="color: #2c3e50; margin: 0; font-weight: bold;">⏰ Important:</p>
            <p style="color: #34495e; margin: 5px 0 0 0;">This verification link will expire in 24 hours.</p>
          </div>
          
          <p style="color: #7f8c8d; line-height: 1.6; margin-bottom: 20px;">If you didn't create an account, please ignore this email.</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 2px solid #ecf0f1;">
          
          <div style="text-align: center;">
            <p style="color: #7f8c8d; font-size: 14px; margin: 0;">
              Best regards,<br>
              <strong style="color: #5ce1e6;">PRC Volunteer System Team</strong>
            </p>
          </div>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Email sending error:", error);
    return false;
  }
};

export const sendWelcomeEmail = async (email, name) => {
  const mailOptions = {
    from: ENV.EMAIL_USER,
    to: email,
    subject: "Welcome to PRC Volunteer System!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa;">
        <div style="background: linear-gradient(135deg, #5ce1e6 0%, #4bc0c6 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">Welcome to PRC!</h1>
          <p style="color: white; margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">Your journey as a volunteer begins now</p>
        </div>
        
        <div style="padding: 30px; background-color: #ffffff; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #2c3e50; margin: 0 0 20px 0; font-size: 24px;">Hello ${name}!</h2>
          
          <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d1f2f6 100%); border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
            <p style="color: #2c3e50; margin: 0; font-size: 18px; font-weight: bold;">🎉 Congratulations!</p>
            <p style="color: #34495e; margin: 5px 0 0 0;">Your email has been successfully verified.</p>
          </div>
          
          <p style="color: #34495e; line-height: 1.6; margin-bottom: 20px;">You can now log in to your account and complete your profile information. The more complete your profile, the better we can match you with appropriate volunteer opportunities.</p>
          
          <div style="text-align: center; margin: 35px 0;">
            <a href="${ENV.FRONTEND_URL}/login" 
               style="background: linear-gradient(135deg, #5ce1e6 0%, #4bc0c6 100%); color: white; padding: 15px 35px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(92, 225, 230, 0.3); transition: all 0.3s ease;">
              Login to Your Account
            </a>
          </div>
          
          <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 25px 0; border-left: 4px solid #5ce1e6;">
            <p style="color: #2c3e50; margin: 0 0 10px 0; font-weight: bold;">💡 Next Steps:</p>
            <ul style="color: #34495e; margin: 0; padding-left: 20px;">
              <li>Complete your personal information</li>
              <li>Add your medical history</li>
              <li>Share your skills and experience</li>
              <li>Choose your preferred services</li>
            </ul>
          </div>
          
          <p style="color: #7f8c8d; line-height: 1.6; margin-bottom: 20px;">If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 2px solid #ecf0f1;">
          
          <div style="text-align: center;">
            <p style="color: #7f8c8d; font-size: 14px; margin: 0;">
              Best regards,<br>
              <strong style="color: #5ce1e6;">PRC Volunteer System Team</strong>
            </p>
          </div>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Email sending error:", error);
    return false;
  }
};
