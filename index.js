require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const { HoldingsModel } = require("./model/HoldingsModel");
const { PositionsModel } = require("./model/PositionsModel");
const { OrdersModel } = require("./model/OrdersModel");
const authRoute = require("./Routes/AuthRoute");
const jwt = require("jsonwebtoken");


const PORT = process.env.PORT || 5000;
const uri = process.env.MONGO_URL;
const app = express();

// Check if MONGO_URL is set
if (!uri) {
    console.error("Error: MONGO_URL is not defined in environment variables.");
    process.exit(1);
}

// CORS configuration
const corsOptions = {
    origin: ['lazarus-dashboard.vercel.app', 'lazarus-dusky.vercel.app'], // The frontend URL
    credentials: true,
};

// Middleware setup
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(morgan("dev")); // Logging middleware

// Use authentication routes
app.use("/", authRoute);

// Centralized error handling middleware
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
};

// Endpoint to get all holdings
app.get("/allHoldings", async (req, res, next) => {
    try {
        const allHoldings = await HoldingsModel.find({});
        res.json(allHoldings);
    } catch (error) {
        next(error); // Pass error to the error handler
    }
});

// Endpoint to get all positions
app.get("/allPositions", async (req, res, next) => {
    try {
        const allPositions = await PositionsModel.find({});
        res.json(allPositions);
    } catch (error) {
        next(error);
    }
});


// Endpoint to create a new order
// app.post("/newOrder", async (req, res) => {
//     try {
//         const token = req.cookies.token;
//         if (!token) {
//             return res.status(401).json({ message: "Unauthorized" });
//         }

//         // Verify the JWT token
//         const decoded = jwt.verify(token, process.env.TOKEN_KEY);
//         const userId = decoded.id;  // Extract the userId from the token payload

//         const { name, qty, price, mode, symbol } = req.body;

//         if (!userId) {
//             return res.status(400).json({ error: "User ID is missing" });
//         }

//         if (mode !== "BUY" && mode !== "SELL") {
//             return res.status(400).json({ error: "Invalid order mode" });
//         }

//         // Handle SELL logic here (if necessary)

//         // Create the order
//         const newOrder = new OrdersModel({
//             name,
//             qty,
//             price,
//             mode,
//             userId,  // Store the userId in the order
//         });

//         await newOrder.save();
//         res.status(201).json({ message: "Order created successfully!" });
//     } catch (error) {
//         console.error("Error creating order:", error);
//         res.status(500).json({ error: "Internal server error" });
//     }
// });




app.post("/newOrder", async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Verify the JWT token
        const decoded = jwt.verify(token, process.env.TOKEN_KEY);
        const userId = decoded.id;  // Extract the userId from the token payload

        const { name, qty, price, mode, symbol } = req.body;

        if (!userId) {
            return res.status(400).json({ error: "User ID is missing" });
        }

        if (mode !== "BUY" && mode !== "SELL") {
            return res.status(400).json({ error: "Invalid order mode" });
        }

        // Add logic for handling sell orders (e.g., check if the user has enough stock)
        if (mode === "SELL") {
            // Here, you would typically check if the user has enough of the stock to sell
            const userOrders = await OrdersModel.find({ userId, mode: "BUY", symbol });
            let totalQty = 0;
            userOrders.forEach(order => {
                totalQty += order.qty; // Aggregate the quantity of stocks the user has bought
            });

            if (qty > totalQty) {
                return res.status(400).json({ error: "Not enough stock to sell" });
            }
        }

        // Create the order
        const newOrder = new OrdersModel({
            name,
            qty,
            price,
            mode,
            userId,  // Store the userId in the order
        });

        await newOrder.save();
        res.status(201).json({ message: "Order created successfully!" });
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});



  
  

// Endpoint to get all orders
app.get("/allOrders", async (req, res) => {
    try {
        const token = req.cookies.token;
        console.log(token);
        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Verify the token and get the userId
        const decoded = jwt.verify(token, process.env.TOKEN_KEY);
        const userId = decoded.id;

        if (!userId) {
            return res.status(400).json({ error: "User ID is missing" });
        }

        // Fetch orders for the specific user
        const userOrders = await OrdersModel.find({ userId });
        res.status(200).json(userOrders);
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});




  



// MongoDB connection and starting the server
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        app.listen(PORT, () => {
            console.log(`App is working on port ${PORT}!`);
            console.log("Database is connected!!");
        });
    })
    .catch((error) => {
        console.error("MongoDB connection error:", error);
    });

// Use the centralized error handling middleware
app.use(errorHandler);
