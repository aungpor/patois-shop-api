"use strict";

const utils = require("../utils");
const config = require("../../config");
const sql = require("mssql");

const getMerchantShopById = async (shopId, userId) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("merchant");
    const oneShop = await pool
      .request()
      .input("shop_id", sql.BigInt, shopId)
      .input("user_id", sql.BigInt, userId)
      .query(sqlQueries.merchantShopById);
    return oneShop.recordset;
  } catch (error) {
    throw error;
  }
};

const getImageFromFirstReview = async (shopId) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("merchant");
    const data = await pool
      .request()
      .input("shop_id", sql.BigInt, shopId)
      .query(sqlQueries.getImageFromFirstReview);
    return data.recordset && data.recordset.length != 0 ? data.recordset[0] : null;
  } catch (error) {
    throw error;
  }
};

const getImageFromMaxLikeReview = async (shopId) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("merchant");
    const data = await pool
      .request()
      .input("shop_id", sql.BigInt, shopId)
      .query(sqlQueries.getImageFromMaxLikeReview);
    return data.recordset && data.recordset.length != 0 ? data.recordset[0] : null;
  } catch (error) {
    throw error;
  }
};

const getMerchantShopPostReviewAll = async (shopId, userId) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("merchant");
    const data = await pool
      .request()
      .input("shop_id", sql.BigInt, shopId)
      .input("user_id", sql.BigInt, userId)
      .query(sqlQueries.merchantShopPostReviewAll);
    return data.recordset;
  } catch (error) {
    throw error;
  }
};

const getMerchantShopByIdMyUserProfile = async (shopId, userId) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("merchant");
    const oneShop = await pool
      .request()
      .input("shop_id", sql.BigInt, shopId)
      .input("user_id", sql.BigInt, userId)
      .query(sqlQueries.merchantShopByMyUserProfile);
    return oneShop.recordset;
  } catch (error) {
    throw error;
  }
};

const getMerchantShopPostReviewAllMyUserProfile = async (shopId, userId) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("merchant");
    const data = await pool
      .request()
      .input("shop_id", sql.BigInt, shopId)
      .input("user_id", sql.BigInt, userId)
      .query(sqlQueries.merchantShopPostReviewAllMyUserProfile);
    return data.recordset;
  } catch (error) {
    throw error;
  }
};

const getMerchantShopPostReviewLikes = async (post_review_id) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("merchant");
    const data = await pool
      .request()
      .input("post_review_id", sql.BigInt, post_review_id)
      .query(sqlQueries.merchantShopPostReviewLikes);
    return data.recordset;
  } catch (error) {
    throw error;
  }
};

const addMerchantPostReview = async (postReviewData, userId, ipAddress, device) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("merchant");
    const data = await pool
      .request()
      .input("user_id", sql.BigInt, userId)
      .input("shop_id", sql.BigInt, postReviewData.postReview.shop_id)
      .input("review", sql.NVarChar(sql.MAX), postReviewData.postReview.review)
      .input("images_id", sql.BigInt, postReviewData.postReview.images_id)
      .input("quality", sql.VarChar(100), postReviewData.postReview.quality_status)
      .input("active", sql.Bit, 'No Qualify' == postReviewData.postReview.quality_status ? 0 : 1)
      .input("ipAddress", sql.NVarChar(50), ipAddress)
      .input("device", sql.NVarChar(255), device)
      .query(sqlQueries.createMerchantPostReview);

    const sqlQueries1 = await utils.loadSqlQueryies("shop");
    const listFollower = await pool
      .request()
      .input("userId", sql.BigInt, userId)
      .query(sqlQueries1.getFollowersForReview);

    const listFollowerData = listFollower.recordset && listFollower.recordset.length != 0 ? listFollower.recordset : null;

    if (listFollowerData) {
      const sqlQueries2 = await utils.loadSqlQueryies("user");
      const myInfo = await pool
        .request()
        .input("userId", sql.BigInt, userId)
        .query(sqlQueries2.getUserByUserId);
      const myInfoData = myInfo.recordset[0];

      const sqlQueries3 = await utils.loadSqlQueryies("merchant");
      const shopName = await pool
        .request()
        .input("shop_id", sql.BigInt, postReviewData.postReview.shop_id)
        .query(sqlQueries3.getMerchantShopNameById);

      for (const follower of listFollowerData) {
        const sendnotiData = await pool
          .request()
          .input("user_id", sql.BigInt, userId)
          .input("withs", sql.BigInt, follower.follower_user_id)
          .input("vTitle", sql.NVarChar(100), myInfoData.name)
          .input("vDescription", sql.NVarChar(1000), "ได้รีวิวร้าน " + shopName.recordset[0].shop_name)
          .input("vTypes", sql.NVarChar(50), "followingReviewMerchant")
          .input("ref_id", sql.BigInt, postReviewData.postReview.shop_id)
          .query(sqlQueries1.sendReviewNoti);
      }
    }

    return data.recordset[0].postReviewId;
  } catch (error) {
    throw error;
  }
};

