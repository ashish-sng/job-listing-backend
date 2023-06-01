const mongoose = require("mongoose");

const { Schema } = mongoose;

const jobListingSchema = new Schema({
  companyName: {
    type: String,
    required: [true, "Company name is required"],
  },
  addLogoURL: {
    type: String,
    validate: {
      validator: (value) => {
        // Simple URL validation
        const urlRegex = /^(http|https):\/\/[^ "]+$/;
        return urlRegex.test(value);
      },
      message: "Invalid logo URL",
    },
  },
  jobPosition: {
    type: String,
    required: [true, "Job position is required"],
  },
  monthlySalary: {
    type: String,
  },
  jobType: {
    type: String,
  },
  remoteOnsite: {
    type: String,
  },
  jobLocation: {
    type: String,
    required: [true, "Job location is required"],
  },
  jobDescription: {
    type: String,
    required: [true, "Job description is required"],
  },
  aboutCompany: {
    type: String,
  },
  skillsRequired: {
    type: [String],
  },
});

const jobListingModel = mongoose.model("JobListing", jobListingSchema);

module.exports = jobListingModel;
