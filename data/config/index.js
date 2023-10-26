"use strict";

const utils = require("../utils");
const config = require("../../config");
const sql = require("mssql");

const getConfigMessage = async (message_type, message_code) => {
   try {
     let pool = await sql.connect(config.sql);
     const sqlQueries = await utils.loadSqlQueryies("config");
     const patoisConfig = await pool.request()
     .input("message_type", sql.VarChar(25), message_type)
     .input("message_code", sql.NVarChar(25), message_code)
     .query(sqlQueries.patoisConfigMessage);
     return patoisConfig.recordset && patoisConfig.recordset.length !=0 ? patoisConfig.recordset[0] : null ;
   } catch (error) {
     throw error;
   }
 };

module.exports = {
    getConfigMessage,
  };
  