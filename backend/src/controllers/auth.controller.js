import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendPasswordChangeNotification,
} from "../services/email.service.js";
import { ENV } from "../connections/env.js";
import {
  calculatePersonalInfoCompletion,
  calculateMedicalHistoryCompletion,
  calculateFamilyBackgroundCompletion,
  calculateEducationalBackgroundCompletion,
  calculateSkillsCompletion,
  calculateServicesCompletion,
  getNextRecommendedSection,
} from "./profile.controller.js";

// User signup
export const signup = async (req, res) => {
  try {
    const { familyName, givenName, middleName, dateOfBirth, email, password } =
      req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Create new user
    const user = new User({
      familyName,
      givenName,
      middleName,
      dateOfBirth: new Date(dateOfBirth),
      email,
      password,
    });

    // Generate email verification token
    const verificationToken = user.generateEmailVerificationToken();

    // Save user
    await user.save();

    // Send verification email
    const emailSent = await sendVerificationEmail(
      email,
      verificationToken,
      `${givenName} ${familyName}`
    );

    if (!emailSent) {
      // If email fails, still create user but notify about email issue
      return res.status(201).json({
        success: true,
        message:
          "Account created successfully, but verification email could not be sent. Please contact support.",
        data: {
          userId: user._id,
          email: user.email,
          isEmailVerified: user.isEmailVerified,
        },
      });
    }

    res.status(201).json({
      success: true,
      message:
        "Account created successfully. Please check your email to verify your account.",
      data: {
        userId: user._id,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during signup",
      error: error.message,
    });
  }
};

// Email verification
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    // Find user with this verification token
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token",
      });
    }

    // Mark email as verified
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;

    await user.save();

    // Send welcome email
    await sendWelcomeEmail(user.email, `${user.givenName} ${user.familyName}`);

    res.json({
      success: true,
      message:
        "Email verified successfully! You can now log in to your account.",
      data: {
        userId: user._id,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during email verification",
      error: error.message,
    });
  }
};

