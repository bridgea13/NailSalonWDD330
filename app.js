const express = require("express");
const app = express();
const path = require("path");

app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views")); // Set the views folder location

app.get("/home", function(req, res){
    //app.get("/game/:gameTitle/:gameCreator", function(req, res){) didn't use because don't want it to work like that
    const generalServices = req.params.serviceName;
    const priceRange = req.params.newPrice;
    //services list
    const services = [
        {generalServices: "Natural Nail Services", priceRange: "$15-$30"},
        {generalServices: "Nail Enhancement Services", priceRange: "$20-$100"},        
        {generalServices: "Nails for Kids", priceRange: "$10-$30"},
        {generalServices: "Waxing Services", priceRange: "$5-$30"},
    ]
    res.render("home", {
        servicesList: services
        //generalServices: generalServices,
        //priceRange: priceRange,
    });
});

app.get("/services", function(req, res){
    res.render("services");      
    
});

app.get("/contact", function(req, res){
    res.render("contact");
});

app.get("/appointments", function(req, res){
    res.render("appointments");
});

//app.get("/contact/:locationInfo/:tech", function(req, res){
    //res.send("Contact Us Now! " + req.params.locationInfo + "!!");
    //const phone = req.params.locationInfo;
    //const nailTech = req.params.tech; You can have multiple in one app.get
//});

app.get("*", function(req, res){
    res.send("Error 404! That route does not exist.");
});

app.listen("3000", function(){
    console.log("NodeJS Web Application is now running on port 3000");
});