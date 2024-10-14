const { Schema } = require("mongoose");

const OrdersSchema = new Schema({
    name: {
        type: String,
        required: true, // Ensure that name is provided
    },
    qty: {
        type: Number,
        required: true, // Ensure that qty is provided
        min: 1, // Prevent zero or negative quantities
    },
    price: {
        type: Number,
        required: true, // Ensure that price is provided
        min: 0, // Prevent negative prices
    },
    mode: {
        type: String,
        enum: ["BUY", "SELL"], // Restrict mode to valid values
        required: true, // Ensure that mode is provided
    },
    userId: {
        type: Schema.Types.ObjectId, // Use ObjectId type for referencing the User model
        required: true, // Ensure that userId is provided
        ref: "User" // Reference to the User model
    },
}, { timestamps: true }); // Automatically add createdAt and updatedAt fields

module.exports = { OrdersSchema };
