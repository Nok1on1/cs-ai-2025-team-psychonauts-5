const express = require('express');
const cors = require('cors');

const app = express();
const port = 8000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Dialogos Backend is running!');
});

app.use("/api/tests", require("./routes/quizRoutes"))

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
