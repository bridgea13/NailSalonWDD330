const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");
const { google } = require('googleapis');
const bodyParser = require('body-parser');
require('dotenv').config();

// Middleware and Configurations
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true })); // For form submissions
app.use(express.json()); // Parse JSON data

app.use(express.static(path.join(__dirname, 'public')));// Serve static files like images, CSS, JavaScript

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views")); // Set the views folder location

// Google Calendar Setup
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI, GOOGLE_REFRESH_TOKEN, GOOGLE_CALENDAR_ID } = process.env;

const oAuth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: GOOGLE_REFRESH_TOKEN });
const calendar = google.calendar({ version: "v3", auth: oAuth2Client });

// Routes
app.get("/home", function (req, res) {
    const services = [
        { generalServices: "Natural Nail Services", priceRange: "$15-$30", image: "./images/natural-nails.jpg"},
        { generalServices: "Nail Enhancement Services", priceRange: "$20-$100", image: "/images/nail-enhancement.jpg" },
        { generalServices: "Nails for Kids", priceRange: "$10-$30", image: "/images/kids-nails.jpg" },
        { generalServices: "Waxing Services", priceRange: "$5-$30", image: "/images/waxing-services.jpg" },
    ];
    res.render("home", { servicesList: services });
});

app.get("/services", function (req, res) {
    res.render("services");
});

app.get("/contact", function (req, res) {
    res.render("contact");
});

app.get("/appointments", function (req, res) {
    res.render("appointments", { message: null, error: null });
});

// Handle Appointment Form Submission
app.post("/appointments", async (req, res) => {
    const { name, email, date, time } = req.body;

    // Prepare event details
    const eventStartTime = new Date(`${date}T${time}:00`);
    const eventEndTime = new Date(new Date(eventStartTime).setHours(eventStartTime.getHours() + 1));

    const event = {
        summary: `Nail Salon Appointment - ${name}`,
        description: `Appointment for ${name}. Contact: ${email}`,
        start: {
            dateTime: eventStartTime,
            timeZone: "America/New_York", // Adjust to your time zone
        },
        end: {
            dateTime: eventEndTime,
            timeZone: "America/New_York",
        },
        attendees: [{ email }],
    };

    try {
        // Add event to Google Calendar
        await calendar.events.insert({
            calendarId: GOOGLE_CALENDAR_ID,
            resource: event,
        });

        res.render("appointments", { message: "Appointment booked successfully!", error: null });
    } catch (error) {
        console.error("Error creating event:", error.message);
        res.render("appointments", { error: "Error creating appointment. Please try again.", message: null });
    }
});

// Handle form submissions
app.post("/submit", (req, res) => {
    const { name, email, message } = req.body;

    // Define the CSV file path
    const csvFilePath = path.join(__dirname, "messages.csv");

    // Prepare the data to be written to the CSV
    const csvRow = `${name},${email},${message}\n`;

    // Append the form data to the CSV file
    fs.appendFile(csvFilePath, csvRow, (err) => {
        if (err) {
            console.error("Error writing to CSV file:", err);
            return res.status(500).send("Something went wrong! Please try again later.");
        }
        console.log("Form data saved to CSV file.");
        res.redirect("/home");
    });
});

// Catch-All Route for Errors
app.get("*", function (req, res) {
    res.send("Error 404! That route does not exist.");
});

// Start the Server
app.listen(3000, function () {
    console.log("NodeJS Web Application is now running on port 3000");
});
