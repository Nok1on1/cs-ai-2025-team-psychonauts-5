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
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        // Only allow PDF files
        if (path.extname(file.originalname).toLowerCase() === '.pdf') {
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
