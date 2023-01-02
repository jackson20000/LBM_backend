const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema({
    book_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
    },
    issueDate: { type: Date, default: Date.now() },
    returnDate: { type: Date, default: Date.now() + 7 * 24 * 60 * 60 * 1000 },
    isRenewed: { type: Boolean, default: false },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
});


module.exports = mongoose.model("Issue", issueSchema);