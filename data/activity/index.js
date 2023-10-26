"use strict";

const utils = require("../utils");
const config = require("../../config");
const sql = require("mssql");
const errorLogData = require("../errorLog");

const getActivityShopsHit = async (lat, lng, pageNumber, rowsOfPage, group_code) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("activity");
    const user = await pool
      .request()
      .input("lat", sql.Decimal(10, 8), lat)
      .input("lng", sql.Decimal(11, 8), lng)
      .input("pageNumber", sql.Int, 1)
      .input("rowsOfPage", sql.Int, 21)
      .input("group_code", sql.VarChar(25), group_code)
      .query(sqlQueries.activityShopsHitListFixShop);
    let shopMap = new Map();
    for (let i = 0; i < user.recordset.length; i++) {
      let sData = user.recordset[i];
      shopMap.set(sData.sid, sData);
    }

    let pool2 = await sql.connect(config.sql);
    let user2;
    if (group_code == 'G001') {// Random
      return user.recordset;
    } else {
      user2 = await pool2
        .request()
        .input("group_code", sql.VarChar(25), group_code)
        .query(sqlQueries.getShopTopHisConfig);
      let shopDataList = [];
      for (let i = 0; i < user2.recordset.length; i++) {
        let sData = user2.recordset[i];
        let shopData = shopMap.get(sData.shop_id);
        if (shopData) {
          shopDataList.push(shopData);
        }
      }

      return shopDataList;
    }
    // End New Fix shop
  } catch (error) {
    const requestErrorLog = await errorLogData.createErrorLog({
      error_from: "Patois Api",
      error_name: "Catch error",
      error_func_name: "getActivityShopsHit",
      error_code: "",
      error_massage: error.message
    }, '');
    throw error;
  }
};

