const prisma = require("../prisma");
const { hashPassword, comparePassword } = require("../utils/bcrypt");
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require("../utils/jwt");
const { validationResult } = require("express-validator");

// Register a new user
exports.register = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, phone } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "User with this email already exists",
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
        role: "USER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    // Generate tokens
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    res.status(201).json({
      message: "User registered successfully",
      user,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Generate tokens
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Return user data (without password)
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt,
    };

    res.json({
      message: "Login successful",
      user: userData,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

//Refresh access token
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        message: "Refresh token is required",
      });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Check if user still exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    // Generate new access token
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const newAccessToken = generateAccessToken(tokenPayload);

    res.json({
      accessToken: newAccessToken,
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(401).json({
      message: "Invalid or expired refresh token",
    });
  }
};

// Get current user (protected route)
exports.getMe = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        bookings: {
          select: {
            id: true,
            status: true,
            createdAt: true,
            seat: {
              select: {
                seatNo: true,
              },
            },
            schedule: {
              select: {
                date: true,
                time: true,
                route: {
                  select: {
                    from: true,
                    to: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      user,
    });
  } catch (error) {
    console.error("Get me error:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
