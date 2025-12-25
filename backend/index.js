const express = require('express');
const cors = require('cors');
const connectDb = require('./config/dbConnection');
const cookieParser = require("cookie-parser");


const app = express();
const port = 8000;

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

connectDb();

app.get('/', (req, res) => {
    res.send('Dialogos Backend is running!');
});

app.use("/api/tests", require("./routes/quizRoutes"))

app.use("/api/authorization", require("./routes/authorizationRoutes"))

app.use("/api/documents", require("./routes/documentRoutes"))

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
