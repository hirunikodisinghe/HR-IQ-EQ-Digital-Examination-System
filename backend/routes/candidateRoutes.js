const express = require("express");

const {
  getNextNHRNumber,
  registerCandidate,
} = require("../controllers/candidateController");

const router = express.Router();

router.get("/next-nhr-number", getNextNHRNumber);
router.post("/register", registerCandidate);

module.exports = router;