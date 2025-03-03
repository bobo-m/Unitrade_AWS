const mongoose = require('mongoose');

const connectDataBase = () => {
    mongoose.connect("mongodb://127.0.0.1:27017/project_v5", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // Increase server selection timeout
      socketTimeoutMS: 45000 // Increase socket timeout
    }).then((data) => {
      console.log(`MongoDB connected with server: ${data.connection.host}`);
    })
  }

 // connectDataBase();
module.exports = connectDataBase