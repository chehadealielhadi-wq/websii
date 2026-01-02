import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { sendWhatsApp } from "./whatsapp.js";
import { addBooking, getBookings } from "./database.js";
import { exportToExcel } from "./excel.js";

dotenv.config();
const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

app.post("/api/book", async (req, res) => {
  const { name, phone, date, nights } = req.body;
  if (!name || !phone || !date)
    return res.status(400).json({ error: "Missing fields" });

  addBooking({ name, phone, date, nights });

  const msg = `📌 New Booking
Name: ${name}
Phone: ${phone}
Date: ${date}
Nights: ${nights || 1}`;

  try {
    await sendWhatsApp(msg);
    res.json({ success: true });
  } catch (err) {
    console.error("WhatsApp failed:", err);
    // Still return success if DB saved but WhatsApp failed, or handle as needed
    res.json({ success: true, warning: "WhatsApp notification failed" });
  }
});

app.get("/api/admin/export", async (req, res) => {
  try {
    const bookings = getBookings();
    const buffer = await exportToExcel(bookings);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=bookings.xlsx");
    res.send(buffer);
  } catch (err) {
    res.status(500).send("Export failed");
  }
});

app.get("/", (_, res) => res.send("Palina Resort API running"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
