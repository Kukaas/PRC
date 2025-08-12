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

export const sendPasswordResetEmail = async (email, token, name) => {
  const resetUrl = `${ENV.FRONTEND_URL}/reset-password?token=${token}`;

  const mailOptions = {
    from: ENV.EMAIL_USER,
    to: email,
    subject: "Password Reset Request - PRC Volunteer System",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa;">
        <div style="background: linear-gradient(135deg, #5ce1e6 0%, #4bc0c6 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">PRC Volunteer System</h1>
          <p style="color: white; margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">Password Reset Request</p>
        </div>

        <div style="padding: 30px; background-color: #ffffff; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #2c3e50; margin: 0 0 20px 0; font-size: 24px;">Hello ${name}!</h2>

          <p style="color: #34495e; line-height: 1.6; margin-bottom: 20px;">We received a request to reset your password. Click the button below to create a new password:</p>

          <div style="text-align: center; margin: 35px 0;">
            <a href="${resetUrl}"
               style="background: linear-gradient(135deg, #5ce1e6 0%, #4bc0c6 100%); color: white; padding: 15px 35px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(92, 225, 230, 0.3); transition: all 0.3s ease;">
              Reset Password
            </a>
          </div>

          <p style="color: #7f8c8d; line-height: 1.6; margin-bottom: 15px;">If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #5ce1e6; background-color: #f8f9fa; padding: 12px; border-radius: 6px; border-left: 4px solid #5ce1e6; font-family: monospace; font-size: 14px;">${resetUrl}</p>

          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 25px 0;">
            <p style="color: #856404; margin: 0; font-weight: bold;">⚠️ Important:</p>
            <p style="color: #856404; margin: 5px 0 0 0;">This password reset link will expire in 1 hour for security reasons.</p>
          </div>

          <div style="background-color: #e8f4f8; border: 1px solid #5ce1e6; border-radius: 8px; padding: 20px; margin: 25px 0;">
            <p style="color: #2c3e50; margin: 0 0 10px 0; font-weight: bold;">🔒 Security Note:</p>
            <p style="color: #34495e; margin: 5px 0 0 0;">If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
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

export const sendPasswordChangeNotification = async (email, name, timestamp, ipAddress = "Unknown", userAgent = "Unknown") => {
  const mailOptions = {
    from: ENV.EMAIL_USER,
    to: email,
    subject: "🔒 Security Alert: Your Password Has Been Changed - PRC Volunteer System",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa;">
        <div style="background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">🔒 Security Alert</h1>
          <p style="color: white; margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">Password Change Notification</p>
        </div>

        <div style="padding: 30px; background-color: #ffffff; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #2c3e50; margin: 0 0 20px 0; font-size: 24px;">Hello ${name}!</h2>

          <div style="background-color: #fff5f5; border: 2px solid #fed7d7; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p style="color: #c53030; margin: 0; font-weight: bold; font-size: 18px;">⚠️ Your password has been successfully changed!</p>
          </div>

          <p style="color: #34495e; line-height: 1.6; margin-bottom: 20px;">This is a security notification to inform you that your password for the PRC Volunteer System has been updated. If this was you, no further action is required.</p>

          <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 25px 0; border-left: 4px solid #e74c3c;">
            <p style="color: #2c3e50; margin: 0 0 15px 0; font-weight: bold;">📅 Change Details:</p>
            <ul style="color: #34495e; margin: 0; padding-left: 20px;">
              <li><strong>Date & Time:</strong> ${new Date(timestamp).toLocaleString()}</li>
              <li><strong>Location:</strong> ${ipAddress}</li>
              <li><strong>Account:</strong> ${email}</li>
              ${userAgent !== "Unknown" ? `<li><strong>Device:</strong> ${userAgent}</li>` : ''}
            </ul>
          </div>

          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 25px 0;">
            <p style="color: #856404; margin: 0 0 10px 0; font-weight: bold;">🚨 If this wasn't you:</p>
            <ul style="color: #856404; margin: 0; padding-left: 20px;">
              <li>Contact our support team immediately</li>
              <li>Consider changing your password again</li>
              <li>Check your account for any suspicious activity</li>
              <li>Enable two-factor authentication if available</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 35px 0;">
            <a href="${ENV.FRONTEND_URL}/login"
               style="background: linear-gradient(135deg, #5ce1e6 0%, #4bc0c6 100%); color: white; padding: 15px 35px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(92, 225, 230, 0.3); transition: all 0.3s ease;">
              Login to Your Account
            </a>
          </div>

          <div style="background-color: #e8f4f8; border: 1px solid #5ce1e6; border-radius: 8px; padding: 20px; margin: 25px 0;">
            <p style="color: #2c3e50; margin: 0 0 10px 0; font-weight: bold;">🔒 Security Tips:</p>
            <ul style="color: #34495e; margin: 0; padding-left: 20px;">
              <li>Use a strong, unique password</li>
              <li>Never share your password with anyone</li>
              <li>Log out from shared devices</li>
              <li>Regularly review your account activity</li>
            </ul>
          </div>

          <p style="color: #7f8c8d; line-height: 1.6; margin-bottom: 20px;">If you have any questions or concerns about this password change, please contact our support team immediately.</p>

          <hr style="margin: 30px 0; border: none; border-top: 2px solid #ecf0f1;">

          <div style="text-align: center;">
            <p style="color: #7f8c8d; font-size: 14px; margin: 0;">
              Best regards,<br>
              <strong style="color: #5ce1e6;">PRC Volunteer System Security Team</strong>
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
    console.error("Password change notification email error:", error);
    return false;
  }
};

// Activity match notification email
export const sendActivityMatchEmail = async (email, name, activityTitle, activityDescription, activityDate, activityLocation, matchPercentage) => {
  const mailOptions = {
    from: ENV.EMAIL_USER,
    to: email,
    subject: `🎯 New Activity Matches Your Skills! - ${activityTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa;">
        <div style="background: linear-gradient(135deg, #5ce1e6 0%, #4bc0c6 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">🎯 Activity Match!</h1>
          <p style="color: white; margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">Your skills are needed for this activity</p>
        </div>

        <div style="padding: 30px; background-color: #ffffff; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #2c3e50; margin: 0 0 20px 0; font-size: 24px;">Hello ${name}!</h2>

          <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d1f2f6 100%); border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
            <p style="color: #2c3e50; margin: 0; font-size: 18px; font-weight: bold;">🎯 Perfect Match!</p>
            <p style="color: #34495e; margin: 5px 0 0 0;">This activity matches your skills and services by ${matchPercentage}%</p>
          </div>

          <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 25px 0; border-left: 4px solid #5ce1e6;">
            <h3 style="color: #2c3e50; margin: 0 0 15px 0; font-size: 20px;">📋 Activity Details:</h3>
            <ul style="color: #34495e; margin: 0; padding-left: 20px;">
              <li><strong>Title:</strong> ${activityTitle}</li>
              <li><strong>Date:</strong> ${new Date(activityDate).toLocaleDateString()}</li>
              <li><strong>Location:</strong> ${activityLocation.barangay}, ${activityLocation.municipality}, ${activityLocation.province}</li>
            </ul>
          </div>

          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 25px 0;">
            <p style="color: #856404; margin: 0 0 10px 0; font-weight: bold;">📝 Description:</p>
            <p style="color: #856404; margin: 5px 0 0 0; line-height: 1.6;">${activityDescription}</p>
          </div>

          <div style="text-align: center; margin: 35px 0;">
            <a href="${ENV.FRONTEND_URL}/login"
               style="background: linear-gradient(135deg, #5ce1e6 0%, #4bc0c6 100%); color: white; padding: 15px 35px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(92, 225, 230, 0.3); transition: all 0.3s ease;">
              View Activity Details
            </a>
          </div>

          <div style="background-color: #e8f4f8; border: 1px solid #5ce1e6; border-radius: 8px; padding: 20px; margin: 25px 0;">
            <p style="color: #2c3e50; margin: 0 0 10px 0; font-weight: bold;">💡 Why You're a Great Match:</p>
            <ul style="color: #34495e; margin: 0; padding-left: 20px;">
              <li>Your skills align with the activity requirements</li>
              <li>Your preferred services match the activity type</li>
              <li>You have the experience needed for this role</li>
              <li>Your location is convenient for this activity</li>
            </ul>
          </div>

          <p style="color: #7f8c8d; line-height: 1.6; margin-bottom: 20px;">Don't miss this opportunity to make a difference in your community! Click the button above to learn more and register for this activity.</p>

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
    console.error("Activity match email error:", error);
    return false;
  }
};

// Activity reminder notification email
export const sendActivityReminderEmail = async (email, name, activityTitle, activityDate, timeFrom, timeTo, activityLocation) => {
  const mailOptions = {
    from: ENV.EMAIL_USER,
    to: email,
    subject: `⏰ Reminder: Upcoming Activity - ${activityTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa;">
        <div style="background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">⏰ Activity Reminder</h1>
          <p style="color: white; margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">Don't forget your upcoming volunteer activity</p>
        </div>

        <div style="padding: 30px; background-color: #ffffff; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #2c3e50; margin: 0 0 20px 0; font-size: 24px;">Hello ${name}!</h2>

          <div style="background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%); border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
            <p style="color: #856404; margin: 0; font-size: 18px; font-weight: bold;">⏰ Reminder!</p>
            <p style="color: #856404; margin: 5px 0 0 0;">You have an upcoming volunteer activity tomorrow</p>
          </div>

          <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 25px 0; border-left: 4px solid #f39c12;">
            <h3 style="color: #2c3e50; margin: 0 0 15px 0; font-size: 20px;">📋 Activity Details:</h3>
            <ul style="color: #34495e; margin: 0; padding-left: 20px;">
              <li><strong>Title:</strong> ${activityTitle}</li>
              <li><strong>Date:</strong> ${new Date(activityDate).toLocaleDateString()}</li>
              <li><strong>Time:</strong> ${timeFrom} - ${timeTo}</li>
              <li><strong>Location:</strong> ${activityLocation.barangay}, ${activityLocation.municipality}, ${activityLocation.province}</li>
            </ul>
          </div>

          <div style="background-color: #e8f4f8; border: 1px solid #5ce1e6; border-radius: 8px; padding: 20px; margin: 25px 0;">
            <p style="color: #2c3e50; margin: 0 0 10px 0; font-weight: bold;">📝 Preparation Checklist:</p>
            <ul style="color: #34495e; margin: 0; padding-left: 20px;">
              <li>Review the activity details and requirements</li>
              <li>Prepare any necessary equipment or materials</li>
              <li>Plan your route and arrival time</li>
              <li>Bring your volunteer ID and necessary documents</li>
              <li>Dress appropriately for the activity</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 35px 0;">
            <a href="${ENV.FRONTEND_URL}/login"
               style="background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%); color: white; padding: 15px 35px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(243, 156, 18, 0.3); transition: all 0.3s ease;">
              View Activity Details
            </a>
          </div>

          <div style="background-color: #fff5f5; border: 1px solid #fed7d7; border-radius: 8px; padding: 20px; margin: 25px 0;">
            <p style="color: #c53030; margin: 0 0 10px 0; font-weight: bold;">⚠️ Important Notes:</p>
            <ul style="color: #c53030; margin: 0; padding-left: 20px;">
              <li>Please arrive 15 minutes before the scheduled start time</li>
              <li>Contact the activity coordinator if you need to cancel</li>
              <li>Bring water and snacks if the activity is long</li>
              <li>Follow all safety guidelines and instructions</li>
            </ul>
          </div>

          <p style="color: #7f8c8d; line-height: 1.6; margin-bottom: 20px;">Thank you for your commitment to volunteering! We look forward to seeing you at the activity.</p>

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
    console.error("Activity reminder email error:", error);
    return false;
  }
};

// Volunteer application acceptance email
export const sendApplicationAcceptedEmail = async (email, name, id) => {
  const mailOptions = {
    from: ENV.EMAIL_USER,
    to: email,
    subject: "🎉 You have been accepted as a volunteer - PRC Volunteer System",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa;">
        <div style="background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">🎉 Congratulations!</h1>
          <p style="color: white; margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">Your volunteer application has been accepted</p>
        </div>

        <div style="padding: 30px; background-color: #ffffff; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #2c3e50; margin: 0 0 20px 0; font-size: 24px;">Hello ${name}!</h2>

          <p style="color: #34495e; line-height: 1.6; margin-bottom: 20px;">We're thrilled to inform you that your volunteer application has been <strong>accepted</strong>. Welcome to the PRC Volunteer Family!</p>

          <div style="background-color: #e8f5e9; border: 1px solid #27ae60; border-radius: 8px; padding: 20px; margin: 25px 0;">
            <p style="color: #2c3e50; margin: 0 0 10px 0; font-weight: bold;">✅ Next Steps:</p>
            <ul style="color: #34495e; margin: 0; padding-left: 20px;">
              <li>Log in to your dashboard to view available activities</li>
              <li>Keep your profile information up to date</li>
              <li>Watch out for upcoming training and events</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 35px 0;">
            <a href="${ENV.FRONTEND_URL}/profile/${id}"
               style="background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%); color: white; padding: 15px 35px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(46, 204, 113, 0.3); transition: all 0.3s ease;">
              Go to Dashboard
            </a>
          </div>

          <p style="color: #7f8c8d; line-height: 1.6; margin-bottom: 20px;">Thank you for your commitment to serving the community. We look forward to working with you!</p>

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
    console.error("Application accepted email error:", error);
    return false;
  }
};

// General notification email
export const sendGeneralNotificationEmail = async (email, name, title, message, activityTitle) => {
  const mailOptions = {
    from: ENV.EMAIL_USER,
    to: email,
    subject: `📢 ${title} - PRC Volunteer System`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa;">
        <div style="background: linear-gradient(135deg, #5ce1e6 0%, #4bc0c6 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">📢 Notification</h1>
          <p style="color: white; margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">Important update from PRC Volunteer System</p>
        </div>

        <div style="padding: 30px; background-color: #ffffff; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #2c3e50; margin: 0 0 20px 0; font-size: 24px;">Hello ${name}!</h2>

          <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d1f2f6 100%); border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
            <p style="color: #2c3e50; margin: 0; font-size: 18px; font-weight: bold;">📢 ${title}</p>
          </div>

          <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 25px 0; border-left: 4px solid #5ce1e6;">
            <p style="color: #34495e; line-height: 1.6; margin: 0;">${message}</p>
          </div>

          ${activityTitle ? `
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 25px 0;">
            <p style="color: #856404; margin: 0 0 10px 0; font-weight: bold;">📋 Related Activity:</p>
            <p style="color: #856404; margin: 5px 0 0 0; font-weight: bold;">${activityTitle}</p>
          </div>
          ` : ''}

          <div style="text-align: center; margin: 35px 0;">
            <a href="${ENV.FRONTEND_URL}/activities"
               style="background: linear-gradient(135deg, #5ce1e6 0%, #4bc0c6 100%); color: white; padding: 15px 35px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(92, 225, 230, 0.3); transition: all 0.3s ease;">
              View Activities
            </a>
          </div>

          <p style="color: #7f8c8d; line-height: 1.6; margin-bottom: 20px;">Thank you for being part of our volunteer community!</p>

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
    console.error("General notification email error:", error);
    return false;
  }
};

// Training notification email
export const sendTrainingNotificationEmail = async (email, name, trainingDate, trainingTime, trainingLocation, exactLocation) => {
  // Convert 24-hour format to 12-hour format with AM/PM
  const formatTime = (timeString) => {
    if (!timeString) return '';

    try {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch (error) {
      console.error('Error formatting time:', error);
      return timeString; // Return original if parsing fails
    }
  };

  const formattedTime = formatTime(trainingTime);

  const mailOptions = {
    from: ENV.EMAIL_USER,
    to: email,
    subject: "📋 Training Notification - PRC Volunteer System",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa;">
        <div style="background: linear-gradient(135deg, #5ce1e6 0%, #4bc0c6 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">📋 Training Notification</h1>
          <p style="color: white; margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">Important training information from PRC Volunteer System</p>
        </div>

        <div style="padding: 30px; background-color: #ffffff; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #2c3e50; margin: 0 0 20px 0; font-size: 24px;">Hello ${name}!</h2>

          <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d1f2f6 100%); border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
            <p style="color: #2c3e50; margin: 0; font-size: 18px; font-weight: bold;">📋 Training Invitation</p>
            <p style="color: #34495e; margin: 5px 0 0 0;">You have been invited to attend a mandatory training session</p>
          </div>

          <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 25px 0; border-left: 4px solid #5ce1e6;">
            <h3 style="color: #2c3e50; margin: 0 0 15px 0; font-size: 20px;">📅 Training Details:</h3>
            <ul style="color: #34495e; margin: 0; padding-left: 20px;">
              <li><strong>Date:</strong> ${new Date(trainingDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</li>
              <li><strong>Time:</strong> ${formattedTime}</li>
              <li><strong>Location:</strong> ${trainingLocation}</li>
              ${exactLocation && exactLocation.trim() ? `<li><strong>Exact Location:</strong> ${exactLocation.trim()}</li>` : ''}
            </ul>
          </div>

          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 25px 0;">
            <p style="color: #856404; margin: 0 0 10px 0; font-weight: bold;">⚠️ Important Reminders:</p>
            <ul style="color: #856404; margin: 0; padding-left: 20px;">
              <li>Please arrive 15 minutes before the scheduled time</li>
              <li>Bring a valid ID for verification</li>
              <li>Dress appropriately for the training session</li>
              <li>Bring a pen and notebook for taking notes</li>
            </ul>
          </div>

          <div style="background-color: #e8f4f8; border: 1px solid #5ce1e6; border-radius: 8px; padding: 20px; margin: 25px 0;">
            <p style="color: #2c3e50; margin: 0 0 10px 0; font-weight: bold;">💡 What to Expect:</p>
            <ul style="color: #34495e; margin: 0; padding-left: 20px;">
              <li>Introduction to PRC volunteer policies and procedures</li>
              <li>Safety guidelines and emergency protocols</li>
              <li>Overview of available volunteer opportunities</li>
              <li>Q&A session with experienced volunteers</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 35px 0;">
            <a href="${ENV.FRONTEND_URL}/login"
               style="background: linear-gradient(135deg, #5ce1e6 0%, #4bc0c6 100%); color: white; padding: 15px 35px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(92, 225, 230, 0.3); transition: all 0.3s ease;">
              Access Your Dashboard
            </a>
          </div>

          <div style="background-color: #e8f5e8; border: 1px solid #27ae60; border-radius: 8px; padding: 20px; margin: 25px 0;">
            <p style="color: #2c3e50; margin: 0; font-weight: bold; text-align: center;">🎉 Welcome to the PRC Volunteer Family! 🎉</p>
            <p style="color: #27ae60; margin: 10px 0 0 0; text-align: center;">We're excited to have you join our team of dedicated volunteers.</p>
          </div>

          <p style="color: #7f8c8d; line-height: 1.6; margin-bottom: 20px;">This training is mandatory for all volunteers. Please ensure you can attend on the scheduled date and time. If you have any questions, please don't hesitate to contact our support team.</p>

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
    console.error("Training notification email error:", error);
    return false;
  }
};

// Simple custom message email for Leaders notifications
export const sendLeaderNotificationEmail = async ({ toEmail, leaderName, messageBody, senderName, subject = "Notification from PRC Volunteer System" }) => {
  const mailOptions = {
    from: ENV.EMAIL_USER,
    to: toEmail,
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa;">
        <div style="background: linear-gradient(135deg, #5ce1e6 0%, #4bc0c6 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">PRC Volunteer System</h1>
          <p style="color: white; margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">Leader Notification</p>
        </div>

        <div style="padding: 30px; background-color: #ffffff; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #2c3e50; margin: 0 0 20px 0; font-size: 24px;">Hello ${leaderName}!</h2>

          <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d1f2f6 100%); border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
            <p style="color: #2c3e50; margin: 0; font-size: 18px; font-weight: bold;">📢 Important Message</p>
            <p style="color: #34495e; margin: 5px 0 0 0;">You have received a notification from PRC Admin</p>
          </div>

          <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 25px 0; border-left: 4px solid #5ce1e6;">
            <p style="color: #2c3e50; margin: 0 0 15px 0; font-weight: bold; font-size: 16px;">📝 Message Content:</p>
            <div style="white-space: pre-wrap; color: #34495e; line-height: 1.6; margin: 0; background-color: #ffffff; padding: 15px; border-radius: 6px; border: 1px solid #e9ecef;">
              ${messageBody}
            </div>
          </div>

          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 25px 0;">
            <p style="color: #856404; margin: 0 0 10px 0; font-weight: bold;">💡 What You Can Do:</p>
            <ul style="color: #856404; margin: 0; padding-left: 20px;">
              <li>Review the message carefully</li>
              <li>Take any necessary actions as requested</li>
              <li>Contact the admin if you need clarification</li>
              <li>Keep this information for your records</li>
            </ul>
          </div>

          <p style="color: #7f8c8d; line-height: 1.6; margin-bottom: 20px;">Thank you for your continued leadership and dedication to the PRC Volunteer System. Your role is crucial in maintaining the quality and effectiveness of our volunteer programs.</p>

          <hr style="margin: 30px 0; border: none; border-top: 2px solid #ecf0f1;">

          <div style="text-align: center;">
            <p style="color: #7f8c8d; font-size: 14px; margin: 0;">
              Best regards,<br>
              <strong style="color: #5ce1e6;">${senderName}</strong><br>
              <span style="color: #95a5a6; font-size: 12px;">PRC Volunteer System Team</span>
            </p>
          </div>

          <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ecf0f1;">
            <p style="color: #95a5a6; font-size: 12px; margin: 0;">
              This is an automated message from the PRC Volunteer System.<br>
              Please do not reply to this email. For support, contact your system administrator.
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
    console.error("Leader notification email error:", error);
    return false;
  }
};
