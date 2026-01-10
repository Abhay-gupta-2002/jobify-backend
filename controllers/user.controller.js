exports.uploadPhoto = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    user.profilePhoto = req.file.path; // 👈 Cloudinary URL
    await user.save();

    res.json({ message: "Photo uploaded", photo: user.profilePhoto });
  } catch (err) {
    res.status(500).json({ message: "Photo upload failed" });
  }
};
exports.uploadResume = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    user.resume = req.file.path; // 👈 Cloudinary URL
    await user.save();

    res.json({ message: "Resume uploaded", resume: user.resume });
  } catch (err) {
    res.status(500).json({ message: "Resume upload failed" });
  }
};
