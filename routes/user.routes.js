const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");
const cloudinary = require("../config/cloudinary");
const User = require("../models/User");

/* ================= GET PROFILE ================= */
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ================= UPDATE PROFILE ================= */
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const { name, emailKey } = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { name, emailKey },
      { new: true }
    ).select("-password");

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ================= UPLOAD RESUME ================= */
router.post(
  "/resume",
  authMiddleware,
  upload.single("resume"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No resume uploaded" });
      }

      const result =  cloudinary.uploader.upload_stream(
        {
          folder: "jobify/resume",
          resource_type: "raw",
        },
        async (error, result) => {
          if (error) {
            return res.status(500).json({ error: error.message });
          }

          await User.findByIdAndUpdate(req.userId, {
            resume: result.secure_url, // ✅ STORE URL
          });

          res.json({
            success: true,
            resume: result.secure_url,
          });
        }
      );

      result.end(req.file.buffer);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

/* ================= UPLOAD PHOTO ================= */
router.post(
  "/photo",
  authMiddleware,
  upload.single("photo"),
  async (req, res) => {
    try {
      const result =  cloudinary.uploader.upload_stream(
        { folder: "jobify/profile" },
        async (error, result) => {
          if (error) {
            return res.status(500).json({ error: error.message });
          }

          await User.findByIdAndUpdate(req.userId, {
            profilePhoto: result.secure_url,
          });

          res.json({ success: true, photo: result.secure_url });
        }
      );

      result.end(req.file.buffer);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;
