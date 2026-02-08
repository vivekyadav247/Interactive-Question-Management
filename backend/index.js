const express = require("express");
const cors = require("cors");
const sheetRouter = require("./routes/sheet");

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.use("/api", sheetRouter);

const PORT = 3000;
app.listen(PORT);
