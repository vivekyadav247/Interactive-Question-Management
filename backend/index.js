const express = require("express");
const cors = require("cors");
const sheetRouter = require("./routes/sheet");
require("dotenv").config();

const app = express();
app.use(
  cors({
    origin: [process.env.CLIENT_URL, "http://localhost:5173"],
  }),
);
app.use(express.json({ limit: "1mb" }));

app.use("/api", sheetRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
