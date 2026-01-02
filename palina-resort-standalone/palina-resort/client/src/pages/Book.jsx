import React, { useState } from "react";
import { API_URL } from "../config.js";

export default function Book() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    date: "",
    nights: 1
  });
  const [status, setStatus] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Sending...");
    try {
      const res = await fetch(`${API_URL}/api/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setStatus("Booking sent successfully!");
      } else {
        setStatus("Error: " + data.error);
      }
    } catch (err) {
      setStatus("Failed to connect to server.");
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "400px", margin: "auto" }}>
      <h2>Book Your Stay</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <input name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
        <input name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} required />
        <input name="date" type="date" value={formData.date} onChange={handleChange} required />
        <input name="nights" type="number" min="1" value={formData.nights} onChange={handleChange} required />
        <button type="submit">Send Booking Request</button>
      </form>
      {status && <p>{status}</p>}
    </div>
  );
}
