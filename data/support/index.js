"use strict";

const utils = require("../utils");
const config = require("../../config");
const sql = require("mssql");

const createReport = async (transData, userId) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("support");
    const data = await pool
      .request()
      .input("source_id", sql.BigInt, transData.sourceId)
      .input("category_id", sql.BigInt, transData.categoryId)
      .input("reference_id", sql.BigInt, transData.referenceId)
      .input("reporter_user_id", sql.VarChar(25), userId)
      .input("verification_status_code", sql.NVarChar(25), transData.verificationStatusCode)
      .input("remark", sql.NVarChar(sql.MAX), transData.remark)
      .input("user_id", sql.VarChar(25), userId)
      .query(sqlQueries.createReport);

    if (isNaN(userId)) {
      // No Send Notification to user
    } else {
      // Send Notification to user
      let vTitle = 'ระบบร้องเรียน';
      let vDescription = 'เราได้รับการร้องเรียนของคุณเรียบร้อยแล้ว';
      let vTypes = 'ReportComplaint';
      ; let notificationsId = null;
      const sendnotiData = await pool
        .request()
        .input("user_id", sql.BigInt, userId)
        .input("vTitle", sql.NVarChar(100), vTitle)
        .input("vDescription", sql.NVarChar(1000), vDescription)
        .input("vTypes", sql.NVarChar(50), vTypes)
        .input("patoisReportTransactionId", sql.BigInt, data.recordset[0].patois_report_transaction_id)
        .query(sqlQueries.sendReportNoti);

      notificationsId = sendnotiData.recordset[0].notificationsId;
    }

    return data.recordset[0].patois_report_transaction_id;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createReport,
};
