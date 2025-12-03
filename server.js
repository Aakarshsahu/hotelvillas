const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/UserAuthRoutes"));

app.listen(process.env.PORT, () => {
  console.log("Server running on port", process.env.PORT);
});
