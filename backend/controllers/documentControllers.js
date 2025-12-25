const fs = require('fs');
const path = require('path');
const Document = require('../mongoSchemas/document');
const Chunk = require('../mongoSchemas/chunk');

// Helper function to split text into chunks
function splitIntoChunks(text, chunkSize = 500, overlap = 50) {
    const chunks = [];
    let i = 0;

    while (i < text.length) {
        const chunk = text.substr(i, chunkSize);
        chunks.push(chunk.trim());
        i += chunkSize - overlap; // Move forward with overlap
    }

    return chunks.filter(c => c.length > 0); // Remove empty chunks
}

// Upload and process document (text or PDF)
const uploadDocument = async (req, res) => {
    try {
        const { subject, topic, source, author, year, official, content } = req.body;

        if (!subject || !topic) {
            return res.status(400).json({ message: "Subject and topic are required" });
        }

        let fullText = '';
        let filename = '';

        // Check if content is provided as text
        if (content) {
            fullText = content;
            filename = `${topic.replace(/\s+/g, '_')}_${Date.now()}.txt`;
        } else if (req.file) {
            // If file is provided, read as text (supports .txt, .md, etc.)
            fullText = fs.readFileSync(req.file.path, 'utf-8');
            filename = req.file.originalname;
        } else {
            return res.status(400).json({ message: "Either file or content text is required" });
        }

        // Split into chunks
        const textChunks = splitIntoChunks(fullText, 500, 50);

        // Save document to MongoDB
        const document = await Document.create({
            filename,
            subject,
            topic,
            source: source || "User Upload",
            file_path: req.file?.path || "text_upload",
            total_chunks: textChunks.length,
            metadata: {
                author: author || "Unknown",
                year: year || new Date().getFullYear(),
                official: official || false
            }
        });

        // Save chunks to MongoDB
        const chunkDocuments = textChunks.map((text, index) => ({
            document_id: document._id,
            chunk_index: index,
            text,
            subject,
            topic,
            difficulty_level: 3, // Default to medium
            metadata: {
                page_number: Math.floor((index * 500) / 3000) + 1, // Estimate page
                section: topic
            }
        }));

        await Chunk.insertMany(chunkDocuments);

        // Clean up uploaded file if it exists
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.status(200).json({
            success: true,
            documentId: document._id,
            filename,
            chunksCreated: textChunks.length,
            message: "Document uploaded and processed successfully"
        });

    } catch (error) {
        console.error("Upload error:", error);
        
        // Clean up file if it exists
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({
            message: "Error uploading document",
            error: error.message
        });
    }
};

// Get all documents
const getDocuments = async (req, res) => {
    try {
        const documents = await Document.find();
        
        res.status(200).json({
            success: true,
            documents
        });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching documents",
            error: error.message
        });
    }
};

// Get document by ID with chunks
const getDocumentWithChunks = async (req, res) => {
    try {
        const { documentId } = req.params;

        const document = await Document.findById(documentId);
        if (!document) {
            return res.status(404).json({ message: "Document not found" });
        }

        const chunks = await Chunk.find({ document_id: documentId });

        res.status(200).json({
            success: true,
            document,
            chunks,
            totalChunks: chunks.length
        });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching document",
            error: error.message
        });
    }
};

// Delete document and its chunks
const deleteDocument = async (req, res) => {
    try {
        const { documentId } = req.params;

        const document = await Document.findByIdAndDelete(documentId);
        if (!document) {
            return res.status(404).json({ message: "Document not found" });
        }

        // Delete associated file
        if (fs.existsSync(document.file_path)) {
            fs.unlinkSync(document.file_path);
        }

        // Delete all chunks
        await Chunk.deleteMany({ document_id: documentId });

        res.status(200).json({
            success: true,
            message: "Document deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: "Error deleting document",
            error: error.message
        });
    }
};

module.exports = {
    uploadDocument,
    getDocuments,
    getDocumentWithChunks,
    deleteDocument
};
