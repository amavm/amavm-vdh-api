import * as express from "express";

const app = express();

app.get("/", (req, res) => {
  res.send("VDH API 1.0.0")
})

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running in http://localhost:${PORT}`)
})
