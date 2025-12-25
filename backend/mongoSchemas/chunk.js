const mongoose = require('mongoose');

const chunkSchema = new mongoose.Schema({
    document_id: mongoose.Schema.Types.ObjectId, // ref to documents
    chunk_index: Number,
    text: String, // 500 chars approximately
    subject: String,
    topic: String,
    difficulty_level: Number, // 1-5, optional
    metadata: {
        page_number: Number,
        section: String
    }
});

const Chunk = mongoose.model('chunk', chunkSchema);

module.exports = Chunk;
