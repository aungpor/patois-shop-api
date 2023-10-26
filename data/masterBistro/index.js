"use strict";

const utils = require("../utils");
const config = require("../../config");
const sql = require("mssql");

const getShopTypes = async () => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("masterBistro");
    const shopTypes = await pool.request().query(sqlQueries.shopTypes);
    return shopTypes.recordset;
  } catch (error) {
    throw error;
  }
};

const getFoodTypes = async () => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("masterBistro");
    const data = await pool.request().query(sqlQueries.foodTypes);
    return data.recordset;
  } catch (error) {
    throw error;
  }
};
const getPriceRangs = async () => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("masterBistro");
    const data = await pool.request().query(sqlQueries.priceRangs);
    return data.recordset;
  } catch (error) {
    throw error;
  }
};

const shopEatingType = async () => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("masterBistro");
    const shopeatTypes = await pool.request().query(sqlQueries.shopEatingType);
    return shopeatTypes.recordset;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getShopTypes,
  getFoodTypes,
  getPriceRangs,
  shopEatingType,
};
