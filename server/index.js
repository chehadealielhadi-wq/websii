import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { sendWhatsApp } from "./whatsapp.js";

dotenv.config();

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

app.post("/api/book", async (req, res) => {
  const { name, phone, date, nights } = req.body;
  if (!name || !phone || !date) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const message = `📌 New Booking
Name: ${name}
Phone: ${phone}
Date: ${date}
Nights: ${nights || 1}`;

  try {
    await sendWhatsApp(message);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "WhatsApp failed" });
  }
});

app.get("/", (req, res) => {
  res.send("Palina Resort API running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
