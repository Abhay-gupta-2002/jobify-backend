require("dotenv").config();

const connectDB = require("./config/db");
connectDB();

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const applicationRoutes = require("./routes/application.routes");

const { generateEmail } = require("./services/ai.service");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/application", applicationRoutes);
const authMiddleware = require("./middleware/auth.middleware");
const User = require("./models/User");

/* ===== AI GENERATE ===== */
app.post("/generate-email", authMiddleware, async (req, res) => {
  try {
    const { jobText, company } = req.body;

    if (!jobText || !company) {
      return res.status(400).json({ message: "Missing fields" });
    }

    // 🔑 logged-in user
    const user = await User.findById(req.userId);

    const emailBody = await generateEmail({ jobText, company });

    // ✅ name backend se append
    const finalEmail =emailBody;

    res.json({
      success: true,
      emailText: finalEmail,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


app.get("/", (req, res) => {
  res.send("backend running");
});

app.listen(5000, () => {
  console.log("server running on port 5000");
});
