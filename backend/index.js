const express = require('express');
const cors = require('cors');
const connectDb = require('./config/dbConnection');


const app = express();
const port = 8000;

app.use(cors());
app.use(express.json());

connectDb();

app.get('/', (req, res) => {
    res.send('Dialogos Backend is running!');
});

app.use("/api/tests", require("./routes/quizRoutes"))

app.use("/api/authorization", require("./routes/authorizationRoutes"))

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
