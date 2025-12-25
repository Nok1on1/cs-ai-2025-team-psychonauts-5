const mongoose = require('mongoose');

const connectDb = async () => {
    try {
        const connect = await mongoose.connect(process.env.MONGO_CONNECTION_STRING)

        console.log("Connected to MongoDB: " + connect.connection.host)
    } catch (e) {
        console.log("Error connecting to MongoDB: " + e)
        process.exit(1);
    }
}

module.exports = connectDb;