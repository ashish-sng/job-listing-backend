const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cors = require("cors");

const User = require("./models/userModel");
const JobListing = require("./models/jobListingModel");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

dotenv.config();

app.get("/", (req, res) => res.send("Hello World!"));

// Health check endpoint
app.get("/health", (req, res) => {
  const dbStatus =
    mongoose.connection.readyState === 1 ? "Connected" : "Disconnected";

  res.status(200).json({
    server: "Running",
    database: dbStatus,
  });
});

// Register a new user
app.post("/register", async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;

    // Check if the required fields are provided
    if (!name || !email || !mobile || !password) {
      return res
        .status(400)
        .json({ error: "Please provide all required fields" });
    }

    // Check if a user with the same email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "User already exists" });
    }

    // Hash the password using bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create a new user
    const newUser = new User({
      name,
      email,
      mobileNumber: mobile,
      password: hashedPassword,
    });

    await newUser.save();

    // Generate and return the JWT token after sign up
    const user = await User.findOne({ email });
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: 300,
    });
    res.status(201).json({
      message: "User registered successfully",
      name: user.name,
      token,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the required fields are provided
    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Please provide email and password" });
    }

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Compare the provided password with the stored hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Generate and return the JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: 3000,
    });
    res
      .status(200)
      .json({ message: "Login successful", name: user.name, token });
  } catch (error) {
    res.status(500).json({ error: "Failed to login" });
  }
});

// Middleware for user authorization
const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: "Unauthorized" });
  }
};

// Create a new job listing (protected route)
app.post("/job-posting", authenticateUser, async (req, res) => {
  try {
    const {
      companyName,
      addLogoURL,
      jobPosition,
      monthlySalary,
      jobType,
      remoteOnsite,
      jobLocation,
      jobDescription,
      aboutCompany,
      skillsRequired,
    } = req.body;

    console.log(req.body);

    // Check if all the required fields are provided
    if (
      !companyName ||
      !jobPosition ||
      !jobDescription ||
      !skillsRequired ||
      !aboutCompany ||
      !monthlySalary ||
      !jobType ||
      !remoteOnsite ||
      !addLogoURL
    ) {
      return res
        .status(400)
        .json({ error: "Please provide all required fields" });
    }

    // If jobType is "remote", set jobLocation to empty string
    const updatedJobLocation = jobLocation === "" ? "Remote" : jobLocation;

    const updatedLogoURL = req.body.addLogoURL
      ? req.body.addLogoURL
      : "https://eu.ui-avatars.com/api/?name=John+Doe&size=250";

    // Create a new job listing
    const newJobListing = new JobListing({
      companyName,
      addLogoURL: updatedLogoURL,
      jobPosition,
      monthlySalary,
      jobType,
      remoteOnsite,
      jobLocation: updatedJobLocation,
      jobDescription,
      aboutCompany,
      skillsRequired,
    });

    await newJobListing.save();

    res.status(201).json({ message: "Job listing created successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/job-posting/:id", authenticateUser, async (req, res) => {
  try {
    const jobId = req.params.id;
    const {
      companyName,
      addLogoURL,
      jobPosition,
      monthlySalary,
      jobType,
      remoteOnsite,
      jobLocation,
      jobDescription,
      aboutCompany,
      skillsRequired,
    } = req.body;

    // Check if all the required fields are provided
    if (
      !companyName ||
      !jobPosition ||
      !jobDescription ||
      !skillsRequired ||
      !aboutCompany ||
      !monthlySalary ||
      !jobType ||
      !remoteOnsite ||
      !addLogoURL
    ) {
      return res
        .status(400)
        .json({ error: "Please provide all required fields" });
    }

    const updatedJobLocation = jobLocation === "" ? "Remote" : jobLocation;

    const updatedLogoURL = req.body.addLogoURL
      ? req.body.addLogoURL
      : "https://eu.ui-avatars.com/api/?name=John+Doe&size=250";

    // Find the existing job listing by ID
    const jobListing = await JobListing.findById(jobId);

    if (!jobListing) {
      return res.status(404).json({ error: "Job listing not found" });
    }

    // Update the job listing fields
    jobListing.companyName = companyName;
    jobListing.addLogoURL = updatedLogoURL;
    jobListing.jobPosition = jobPosition;
    jobListing.monthlySalary = monthlySalary;
    jobListing.jobType = jobType;
    jobListing.remoteOnsite = remoteOnsite;
    jobListing.jobLocation = updatedJobLocation;
    jobListing.jobDescription = jobDescription;
    jobListing.aboutCompany = aboutCompany;
    jobListing.skillsRequired = skillsRequired;

    // Save the updated job listing
    await jobListing.save();

    res.status(200).json({ message: "Job listing updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// List all jobs with filters based on skills
app.get("/jobs", async (req, res) => {
  try {
    const { skills, searchTerm } = req.query;

    const filter = {};
    if (skills) filter.skillsRequired = { $in: skills.split(",") };
    if (searchTerm) filter.jobPosition = new RegExp(searchTerm, "i");

    // Find job listings that match the filter
    const jobListings = await JobListing.find(filter);

    res.status(200).json({ jobListings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Show the detailed description of a job post
app.get("/jobs/:jobId", async (req, res) => {
  try {
    const { jobId } = req.params;

    // Find the job listing by ID
    const jobListing = await JobListing.findById(jobId);

    if (!jobListing) {
      return res.status(404).json({ error: "Job listing not found" });
    }

    res.status(200).json({ jobListing });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.use((req, res, next) => {
  const error = new Error("Not found");
  error.status = 404;
  next(error);
});

// Error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(500)
    .json({ error: "Something went wrong! Please try again later." });
});

module.exports = app;
