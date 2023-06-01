const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const userModel = require("./models/userModel");

const app = express();
const port = process.env.PORT || 4000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

dotenv.config();

app.get("/", (req, res) => res.send("Hello World!"));

// Health check endpoint
app.get("/health", (req, res) => {
  const dbStatus =
    mongoose.connection.readyState === 1 ? "Connected" : "Disconnected";

  res.json({
    server: "Running",
    database: dbStatus,
  });
});

// Create a new user
app.post("/users", (req, res) => {
  const userData = req.body;

  const newUser = new userModel(userData);
  newUser
    .save()
    .then(() => {
      res.status(201).json({ message: "User created successfully" });
    })
    .catch((err) => {
      res.status(500).json({ error: "Failed to create user" });
    });
});

app.listen(port, () => {
  mongoose
    .connect(process.env.DB_CONNECT, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("MongoDB Connected");
      console.log(`App listening at http://localhost:${process.env.port}`);
    })
    .catch((err) => console.log(err));
});
