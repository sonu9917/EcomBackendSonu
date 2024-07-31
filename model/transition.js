import mongoose from 'mongoose';

// Define the schema for the Transition model
const transitionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    sessionId: {
        type: String,
        // required: true
    },
    transitionType: {
        type: String,
        enum: ['upgrade', 'extend', 'cancel', 'purchase'], // Possible transition types
        required: true,
        default: "purchase"
    },
    transitionDate: {
        type: Date,
        default: Date.now,
    },
    details: {
        type: String, // Additional details about the transition
    },
});

// Create and export the model
const Transition = mongoose.model('Transition', transitionSchema);
export default Transition;