const createMerchantShopReviewScore = async (shopCommentData, userId) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("merchant");
    const data = await pool
      .request()
      .input("user_id", sql.BigInt, userId)
      .input("shop_id", sql.BigInt, shopCommentData.shopReviewScore.shop_id)
      .input("cleanliness", sql.BigInt, shopCommentData.shopReviewScore.cleanliness)
      .input("delicious", sql.BigInt, shopCommentData.shopReviewScore.delicious)
      .input("pricing", sql.BigInt, shopCommentData.shopReviewScore.pricing)
      .input("total", sql.Decimal(7, 1), shopCommentData.shopReviewScore.total)
      .input("post_review_id", sql.BigInt, shopCommentData.shopReviewScore.post_review_id)
      .input("service", sql.BigInt, shopCommentData.shopReviewScore.service)
      .input("atmosphere", sql.BigInt, shopCommentData.shopReviewScore.atmosphere)
      .query(sqlQueries.createMerchantShopReviewScore);
    return data.recordset[0].reviewScoreId;
  } catch (error) {
    throw error;
  }
};

const createMerchant = async (merchantData, userId) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("merchant");
    const result = await pool
      .request()
      //.input("merchant_shop_name", sql.NVarChar(255), merchantData.merchant_shop_name)
      //.input("merchant_shop_type_id", sql.Int, merchantData.merchant_shop_type_id)
      .input("merchant_personal_id", sql.NVarChar(13), merchantData.merchant_personal_id)
      .input("merchant_tel", sql.VarChar(255), merchantData.merchant_tel)
      .input("merchant_email", sql.VarChar(100), merchantData.merchant_email)
      // .input("merchant_location_id", sql.Int, merchantData.merchant_location_id)
      // .input("merchant_image_id", sql.Int, merchantData.merchant_image_id)
      .input("merchant_status_id", sql.Int, 1)
      .input("create_by", sql.VarChar(255), userId)
      .input("update_by", sql.VarChar(255), userId)
      .input("ref_id", sql.BigInt, userId)
      // .input("merchant_food_type_id", sql.BigInt, merchantData.merchant_food_type_id)
      .input("user_id", sql.BigInt, userId)
      // .input("price_range", sql.BigInt, merchantData.price_range)
      // .input("opendatetime_id", sql.BigInt, merchantData.opendatetime_id)
      // .input("foodType_other", sql.VarChar(255), merchantData.foodType_other)
      //.input("ref_code", sql.NVarChar(20), merchantData.ref_code)
      .input("active", sql.Bit, 1)
      .input("first_name", sql.NVarChar(100), merchantData.first_name)
      .input("last_name", sql.NVarChar(100), merchantData.last_name)
      .input("merchant_tel_secondary", sql.VarChar(255), merchantData.merchant_tel_secondary)
      .input("merchant_profile_line_id", sql.NVarChar(50), merchantData.merchant_profile_line_id)
      .query(sqlQueries.createMerchant);

    // update user group เป็น 4
    await pool
      .request()
      .input("groups_id", sql.Int, 4)
      .input("userId", sql.BigInt, userId)
      .query(sqlQueries.updateGroupIdUserByUserId);

    return result.recordset[0].merchantId;
  } catch (error) {
    throw error;
  }
};