const getActivityShopsHitAuth = async (lat, lng, pageNumber, rowsOfPage, group_code, userId) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("activity");
    const user = await pool
      .request()
      .input("lat", sql.Decimal(10, 8), lat)
      .input("lng", sql.Decimal(11, 8), lng)
      .input("pageNumber", sql.Int, 1)
      .input("rowsOfPage", sql.Int, 21)
      .input("group_code", sql.VarChar(25), group_code)
      .query(sqlQueries.activityShopsHitListFixShop);
    let shopMap = new Map();
    for (let i = 0; i < user.recordset.length; i++) {
      let sData = user.recordset[i];
      shopMap.set(sData.sid, sData);
    }
    let pool2 = await sql.connect(config.sql);
    let user2;

    if (group_code == 'G001') {
      const activityUser = await pool
        .request()
        .input("userId", sql.BigInt, userId)
        .query(sqlQueries.getActivityByUserId);
      if (!activityUser.recordset[0].lastview_id && !activityUser.recordset[0].lastreview_id) {
        return user.recordset;
      }
      else {
        if (activityUser.recordset[0].lastreview_id) {
          if (activityUser.recordset[0].lastreview_name == 'คาเฟ่ ของหวาน ไอศกรีม เบเกอรี่ เครื่องดื่ม') {
            return user.recordset;
          }
          else {
            const data = await pool
              .request()
              .input("lat", sql.Decimal(10, 8), lat)
              .input("lng", sql.Decimal(11, 8), lng)
              .input("pageNumber", sql.Int, 1)
              .input("rowsOfPage", sql.Int, 21)
              .input("group_code", sql.VarChar(25), group_code)
              .input("foodType_id", sql.Int, activityUser.recordset[0].lastreview_id)
              .query(sqlQueries.activityShopsHitListFixShopEqualFoodTypeId);
            // อาหารอีสาน, อาหารทะเล, อาหารไทย
            if (activityUser.recordset[0].lastreview_name == 'อาหารอีสาน' || activityUser.recordset[0].lastreview_name == 'อาหารทะเล' || activityUser.recordset[0].lastreview_name == 'อาหารไทย') {
              const result = shuffle(data.recordset);
              return result;
            }
            else {
              const data2 = await pool
                .request()
                .input("lat", sql.Decimal(10, 8), lat)
                .input("lng", sql.Decimal(11, 8), lng)
                .input("pageNumber", sql.Int, 1)
                .input("rowsOfPage", sql.Int, 21)
                .input("group_code", sql.VarChar(25), group_code)
                .input("foodType_id", sql.Int, activityUser.recordset[0].lastreview_id)
                .query(sqlQueries.activityShopsHitListFixShopNotEqualFoodTypeId);
              data2.recordset.length = data2.recordset.length - data.recordset.length;
              const dataShuffle = shuffle(data.recordset);
              const result = dataShuffle.concat(data2.recordset);
              return result;
            }
          }
        }
        else if (activityUser.recordset[0].lastview_id) {
          if (activityUser.recordset[0].lastview_name == 'คาเฟ่ ของหวาน ไอศกรีม เบเกอรี่ เครื่องดื่ม') {
            return user.recordset;
          }
          else {
            const data = await pool
              .request()
              .input("lat", sql.Decimal(10, 8), lat)
              .input("lng", sql.Decimal(11, 8), lng)
              .input("pageNumber", sql.Int, 1)
              .input("rowsOfPage", sql.Int, 21)
              .input("group_code", sql.VarChar(25), group_code)
              .input("foodType_id", sql.BigInt, activityUser.recordset[0].lastview_id)
              .query(sqlQueries.activityShopsHitListFixShopEqualFoodTypeId);
            // อาหารอีสาน, อาหารทะเล, อาหารไทย
            if (activityUser.recordset[0].lastview_name == 'อาหารอีสาน' || activityUser.recordset[0].lastview_name == 'อาหารทะเล' || activityUser.recordset[0].lastview_name == 'อาหารไทย') {
              const result = shuffle(data.recordset);
              return result;
            }
            else {
              const data2 = await pool
                .request()
                .input("lat", sql.Decimal(10, 8), lat)
                .input("lng", sql.Decimal(11, 8), lng)
                .input("pageNumber", sql.Int, 1)
                .input("rowsOfPage", sql.Int, 21)
                .input("group_code", sql.VarChar(25), group_code)
                .input("foodType_id", sql.Int, activityUser.recordset[0].lastview_id)
                .query(sqlQueries.activityShopsHitListFixShopNotEqualFoodTypeId);
              data2.recordset.length = data2.recordset.length - data.recordset.length;
              const dataShuffle = shuffle(data.recordset);
              const result = dataShuffle.concat(data2.recordset);
              return result;
            }
          }
        }
      }
    } else {
      user2 = await pool2
        .request()
        .input("group_code", sql.VarChar(25), group_code)
        .query(sqlQueries.getShopTopHisConfig);
      let shopDataList = [];
      for (let i = 0; i < user2.recordset.length; i++) {
        let sData = user2.recordset[i];
        let shopData = shopMap.get(sData.shop_id);
        if (shopData) {
          shopDataList.push(shopData);
        }
      }
      return shopDataList;
    }
  } catch (error) {

    const requestErrorLog = await errorLogData.createErrorLog({
      error_from: "Patois Api",
      error_name: "Catch error",
      error_func_name: "getActivityShopsHitAuth",
      error_code: "",
      error_massage: error.message
    }, '');
    throw error;
  }
};

const getActivityShopsNearby = async (lat, lng, pageNumber, rowsOfPage) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("activity");
    const user = await pool
      .request()
      .input("lat", sql.Decimal(10, 8), lat)
      .input("lng", sql.Decimal(11, 8), lng)
      .input("pageNumber", sql.Int, pageNumber)
      .input("rowsOfPage", sql.Int, rowsOfPage)
      .query(sqlQueries.activityShopsNearby);
    return user.recordset;
  } catch (error) {
    const requestErrorLog = await errorLogData.createErrorLog({
      error_from: "Patois Api",
      error_name: "Catch error",
      error_func_name: "getActivityShopsNearby",
      error_code: "",
      error_massage: error.message
    }, '');
    throw error;
  }
};

module.exports = {
  getActivityShopsHit,
  getActivityShopsHitAuth,
  getActivityShopsNearby,
};
