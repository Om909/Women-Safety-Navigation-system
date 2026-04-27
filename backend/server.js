require("dotenv").config(); // ⚠️ sabse upar

const express = require("express");
const cors = require("cors");
const twilio = require("twilio");
const fs = require("fs");
const path = require("path");

const app = express();

/* ================= MIDDLEWARE ================= */
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use("/uploads", express.static("uploads"));

/* ================= TWILIO ================= */
if (!process.env.TWILIO_SID || !process.env.TWILIO_TOKEN) {
  console.log("❌ Twilio credentials missing in .env");
  process.exit(1);
}

const client = twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_TOKEN
);

/* ================= CONTACTS ================= */
if (!process.env.CONTACTS) {
  console.log("❌ CONTACTS missing in .env");
  process.exit(1);
}

const CONTACTS = process.env.CONTACTS.split(",");

/* ================= STATE ================= */
let lastLocation = null;
let lastUpdateTime = null;

/* ================= UTILS ================= */

// 📏 distance calculation
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const toRad = (deg) => (deg * Math.PI) / 180;

  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);

  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) *
    Math.cos(φ2) *
    Math.sin(Δλ / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/* ================= ALERT FUNCTION ================= */

async function sendAlert(lat, lon, fileName = null) {
  const locationLink = `https://maps.google.com/?q=${lat},${lon}`;
  const time = new Date().toLocaleString();

  let message = `🚨 EMERGENCY ALERT!

User may be in danger!

📍 Location:
${locationLink}

🕒 Time:
${time}`;

  if (fileName) {
    const imageLink = `${process.env.BASE_URL}/uploads/${fileName}`;
    message += `

📷 Vehicle Image:
${imageLink}`;
  }

  try {
    for (let number of CONTACTS) {
      await client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE,
        to: number.trim(),
      });
    }

    console.log("📩 ALERT SENT");
  } catch (err) {
    console.log("❌ Twilio Error:", err.message);
  }
}

/* ================= ROUTES ================= */

// 🚗 Start journey
app.post("/start", (req, res) => {
  lastLocation = null;
  lastUpdateTime = Date.now();

  res.json({ message: "Journey started" });
});

// 📍 Location tracking
app.post("/location", async (req, res) => {
  try {
    const { lat, lon } = req.body;
    const now = Date.now();

    if (!lat || !lon) {
      return res.status(400).json({ error: "Missing lat/lon" });
    }

    console.log("📍 Location:", lat, lon);

    if (lastLocation) {
      const distance = getDistance(
        lat,
        lon,
        lastLocation.lat,
        lastLocation.lon
      );

      // 🚨 No movement detected
      if (distance < 10) {
        if (now - lastUpdateTime > 120000) {
          console.log("🚨 User not moving!");
          await sendAlert(lat, lon);
          lastUpdateTime = now;
        }
      } else {
        lastUpdateTime = now;
      }
    }

    lastLocation = { lat, lon };

    res.sendStatus(200);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Location error" });
  }
});

// 📷 Upload image
app.post("/upload", (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: "No image provided" });
    }

    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const fileName = `capture_${Date.now()}.jpg`;

    const uploadPath = path.join(__dirname, "uploads");

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }

    fs.writeFileSync(
      path.join(uploadPath, fileName),
      base64Data,
      "base64"
    );

    res.json({ fileName });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Upload failed" });
  }
});

// 🚨 SOS trigger
app.post("/sos", async (req, res) => {
  try {
    const { lat, lon, fileName } = req.body;

    if (!lat || !lon) {
      return res.status(400).json({ error: "Missing lat/lon" });
    }

    console.log("🚨 SOS TRIGGERED");

    await sendAlert(lat, lon, fileName);

    res.json({ message: "SOS sent!" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "SOS failed" });
  }
});

/* ================= SERVER ================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});