const { sql, getPool } = require("../config/database");

const TOTAL_IQ_QUESTIONS = 20;

async function startIQExam(req, res, next) {
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
        SET IQExamStartTime =
          CASE
            WHEN IQExamStartTime IS NULL THEN GETDATE()
            ELSE IQExamStartTime
          END
        OUTPUT
          INSERTED.RecruitID,
          INSERTED.NHRNo,
          INSERTED.Name,
          INSERTED.IQExamStartTime
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
      message: "IQ examination started successfully.",
      candidate: result.recordset[0],
    });
  } catch (error) {
    next(error);
  }
}

async function submitIQExam(req, res, next) {
  try {
    const recruitId = Number(req.body.recruitId);
    const { answers } = req.body;

    if (!Number.isInteger(recruitId) || recruitId <= 0) {
      return res.status(400).json({
        success: false,
        message: "A valid Recruit ID is required.",
      });
    }

    if (!answers || typeof answers !== "object") {
      return res.status(400).json({
        success: false,
        message: "IQ answers are required.",
      });
    }

    const requiredKeys = Array.from(
  { length: TOTAL_IQ_QUESTIONS },
  (_, index) => `IQ${index + 1}`
);

const normalizedAnswers = {};

for (const key of requiredKeys) {
  const value = String(
    answers[key] || ""
  ).trim();

  if (!value) {
    return res.status(400).json({
      success: false,
      message: `Missing answer for ${key}.`,
    });
  }

  normalizedAnswers[key] = value;
}

const pool = await getPool();
const request = pool.request();

request.input(
  "RecruitID",
  sql.Int,
  recruitId
);

requiredKeys.forEach((key) => {
  request.input(
    key,
    sql.VarChar(255),
    normalizedAnswers[key]
  );
});
    

    const result = await request.query(`
      UPDATE CommonData.dbo.NewRecruitInformation
      SET
        IQ1 = @IQ1,
        IQ2 = @IQ2,
        IQ3 = @IQ3,
        IQ4 = @IQ4,
        IQ5 = @IQ5,
        IQ6 = @IQ6,
        IQ7 = @IQ7,
        IQ8 = @IQ8,
        IQ9 = @IQ9,
        IQ10 = @IQ10,
        IQ11 = @IQ11,
        IQ12 = @IQ12,
        IQ13 = @IQ13,
        IQ14 = @IQ14,
        IQ15 = @IQ15,
        IQ16 = @IQ16,
        IQ17 = @IQ17,
        IQ18 = @IQ18,
        IQ19 = @IQ19,
        IQ20 = @IQ20,
        IQExamEndTime = GETDATE(),
        ExamEndTime = GETDATE()
      OUTPUT
        INSERTED.RecruitID,
        INSERTED.NHRNo,
        INSERTED.Name,
        INSERTED.IQ1,
        INSERTED.IQ2,
        INSERTED.IQ3,
        INSERTED.IQ4,
        INSERTED.IQ5,
        INSERTED.IQ6,
        INSERTED.IQ7,
        INSERTED.IQ8,
        INSERTED.IQ9,
        INSERTED.IQ10,
        INSERTED.IQ11,
        INSERTED.IQ12,
        INSERTED.IQ13,
        INSERTED.IQ14,
        INSERTED.IQ15,
        INSERTED.IQ16,
        INSERTED.IQ17,
        INSERTED.IQ18,
        INSERTED.IQ19,
        INSERTED.IQ20,
        INSERTED.IQExamStartTime,
        INSERTED.IQExamEndTime,
        INSERTED.ExamEndTime
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
      message: "IQ examination submitted successfully.",
      candidate: result.recordset[0],
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  startIQExam,
  submitIQExam,
};