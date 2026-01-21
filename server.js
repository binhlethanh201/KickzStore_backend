const express = require("express");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 9999;
const connectDB = require("./config/db");
const router = require("./routes/index");
const cors = require("cors");
const morgan = require('morgan');

app.use(cors());
app.use(
  cors({
    origin: ["http://localhost:8081"],
  })
);

app.use(morgan('dev'))
app.use(express.json());
connectDB();

app.use("/api", router);
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
