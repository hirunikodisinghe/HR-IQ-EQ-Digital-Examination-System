const { sql, getPool } = require("../config/database");

const TOTAL_EQ_QUESTIONS = 10;
const VALID_OPTIONS = ["a", "b", "c", "d"];

function normalizeAnswers(answers) {
  const normalized = {};

  for (let index = 1; index <= TOTAL_EQ_QUESTIONS; index += 1) {
    const key = `HQ${index}`;
    normalized[key] = String(answers?.[key] || "")
      .trim()
      .toLowerCase();
  }

  return normalized;
}

async function startEQExam(req, res, next) {
  try {
    const recruitId = Number(req.body.recruitId);

    if (!Number.isInteger(recruitId) || recruitId <= 0) {
      return res.status(400).json({
        success: false,
        message: "A valid Recruit ID is required.",
      });
    }

    const pool = await getPool();

    const result = await pool
      .request()
      .input("RecruitID", sql.Int, recruitId)
      .query(`
        UPDATE CommonData.dbo.NewRecruitInformation
        SET HQExamStartTime =
          CASE
            WHEN HQExamStartTime IS NULL THEN GETDATE()
            ELSE HQExamStartTime
          END
        OUTPUT
          INSERTED.RecruitID,
          INSERTED.NHRNo,
          INSERTED.Name,
          INSERTED.HQExamStartTime
        WHERE RecruitID = @RecruitID
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Candidate was not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "EQ examination started successfully.",
      candidate: result.recordset[0],
    });
  } catch (error) {
    next(error);
  }
}

async function submitEQExam(req, res, next) {
  try {
    const recruitId = Number(req.body.recruitId);
    const answers = normalizeAnswers(req.body.answers);

    if (!Number.isInteger(recruitId) || recruitId <= 0) {
      return res.status(400).json({
        success: false,
        message: "A valid Recruit ID is required.",
      });
    }

    for (let index = 1; index <= TOTAL_EQ_QUESTIONS; index += 1) {
      const key = `HQ${index}`;

      if (!VALID_OPTIONS.includes(answers[key])) {
        return res.status(400).json({
          success: false,
          message: `Invalid or missing answer for ${key}.`,
        });
      }
    }

    const pool = await getPool();
    const request = pool.request();

    request.input("RecruitID", sql.Int, recruitId);

    for (let index = 1; index <= TOTAL_EQ_QUESTIONS; index += 1) {
      const key = `HQ${index}`;
      request.input(key, sql.VarChar(1), answers[key]);
    }

    const result = await request.query(`
      UPDATE CommonData.dbo.NewRecruitInformation
      SET
        HQ1 = @HQ1,
        HQ2 = @HQ2,
        HQ3 = @HQ3,
        HQ4 = @HQ4,
        HQ5 = @HQ5,
        HQ6 = @HQ6,
        HQ7 = @HQ7,
        HQ8 = @HQ8,
        HQ9 = @HQ9,
        HQ10 = @HQ10,
        HQExamEndTime = GETDATE()
      OUTPUT
        INSERTED.RecruitID,
        INSERTED.NHRNo,
        INSERTED.Name,
        INSERTED.HQ1,
        INSERTED.HQ2,
        INSERTED.HQ3,
        INSERTED.HQ4,
        INSERTED.HQ5,
        INSERTED.HQ6,
        INSERTED.HQ7,
        INSERTED.HQ8,
        INSERTED.HQ9,
        INSERTED.HQ10,
        INSERTED.HQExamStartTime,
        INSERTED.HQExamEndTime
      WHERE RecruitID = @RecruitID
    `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Candidate was not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "EQ examination submitted successfully.",
      candidate: result.recordset[0],
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  startEQExam,
  submitEQExam,
};
