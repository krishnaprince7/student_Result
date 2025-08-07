  import asynchandler from "../utils/asynchandler.js";
  import ApiError from "../utils/Aperror.js";
  import { User } from "../modles/users.models.js";
  import ApiResponse from "../utils/ApiResponce.js";
  // import protect from "../middlewares/authMiddleware.js";

  // ✅ Token generator
  const generateAccessAndRefreshToken = async (userId) => {
    try {
      const user = await User.findById(userId);
      if (!user) throw new ApiError(404, "User not found");

      const accessToken = user.generateAccessToken();
      const refreshToken = user.generateRefreshToken(); // 🔁 FIXED typo here

      user.refreshToken = refreshToken;
      await user.save({ validateBeforeSave: false });

      return { accessToken, refreshToken };
    } catch (error) {
      console.error("Token Generation Error:", error); // 🔍 Helpful for debugging
      throw new ApiError(500, "Something went wrong while generating refresh and access token.");
    }
  };

  // ✅ Register User
  const registerUser = asynchandler(async (req, res) => {
    const { fullname, email, username, password, role } = req.body;

    

    const errors = {};
    if (!fullname?.trim()) errors.fullname = "Full name is required";
    if (!email?.trim()) errors.email = "Email is required";
    if (!username?.trim()) errors.username = "Username is required";
    if (!password?.trim()) errors.password = "Password is required";

    if (role && !["teacher", "student"].includes(role)) {
    errors.role = "Invalid role selected";
  }
    if (username?.trim()) {
      const usernameExists = await User.findOne({ username });
      if (usernameExists) errors.username = "Username is already taken";
    }

    if (email?.trim()) {
      const emailExists = await User.findOne({ email });
      if (emailExists) errors.email = "Email is already registered";
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    const user = await User.create({
      fullname,
      email,
      password,
      username: username.toLowerCase(),
      role: role?.toLowerCase() || "student",
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
      throw new ApiError(500, "Something went wrong while registering the user");
    }

    return res.status(201).json(
      new ApiResponse(200, createdUser, "User registered successfully")
    );
  });

  // ✅ Login User
  const loginUser = asynchandler(async (req, res) => {
    const { email, username, password } = req.body;

    const errors = {};

    if (!email?.trim()) {
      errors.email = "Email is required";
    }

    if (!password?.trim()) {
      errors.password = "Password is required";
    }

    // Skip username validation if not used
    // if (!username?.trim()) {
    //   errors.username = "Username is required";
    // }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    // Check if user exists by email or username
    const user = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        errors: {
          email: "No account found with this email or username",
        },
      });
    }

    // Validate password
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        errors: {
          password: "Wrong password",
        },
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            user: {
    _id: loggedInUser._id,
    username: loggedInUser.username,
    email: loggedInUser.email,
    fullname: loggedInUser.fullname,
    role: loggedInUser.role  // 👈 add role here
  },
  accessToken,
  refreshToken
          },
          "User logged in successfully"
        )
      );
  });

  // ✅ Get User's Name Only
const getUserName = asynchandler(async (req, res) => {
  try {
    const userId = req.user?._id;
    
    if (!userId) {
      return res.status(200).json(
        new ApiResponse(200, { 
          name: null,
          email: null 
        }, "No user logged in")
      );
    }

    // Fetch both name and email fields from database
    const user = await User.findById(userId).select("fullname email");

    return res.status(200).json(
      new ApiResponse(200, { 
        name: user?.fullname || null,
        email: user?.email || null
      }, "User details fetched successfully")
    );
    
  } catch (error) {
    console.error("Get user details error:", error);
    return res.status(200).json(
      new ApiResponse(200, { 
        name: null,
        email: null 
      }, "Error fetching user details")
    );
  }
});

  // ✅ Logout User
// ✅ Logout User
// auth.controller.js
const logoutUser = asynchandler(async (req, res) => {
  try {
    // 1. Verify authentication and get user ID
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json(
        new ApiResponse(401, null, "Authentication required")
      );
    }

    // 2. Invalidate refresh token in database
    await User.findByIdAndUpdate(
      userId,
      { 
        $unset: { refreshToken: 1 },
        $inc: { tokenVersion: 1 } // Optional: for token invalidation system
      },
      { new: true }
    );

    // 3. Prepare cookie-clearing options
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
      domain: process.env.NODE_ENV === "production" ? ".yourdomain.com" : undefined
    };

    // 4. Clear cookies and send response
    return res
      .status(200)
      .clearCookie("accessToken", cookieOptions)
      .clearCookie("refreshToken", cookieOptions)
      .json(new ApiResponse(200, null, "Logout successful"));

  } catch (error) {
    console.error("Logout error:", error);
    
    // 5. Force-clear cookies even on error
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    
    return res.status(500).json(
      new ApiResponse(500, null, "Logout failed. Please clear cookies manually.")
    );
  }
});

const changeCurrentPassword = asynchandler(async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;

  // Initialize error object
  const errors = {};

  // 1. Input validation with individual error messages
  if (!oldPassword?.trim()) {
    errors.oldPassword = "Current password is required";
  }

  if (!newPassword?.trim()) {
    errors.newPassword = "New password is required";
  } else if (newPassword.length < 8) {
    errors.newPassword = "Password must be at least 8 characters";
  }

  if (!confirmPassword?.trim()) {
    errors.confirmPassword = "Please confirm your new password";
  } else if (newPassword !== confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  // Return validation errors if any
  if (Object.keys(errors).length > 0) {
    return res.status(400).json(
      new ApiResponse(400, { errors }, "Validation errors")
    );
  }

  // 2. Get user
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json(
      new ApiResponse(404, null, "User not found")
    );
  }

  // 3. Verify old password
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) {
    return res.status(400).json(
      new ApiResponse(400, { errors: { oldPassword: "Incorrect current password" } }, "Invalid current password")
    );
  }

  // 4. Set and save new password
  user.password = newPassword;
  await user.save();

  // 5. Invalidate all sessions
  await User.findByIdAndUpdate(user._id, {
    $inc: { tokenVersion: 1 }
  });

  return res.status(200).json(
    new ApiResponse(200, null, "Password changed successfully")
  );
});
// ✅ Exports
export default registerUser;
export { loginUser, logoutUser,changeCurrentPassword, getUserName};