// User login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(401).json({
        success: false,
        message: "Please verify your email before logging in",
      });
    }

    // Check if password is correct
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
        isProfileComplete: user.isProfileComplete,
      },
      ENV.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set HTTP-only cookie
    res.cookie("authToken", token, {
      httpOnly: true,
      secure: true, // Always secure for cross-subdomain cookies
      sameSite: "none", // Required for cross-subdomain cookies
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/", // Ensure cookie is available across the entire domain
      domain: ENV.NODE_ENV === "production" ? ".vercel.app" : undefined, // Set domain for cross-subdomain
    });

    // Get profile completion status for immediate feedback
    const profileCompletion = {
      isProfileComplete: user.isProfileComplete,
      sections: {
        personalInfo: calculatePersonalInfoCompletion(user.personalInfo),
        medicalHistory: calculateMedicalHistoryCompletion(user.medicalHistory),
        familyBackground: calculateFamilyBackgroundCompletion(
          user.familyBackground
        ),
        educationalBackground: calculateEducationalBackgroundCompletion(
          user.educationalBackground
        ),
        skills: calculateSkillsCompletion(
          user.skills
        ),
        services: calculateServicesCompletion(user.services),
      },
    };

    // Calculate overall completion percentage
    const overallCompletion = Math.round(
      Object.values(profileCompletion.sections).reduce(
        (sum, val) => sum + val,
        0
      ) / Object.keys(profileCompletion.sections).length
    );

    profileCompletion.overallCompletion = overallCompletion;

    res.json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          _id: user._id,
          familyName: user.familyName,
          givenName: user.givenName,
          middleName: user.middleName,
          email: user.email,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          isProfileComplete: user.isProfileComplete,
        },
        profileCompletion,
        setupRequired: !user.isProfileComplete,
        nextRecommendedSection: getNextRecommendedSection(
          profileCompletion.sections
        ),
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Resend verification email
export const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    // Generate new verification token
    const verificationToken = user.generateEmailVerificationToken();
    await user.save();

    // Send new verification email
    const emailSent = await sendVerificationEmail(
      email,
      verificationToken,
      `${user.givenName} ${user.familyName}`
    );

    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to send verification email. Please try again later.",
      });
    }

    res.json({
      success: true,
      message: "Verification email sent successfully",
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Logout
export const logout = async (req, res) => {
  try {
    // Clear the authentication cookie
    res.clearCookie("authToken", {
      httpOnly: true,
      secure: true, // Always secure for cross-subdomain cookies
      sameSite: "none", // Required for cross-subdomain cookies
      path: "/", // Ensure cookie is cleared from the same path it was set
      domain: ENV.NODE_ENV === "production" ? ".vercel.app" : undefined, // Set domain for cross-subdomain
    });

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get current user profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select(
      "-password -emailVerificationToken -emailVerificationExpires"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get profile completion status for consistent response
    const profileCompletion = {
      isProfileComplete: user.isProfileComplete,
      sections: {
        personalInfo: calculatePersonalInfoCompletion(user.personalInfo),
        medicalHistory: calculateMedicalHistoryCompletion(user.medicalHistory),
        familyBackground: calculateFamilyBackgroundCompletion(
          user.familyBackground
        ),
        educationalBackground: calculateEducationalBackgroundCompletion(
          user.educationalBackground
        ),
        skills: calculateSkillsCompletion(
          user.skills
        ),
        services: calculateServicesCompletion(user.services),
      },
    };

    // Calculate overall completion percentage
    const overallCompletion = Math.round(
      Object.values(profileCompletion.sections).reduce(
        (sum, val) => sum + val,
        0
      ) / Object.keys(profileCompletion.sections).length
    );

    profileCompletion.overallCompletion = overallCompletion;

    res.json({
      success: true,
      data: {
        user,
        profileCompletion,
        setupRequired: !user.isProfileComplete,
        nextRecommendedSection: getNextRecommendedSection(
          profileCompletion.sections
        ),
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Forgot password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email address",
      });
    }

    // Generate password reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save();

    // Send password reset email
    const emailSent = await sendPasswordResetEmail(
      email,
      resetToken,
      `${user.givenName} ${user.familyName}`
    );

    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to send password reset email. Please try again later.",
      });
    }

    res.json({
      success: true,
      message: "Password reset link sent to your email",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Reset password
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Find user with valid reset token
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    // Update password and clear reset token
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    // Get client IP address and user agent
    const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'Unknown';
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const timestamp = new Date();

    // Format IP address for better display
    let displayIpAddress = ipAddress;
    if (ipAddress === '::1' || ipAddress === '127.0.0.1') {
      displayIpAddress = 'Localhost (Development)';
    } else if (ipAddress === 'Unknown') {
      displayIpAddress = 'Unknown Location';
    } else if (ipAddress.includes('::ffff:')) {
      // Handle IPv4-mapped IPv6 addresses
      displayIpAddress = ipAddress.replace('::ffff:', '');
    }

    // Format user agent for better display
    let displayUserAgent = 'Unknown Device';
    if (userAgent !== 'Unknown') {
      // Extract browser and OS information
      const browserMatch = userAgent.match(/(chrome|safari|firefox|edge|opera|ie)\/?\s*(\d+)/i);
      const osMatch = userAgent.match(/\((.*?)\)/);

      if (browserMatch && osMatch) {
        displayUserAgent = `${browserMatch[1].charAt(0).toUpperCase() + browserMatch[1].slice(1)} on ${osMatch[1]}`;
      } else if (browserMatch) {
        displayUserAgent = browserMatch[1].charAt(0).toUpperCase() + browserMatch[1].slice(1);
      } else {
        displayUserAgent = 'Unknown Browser';
      }
    }

    // Send password change notification email
    await sendPasswordChangeNotification(
      user.email,
      `${user.givenName} ${user.familyName}`,
      timestamp,
      displayIpAddress,
      displayUserAgent
    );

    res.json({
      success: true,
      message: "Password reset successfully. You can now log in with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Change password (authenticated user)
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.userId;

    // Find user
    const user = await User.findById(userId).select("+password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify old password
    const isOldPasswordCorrect = await user.comparePassword(oldPassword);
    if (!isOldPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Check if new password is different from old password
    const isNewPasswordSame = await user.comparePassword(newPassword);
    if (isNewPasswordSame) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from current password",
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Get client IP address and user agent
    const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'Unknown';
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const timestamp = new Date();

    // Format IP address for better display
    let displayIpAddress = ipAddress;
    if (ipAddress === '::1' || ipAddress === '127.0.0.1') {
      displayIpAddress = 'Localhost (Development)';
    } else if (ipAddress === 'Unknown') {
      displayIpAddress = 'Unknown Location';
    } else if (ipAddress.includes('::ffff:')) {
      // Handle IPv4-mapped IPv6 addresses
      displayIpAddress = ipAddress.replace('::ffff:', '');
    }

    // Format user agent for better display
    let displayUserAgent = 'Unknown Device';
    if (userAgent !== 'Unknown') {
      // Extract browser and OS information
      const browserMatch = userAgent.match(/(chrome|safari|firefox|edge|opera|ie)\/?\s*(\d+)/i);
      const osMatch = userAgent.match(/\((.*?)\)/);

      if (browserMatch && osMatch) {
        displayUserAgent = `${browserMatch[1].charAt(0).toUpperCase() + browserMatch[1].slice(1)} on ${osMatch[1]}`;
      } else if (browserMatch) {
        displayUserAgent = browserMatch[1].charAt(0).toUpperCase() + browserMatch[1].slice(1);
      } else {
        displayUserAgent = 'Unknown Browser';
      }
    }

    // Send password change notification email
    await sendPasswordChangeNotification(
      user.email,
      `${user.givenName} ${user.familyName}`,
      timestamp,
      displayIpAddress,
      displayUserAgent
    );

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
