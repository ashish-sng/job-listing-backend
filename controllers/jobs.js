const JobListing = require("../models/jobListingModel");

exports.addJob = async (req, res) => {
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
};

exports.updateJob = async (req, res) => {
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
};

exports.getAllJobs = async (req, res) => {
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
};

exports.getOneJob = async (req, res) => {
  try {
    const { id: jobId } = req.params;

    // Find the job listing by ID
    const jobListing = await JobListing.findById(jobId);

    if (!jobListing) {
      return res.status(404).json({ error: "Job listing not found" });
    }

    res.status(200).json({ jobListing });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
