const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");
const os = require("os");
const axios = require("axios");

const authMiddleware = require("../middleware/auth.middleware");
const User = require("../models/User");

router.post("/apply", authMiddleware, async (req, res) => {
  try {
    const { company, toEmail, emailText } = req.body;

    if (!company || !toEmail || !emailText) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.email || !user.emailKey) {
      return res.status(400).json({
        message: "User email or app password not set",
      });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: user.email,
        pass: user.emailKey,
      },
    });

    const attachments = [];
    let tempPath = null;

    // 🔥 FIXED RESUME ATTACH
    if (user.resume) {
      tempPath = path.join(os.tmpdir(), "resume.pdf");

      const response = await axios({
        url: user.resume,
        method: "GET",
        responseType: "stream",
      });

      const writer = fs.createWriteStream(tempPath);
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      attachments.push({
        filename: "resume.pdf",
        path: tempPath,
      });
    }

    await transporter.sendMail({
      from: user.email,
      to: toEmail,
      subject: `Application for ${company}`,
      text: emailText,
      attachments,
    });

    if (tempPath) fs.unlinkSync(tempPath);

    user.applications.push({
      company,
      toEmail,
      emailText,
      status: "sent",
    });

    await user.save();

    res.json({ success: true, message: "Email sent successfully" });
  } catch (err) {
    console.error("SEND MAIL ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/list", authMiddleware, async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json({
    success: true,
    applications: user.applications,
  });
});

module.exports = router;
