const utils = require("../data/utils");
const sql = require("mssql");
const config = require('../config');
const CryptoJS = require("crypto-js");

const verifySignature = async (req, res, next) => {
  try {
    let usered = await utils.getUser(req.headers.token);
    if (usered.error === "Token is expired!") {
      res.status(401).send({ ResponseCode: 401, ResponseMsg: usered.error });
    } else {
      try {
        let pool = await sql.connect(config.sql);
        const result = await pool
          .request()
          .input("userId", sql.BigInt, usered.userId)
          .query`select user_secret from users WITH (NOLOCK) where id = @userId`
        if (req.headers.signature == CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(JSON.stringify(req.body), result.recordset[0].user_secret))) {
          await pool
            .request()
            .input("tid", sql.NVarChar(50), req.body.tid)
            .input("userId", sql.BigInt, usered.userId)
            .input("event", sql.NVarChar(100), req.originalUrl)
            .input("body", sql.NVarChar(sql.MAX), JSON.stringify(req.body))
            .query`INSERT INTO dbo.patois_api_transaction (api_transaction_id, user_id, create_date, update_date, event, body) VALUES(@tid, @userId, getdate(), getdate(), @event, @body)`
          next();
        }
        else {
          // ถ้ามีการดัดแปลง request.body
          res.status(401).send({ ResponseCode: 401, ResponseMsg: "Unauthorized" });
        }
      } catch (e) {
        // ถ้า tid ซ้ำ เก็บ log patois_api_transaction_dupilcate
        let pool = await sql.connect(config.sql);
        await pool
          .request()
          .input("tid", sql.NVarChar(50), req.body.tid)
          .input("userId", sql.BigInt, usered.userId)
          .input("event", sql.NVarChar(100), req.originalUrl)
          .input("body", sql.NVarChar(sql.MAX), JSON.stringify(req.body))
          .query`INSERT INTO dbo.patois_api_transaction_dupilcate (api_transaction_id, user_id, create_date, update_date, event, body) VALUES(@tid, @userId, getdate(), getdate(), @event, @body)`
        res.status(401).send({ ResponseCode: 401, ResponseMsg: "Unauthorized" });
      }
    }
  }
  catch (error) {
    res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message });
  }
};

module.exports = verifySignature;