const checkUserIdAndPersonelDupilcate = async (merchant_personal_id, userId) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("merchant");
    const result = await pool
      .request()
      .input("merchant_personal_id", sql.NVarChar(13), merchant_personal_id)
      .query(sqlQueries.getMerchantByMerchantPersonalId);
    if (result.recordset.length != 0) {
      for (const key in result.recordset) {
        if (result.recordset[key].user_id == userId) {
          return false
        }
      }
      return true
    }
    else {
      return false
    }
  } catch (error) {
    throw error;
  }
};

const getListMerchantShopByUserId = async (pageNumber, rowsOfPage, userId) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("merchant");
    const data = await pool
      .request()
      .input("user_id", sql.BigInt, userId)
      .input("pageNumber", sql.Int, pageNumber)
      .input("rowsOfPage", sql.Int, rowsOfPage)
      .query(sqlQueries.getListMerchantShopByUserId);
    return { total: data.recordsets[0][0].count, list: data.recordsets[1] }
  } catch (error) {
    throw error;
  }
};

const getCountReviewMerchantShop = async (shopId) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("merchant");
    const count = await pool
      .request()
      .input("shop_id", sql.BigInt, shopId)
      .query(sqlQueries.getCountReviewMerchantShopAllAndToday);
    return { countAll: count.recordset[0].countAll, countToday: count.recordset[0].countToday }
  } catch (error) {
    throw error;
  }
};

const viewMerchant = async (shopId, userId) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("merchant");
    const data = await pool
      .request()
      .input("shop_id", sql.BigInt, shopId)
      .input("user_id", sql.BigInt, userId)
      .query(sqlQueries.viewMerchant);
    return { shopData: { ...data.recordsets[0][0], location: data.recordsets[3][0] }, shopType: data.recordsets[1][0], shopImages: data.recordsets[2][0] }
  } catch (error) {
    throw error;
  }
};

const countReviewRetrospect = async (shopId, day) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("merchant");
    const data = await pool
      .request()
      .input("shop_id", sql.BigInt, shopId)
      .input("day", sql.Int, day)
      .query(sqlQueries.countReviewRetrospect);
    console.log(data)
    return { total: data.recordsets[0][0].total, list: data.recordsets[1] }
  } catch (error) {
    throw error;
  }
};

const scoreAverageShop = async (shopId) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("merchant");
    const data = await pool
      .request()
      .input("shop_id", sql.BigInt, shopId)
      .query(sqlQueries.scoreAverageShop);
    return { countReviewAll: data.recordsets[0][0].countReviewAll, scoreTotal: data.recordsets[0][0].scoreTotal, list: data.recordsets[1] }
  } catch (error) {
    throw error;
  }
};

const scoreAverageGroup = async (shopId) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("merchant");
    const data = await pool
      .request()
      .input("shop_id", sql.BigInt, shopId)
      .query(sqlQueries.scoreAverageGroup);
    return data.recordset[0]
  } catch (error) {
    throw error;
  }
};

const getMerchantShopReviewFilter = async (shopId, score, sort, pageNumber, rowsOfPage) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("merchant");
    const data = await pool
      .request()
      .input("shop_id", sql.BigInt, shopId)
      .input("score", sql.NVarChar(10), score)
      .input("sort", sql.NVarChar(10), sort)
      .input("pageNumber", sql.Int, pageNumber)
      .input("rowsOfPage", sql.Int, rowsOfPage)
      .query(sqlQueries.getMerchantShopReviewFilter);
    return data.recordset
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createMerchant,
  getMerchantShopById,
  getImageFromFirstReview,
  getImageFromMaxLikeReview,
  getMerchantShopPostReviewAll,
  getMerchantShopByIdMyUserProfile,
  getMerchantShopPostReviewAllMyUserProfile,
  getMerchantShopPostReviewLikes,
  addMerchantPostReview,
  createMerchantShopReviewScore,
  checkUserIdAndPersonelDupilcate,
  getListMerchantShopByUserId,
  getCountReviewMerchantShop,
  viewMerchant,
  countReviewRetrospect,
  scoreAverageShop,
  scoreAverageGroup,
  getMerchantShopReviewFilter
}