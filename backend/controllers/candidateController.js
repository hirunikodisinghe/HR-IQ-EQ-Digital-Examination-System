const { sql, getPool } = require("../config/database");

/*
|--------------------------------------------------------------------------
| Get next NHR number
|--------------------------------------------------------------------------
| Uses the exact SQL formatting logic provided for NewRecruitNo.
*/
async function getNextNHRNumber(req, res, next) {
  try {
    const pool = await getPool();

    const result = await pool.request().query(`
      SELECT
        CASE
          WHEN LEN(d.DocNo) = 1
            THEN CONCAT(d.DocCode, '000000', CAST(d.DocNo AS NVARCHAR))
          WHEN LEN(d.DocNo) = 2
            THEN CONCAT(d.DocCode, '00000', CAST(d.DocNo AS NVARCHAR))
          WHEN LEN(d.DocNo) = 3
            THEN CONCAT(d.DocCode, '0000', CAST(d.DocNo AS NVARCHAR))
          WHEN LEN(d.DocNo) = 4
            THEN CONCAT(d.DocCode, '000', CAST(d.DocNo AS NVARCHAR))
          WHEN LEN(d.DocNo) = 5
            THEN CONCAT(d.DocCode, '00', CAST(d.DocNo AS NVARCHAR))
          WHEN LEN(d.DocNo) = 6
            THEN CONCAT(d.DocCode, '0', CAST(d.DocNo AS NVARCHAR))
          WHEN LEN(d.DocNo) = 7
            THEN CONCAT(d.DocCode, CAST(d.DocNo AS NVARCHAR))
        END AS NHRNo
      FROM CommonData.dbo.NewRecruitNo d
      WHERE d.DocType = 'NHRNo'
        AND d.DocCode = 'NHRNo'
    `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "NHR number configuration was not found.",
      });
    }

    return res.status(200).json({
      success: true,
      nhrNo: result.recordset[0].NHRNo,
    });
  } catch (error) {
    next(error);
  }
}

