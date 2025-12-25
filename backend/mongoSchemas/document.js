const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    filename: String,
    subject: String, // "Math", "English", "Georgian"
    topic: String,
    source: String, // "Ministry of Education", etc.
    file_path: String,
    total_chunks: Number,
    upload_date: {
        type: Date,
        default: Date.now
    },
    metadata: {
        author: String,
        year: Number,
        official: Boolean
    }
});

const Document = mongoose.model('document', documentSchema);

module.exports = Document;
