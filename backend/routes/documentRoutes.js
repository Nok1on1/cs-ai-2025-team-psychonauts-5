const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const { uploadDocument, getDocuments, getDocumentWithChunks, deleteDocument } = require("../controllers/documentControllers");

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // Just use timestamp, let controller handle proper naming
        const timestamp = Date.now();
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `${timestamp}${ext}`);
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        // Only allow PDF files
        const ext = path.extname(file.originalname).toLowerCase();
        if (ext === '.pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'), false);
        }
    }
});

// Routes
router.post('/upload', upload.single('file'), uploadDocument);
router.get('/', getDocuments);
router.get('/:documentId', getDocumentWithChunks);
router.delete('/:documentId', deleteDocument);

module.exports = router;
