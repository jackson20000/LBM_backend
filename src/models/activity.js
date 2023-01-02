const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({
    info: String,
    category: String,
    time: {
        type: Date,
        default: Date.now(),
    }
});

module.exports = mongoose.model("Activity", activitySchema);