const express = require("express");

const {
  startEQExam,
  submitEQExam,
} = require("../controllers/eqController");

const router = express.Router();

router.get("/test", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "EQ routes are working.",
  });
});

router.post("/start", startEQExam);
router.post("/submit", submitEQExam);

module.exports = router;