/*
|--------------------------------------------------------------------------
| Register candidate
|--------------------------------------------------------------------------
| 1. Locks the NewRecruitNo counter row.
| 2. Generates the NHR number using the same SQL logic.
| 3. Inserts the candidate into NewRecruitInformation.
| 4. Increases DocNo by 1.
| 5. Commits everything as one transaction.
*/
async function registerCandidate(req, res, next) {
  const {
    name,
    position,
    address,
    email,
    mobileNumber,
    dateOfBirth,
  } = req.body;

  if (
    !name?.trim() ||
    !position?.trim() ||
    !address?.trim() ||
    !email?.trim() ||
    !mobileNumber?.trim() ||
    !dateOfBirth
  ) {
    return res.status(400).json({
      success: false,
      message: "Please complete all required fields.",
    });
  }

  const namePattern = /^[A-Za-z\s.'-]+$/;
  const positionPattern = /^[A-Za-z\s.'-]+$/;
  const emailPattern =
    /^[A-Za-z._%+-]+@[A-Za-z.-]+\.[A-Za-z]{2,}$/;
  const mobilePattern = /^\d{10}$/;

  if (!namePattern.test(name.trim())) {
    return res.status(400).json({
      success: false,
      message:
        "Candidate name can contain only letters, spaces, apostrophes, dots, and hyphens.",
    });
  }

  if (!positionPattern.test(position.trim())) {
    return res.status(400).json({
      success: false,
      message:
        "Applied position can contain only letters, spaces, apostrophes, dots, and hyphens.",
    });
  }

  if (!emailPattern.test(email.trim())) {
    return res.status(400).json({
      success: false,
      message: "Please enter a valid email address without numbers.",
    });
  }

  if (!mobilePattern.test(mobileNumber.trim())) {
    return res.status(400).json({
      success: false,
      message: "Mobile number must contain exactly 10 digits.",
    });
  }

  const selectedDate = new Date(dateOfBirth);

  if (Number.isNaN(selectedDate.getTime())) {
    return res.status(400).json({
      success: false,
      message: "Please enter a valid date of birth.",
    });
  }

  const today = new Date();
  selectedDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  if (selectedDate > today) {
    return res.status(400).json({
      success: false,
      message: "Date of birth cannot be a future date.",
    });
  }

  let transaction;

  try {
    const pool = await getPool();

    transaction = new sql.Transaction(pool);

    await transaction.begin(
      sql.ISOLATION_LEVEL.SERIALIZABLE
    );

    /*
    |--------------------------------------------------------------------------
    | Lock and generate the current NHR number
    |--------------------------------------------------------------------------
    */
    const numberRequest = new sql.Request(transaction);

    const numberResult = await numberRequest.query(`
      SELECT
        d.DocNo,
        d.DocCode,
        CASE
          WHEN LEN(d.DocNo) = 1
            THEN CONCAT(d.DocCode, '000000', CAST(d.DocNo AS NVARCHAR))
          WHEN LEN(d.DocNo) = 2
            THEN CONCAT(d.DocCode, '00000', CAST(d.DocNo AS NVARCHAR))
          WHEN LEN(d.DocNo) = 3
            THEN CONCAT(d.DocCode, '0000', CAST(d.DocNo AS NVARCHAR))
          WHEN LEN(d.DocNo) = 4
            THEN CONCAT(d.DocCode, '000', CAST(d.DocNo AS NVARCHAR))
          WHEN LEN(d.DocNo) = 5
            THEN CONCAT(d.DocCode, '00', CAST(d.DocNo AS NVARCHAR))
          WHEN LEN(d.DocNo) = 6
            THEN CONCAT(d.DocCode, '0', CAST(d.DocNo AS NVARCHAR))
          WHEN LEN(d.DocNo) = 7
            THEN CONCAT(d.DocCode, CAST(d.DocNo AS NVARCHAR))
        END AS NHRNo
      FROM CommonData.dbo.NewRecruitNo d
        WITH (UPDLOCK, HOLDLOCK)
      WHERE d.DocType = 'NHRNo'
        AND d.DocCode = 'NHRNo'
    `);

    if (numberResult.recordset.length === 0) {
      await transaction.rollback();

      return res.status(404).json({
        success: false,
        message: "NHR number configuration was not found.",
      });
    }

    const nhrNo = numberResult.recordset[0].NHRNo;

    if (!nhrNo) {
      await transaction.rollback();

      return res.status(500).json({
        success: false,
        message:
          "The NHR number could not be generated. Check the DocNo value.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Insert candidate
    |--------------------------------------------------------------------------
    */
    const insertRequest = new sql.Request(transaction);

    insertRequest.input("NHRNo", sql.VarChar(255), nhrNo);
    insertRequest.input("Name", sql.VarChar(255), name.trim());
    insertRequest.input(
      "Position",
      sql.VarChar(255),
      position.trim()
    );
    insertRequest.input(
      "Address",
      sql.VarChar(255),
      address.trim()
    );
    insertRequest.input(
      "Email",
      sql.VarChar(255),
      email.trim().toLowerCase()
    );
    insertRequest.input(
      "MobileNumber",
      sql.VarChar(255),
      mobileNumber.trim()
    );
    insertRequest.input(
      "DateOfBirth",
      sql.Date,
      dateOfBirth
    );

    const insertResult = await insertRequest.query(`
      INSERT INTO CommonData.dbo.NewRecruitInformation
      (
        NHRNo,
        Name,
        Position,
        Address,
        Email,
        MobileNumber,
        DateOfBirth,
        ExamStartTime
      )
      OUTPUT
        INSERTED.RecruitID,
        INSERTED.NHRNo,
        INSERTED.Name,
        INSERTED.Position,
        INSERTED.Address,
        INSERTED.Email,
        INSERTED.MobileNumber,
        INSERTED.DateOfBirth,
        INSERTED.ExamStartTime
      VALUES
      (
        @NHRNo,
        @Name,
        @Position,
        @Address,
        @Email,
        @MobileNumber,
        @DateOfBirth,
        GETDATE()
      )
    `);

    /*
    |--------------------------------------------------------------------------
    | Increase the NHR counter only after successful insert
    |--------------------------------------------------------------------------
    */
    const updateRequest = new sql.Request(transaction);

    const updateResult = await updateRequest.query(`
      UPDATE CommonData.dbo.NewRecruitNo
      SET DocNo = DocNo + 1
      WHERE DocType = 'NHRNo'
        AND DocCode = 'NHRNo'
    `);

    if (updateResult.rowsAffected[0] !== 1) {
      throw new Error(
        "The NHR number counter could not be updated."
      );
    }

    await transaction.commit();

    return res.status(201).json({
      success: true,
      message: "Candidate registered successfully.",
      candidate: insertResult.recordset[0],
    });
  } catch (error) {
    if (transaction) {
      try {
        await transaction.rollback();
      } catch {
        // Transaction may already be completed.
      }
    }

    next(error);
  }
}

module.exports = {
  getNextNHRNumber,
  registerCandidate,
};
