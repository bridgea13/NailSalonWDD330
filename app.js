const express = require("express");
const app = express();
const path = require("path");
const { google } = require('googleapis');
const bodyParser = require('body-parser');
require('dotenv').config();

// Middleware and Configurations
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true })); // For form submissions
app.use(express.json()); // Parse JSON data
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
        { generalServices: "Natural Nail Services", priceRange: "$15-$30" },
        { generalServices: "Nail Enhancement Services", priceRange: "$20-$100" },
        { generalServices: "Nails for Kids", priceRange: "$10-$30" },
        { generalServices: "Waxing Services", priceRange: "$5-$30" },
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
app.post("/api/appointments", async (req, res) => {
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

// Catch-All Route for Errors
app.get("*", function (req, res) {
    res.send("Error 404! That route does not exist.");
});

// Start the Server
app.listen(3000, function () {
    console.log("NodeJS Web Application is now running on port 3000");
});
