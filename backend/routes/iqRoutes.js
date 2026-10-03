const express = require("express");

const {
  startIQExam,
  submitIQExam,
} = require("../controllers/iqController");

const router = express.Router();

router.get("/test", (req, res) => {
  return res.json({
    success: true,
    message: "IQ routes are working.",
  });
});

router.post("/start", startIQExam);
router.post("/submit", submitIQExam);

module.exports = router;