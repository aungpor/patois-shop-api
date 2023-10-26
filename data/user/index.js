"use strict";

const utils = require("../utils");
const config = require("../../config");
const sql = require("mssql");

const getUserProfileById = async (userId) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("user");
    const user = await pool
      .request()
      .input("userId", sql.Int, userId)
      .query(sqlQueries.userProfileById);
    return user.recordset;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getUserProfileById,
};
