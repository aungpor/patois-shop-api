"use strict";

const utils = require("../utils");
const config = require("../../config");
const sql = require("mssql");

const createErrorLog = async (errorLogData, userId) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("errorLog");
    const interfaceLog = await pool.request()
      .input("user_id", sql.BigInt, userId)
      .input("error_from", sql.NVarChar(255), errorLogData.error_from)
      .input("error_name", sql.NVarChar(255), errorLogData.error_name)
      .input("error_func_name", sql.NVarChar(255), errorLogData.error_func_name)
      .input("error_code", sql.NVarChar(255), errorLogData.error_code)
      .input("error_massage", sql.NVarChar(sql.MAX), errorLogData.error_massage)
      .query(sqlQueries.createErrorLog);
    return interfaceLog.recordset[0].errorLogId;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createErrorLog
};
