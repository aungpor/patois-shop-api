"use strict";

const utils = require("../utils");
const config = require("../../config");
const sql = require("mssql");
const CRMutils = require("../CRMutils");
const errorLogData = require("../errorLog");
const axios = require('axios');
const campaignUtils = require("../../data/campaignUtils");

const createShop = async (shopData, userId) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("shop");
    const data = await pool
      .request()
      .input("location_id", sql.BigInt, shopData.shop.location_id)
      .input("shopName", sql.NVarChar(255), shopData.shop.shopName)
      .input("shopType_id", sql.BigInt, shopData.shop.shopType_id)
      .input("foodType_id", sql.BigInt, shopData.shop.foodType_id)
      .input("opening_time", sql.NVarChar(255), shopData.shop.opening_time)
      .input("recommend", sql.NVarChar(sql.MAX), shopData.shop.recommend)
      .input("images_id", sql.BigInt, shopData.shop.images_id)
      .input("remark", sql.NVarChar(sql.MAX), shopData.shop.remark)
      // .input("owner_id", sql.BigInt, userId)
      .input("user_id", sql.BigInt, userId)
      // .input("parkinglot_id", sql.BigInt, shopData.parkinglot_id)
      .input("shopsize_id", sql.BigInt, shopData.shop.shopsize_id)
      .input("shopweekday_id", sql.NVarChar(255), shopData.shop.shopweekday_id)
      .input("closing_time", sql.NVarChar(255), shopData.shop.closing_time)
      .input("view_count", sql.BigInt, 0)
      .input("price_range", sql.BigInt, shopData.shop.price_range)
      .input("tel", sql.NVarChar(255), shopData.shop.tel)
      .input("opendatetime_id", sql.BigInt, shopData.shop.opendatetime_id)
      .input("foodType_other", sql.NVarChar(255), shopData.shop.foodType_other)
      .input("history_id", sql.BigInt, shopData.shop.history_id)
      .input("active", sql.Bit, shopData.shop.store_type == 'merchant_shop' ? 1 : 0)
      .input("interface_from", sql.NVarChar(30), 'No Qualify' == shopData.shop.quality_status ? 'fraud' : 'patois')
      .input("shop_status_code", sql.VarChar(2), shopData.shop.store_type == 'merchant_shop' ? '2' : '1')
      .input("store_type", sql.NVarChar(50), shopData.shop.store_type ? shopData.shop.store_type : 'shop')
      .input("shop_branch_name", sql.NVarChar(255), shopData.shop.shop_branch_name)
      .input("shopNameEN", sql.NVarChar(255), shopData.shop.shopNameEN ? shopData.shop.shopNameEN : null)
      .input("ref_code", sql.NVarChar(20), shopData.shop.ref_code ? shopData.shop.ref_code : null)
      .query(sqlQueries.createShop);

    const listFollower = await pool
      .request()
      .input("userId", sql.BigInt, userId)
      .query(sqlQueries.getFollowersForReview);

    // const listFollowerData = listFollower.recordset && listFollower.recordset.length != 0 ? listFollower.recordset : null;

    // if (listFollowerData) {
    //   const sqlQueries2 = await utils.loadSqlQueryies("user");
    //   const myInfo = await pool
    //     .request()
    //     .input("userId", sql.BigInt, userId)
    //     .query(sqlQueries2.getUserByUserId);
    //   const myInfoData = myInfo.recordset[0];
    //   for (const follower of listFollowerData) {
    //     const sendnotiData = await pool
    //       .request()
    //       .input("user_id", sql.BigInt, userId)
    //       .input("withs", sql.BigInt, follower.follower_user_id)
    //       .input("vTitle", sql.NVarChar(100), myInfoData.name)
    //       .input("vDescription", sql.NVarChar(1000), "ได้สร้างร้าน " + shopData.shop.shopName + " เป็นร้านใหม่ในพาทัวร์")
    //       .input("vTypes", sql.NVarChar(50), "followingCreateReview")
    //       .input("ref_id", sql.BigInt, data.recordset[0].shopId)
    //       .query(sqlQueries.sendReviewNoti);
    //   }
    // }
    return data.recordset[0].shopId;
  } catch (error) {
    throw error;
  }
};

const updateEditShop = async (shopId, shopData, userId) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("shop");
    const update = await pool
      .request()
      .input("location_id", sql.BigInt, shopData.location_id)
      .input("shopName", sql.NVarChar(255), shopData.shopName)
      .input("shopNameEN", sql.NVarChar(255), shopData.shopNameEN)
      .input("shop_branch_name", sql.NVarChar(255), shopData.shop_branch_name)
      .input("shopType_id", sql.BigInt, shopData.shopType_id)
      .input("foodType_id", sql.BigInt, shopData.foodType_id)
      .input("opening_time", sql.NVarChar(255), shopData.opening_time)
      .input("recommend", sql.NVarChar(sql.MAX), shopData.recommend)
      .input("images_id", sql.BigInt, shopData.images_id)
      .input("remark", sql.NVarChar(sql.MAX), shopData.remark)
      .input("user_id_edit", sql.BigInt, userId)
      .input("shopweekday_id", sql.NVarChar(255), shopData.shopweekday_id)
      .input("closing_time", sql.NVarChar(255), shopData.closing_time)
      .input("view_count", sql.BigInt, 0)
      .input("price_range", sql.BigInt, shopData.price_range)
      .input("tel", sql.NVarChar(255), shopData.tel)
      .input("opendatetime_id", sql.BigInt, shopData.opendatetime_id)
      .input("foodType_other", sql.NVarChar(255), shopData.foodType_other)
      .input("shop_id", sql.BigInt, shopId)
      .query(sqlQueries.updateEditShop);
    return update.recordset;
  } catch (error) {
    throw error;
  }
};

const getById = async (shopId, userId) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("shop");
    const oneShop = await pool
      .request()
      .input("shop_id", sql.BigInt, shopId)
      .input("user_id", sql.BigInt, userId)
      .query(sqlQueries.shopById);
    return oneShop.recordset;
  } catch (error) {
    throw error;
  }
};

const getByMyUserProfile = async (shopId, userId) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("shop");
    const oneShop = await pool
      .request()
      .input("shop_id", sql.BigInt, shopId)
      .input("user_id", sql.BigInt, userId)
      .query(sqlQueries.shopByMyUserProfile);
    return oneShop.recordset;
  } catch (error) {
    throw error;
  }
};

const getShopOpenDateTime = async (openDateTimeId) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("shop");
    const data = await pool
      .request()
      .input("opendatetime_id", sql.BigInt, openDateTimeId)
      .query(sqlQueries.shopOpenDateTime);
    return data.recordset;
  } catch (error) {
    throw error;
  }
};

const getShopPostReviewAll = async (shopId, userId, pageNumber = 1, rowsOfPage = 5000) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("shop");
    const data = await pool
      .request()
      .input("shop_id", sql.BigInt, shopId)
      .input("user_id", sql.BigInt, userId)
      .input("pageNumber", sql.Int, pageNumber)
      .input("rowsOfPage", sql.Int, rowsOfPage)
      .query(sqlQueries.shopPostReviewAll);
    return data.recordset;
  } catch (error) {
    throw error;
  }
};

const getImageFromFirstReview = async (shopId) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("shop");
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
    const sqlQueries = await utils.loadSqlQueryies("shop");
    const data = await pool
      .request()
      .input("shop_id", sql.BigInt, shopId)
      .query(sqlQueries.getImageFromMaxLikeReview);
    return data.recordset && data.recordset.length != 0 ? data.recordset[0] : null;
  } catch (error) {
    throw error;
  }
};

const getShopPostReviewAllMyUserProfile = async (shopId, userId) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("shop");
    const data = await pool
      .request()
      .input("shop_id", sql.BigInt, shopId)
      .input("user_id", sql.BigInt, userId)
      .query(sqlQueries.shopPostReviewAllMyUserProfile);
    return data.recordset;
  } catch (error) {
    throw error;
  }
};

const getShopPostReviewLikes = async (post_review_id) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("shop");
    const data = await pool
      .request()
      .input("post_review_id", sql.BigInt, post_review_id)
      .query(sqlQueries.shopPostReviewLikes);
    return data.recordset;
  } catch (error) {
    throw error;
  }
};

const createShopReviewScore = async (shopCommentData, userId) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("shop");
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
      .query(sqlQueries.createShopReviewScore);
    return data.recordset[0].reviewScoreId;
  } catch (error) {
    throw error;
  }
};

const updateShopReviewScore = async (shopCommentData, reviewScoreId) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("shop");
    const data = await pool
      .request()
      .input("cleanliness", sql.BigInt, shopCommentData.shopReviewScore.cleanliness)
      .input("delicious", sql.BigInt, shopCommentData.shopReviewScore.delicious)
      .input("pricing", sql.BigInt, shopCommentData.shopReviewScore.pricing)
      .input("total", sql.Decimal(7, 1), shopCommentData.shopReviewScore.total)
      .input("service", sql.BigInt, shopCommentData.shopReviewScore.service)
      .input("atmosphere", sql.BigInt, shopCommentData.shopReviewScore.atmosphere)
      .input("review_score_id", sql.BigInt, reviewScoreId)
      .query(sqlQueries.updateShopReviewScore);
    return data.recordset[0]
  } catch (error) {
    throw error;
  }
};

const createOpenDateTime = async (userId) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("shop");
    const data = await pool
      .request()
      .input("created_by", sql.BigInt, userId)
      .input("updated_by", sql.BigInt, userId)
      .query(sqlQueries.createOpenDateTime);
    return data.recordset[0].openDateTimeId;
  } catch (error) {
    throw error;
  }
};
const createOpenDateTimes = async (openDateTimesData, userId, openDateTimeId) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("shop");
    const data = await pool
      .request()
      .input("opendatetime_id", sql.BigInt, openDateTimeId)
      .input("shopweekday_id", sql.BigInt, openDateTimesData.openDayId)
      .input("shopweekday_name", sql.NVarChar(70), openDateTimesData.openDay)
      .input("open_time", sql.NVarChar(20), openDateTimesData.openTime)
      .input("close_time", sql.NVarChar(20), openDateTimesData.closeTime)
      .input("created_by", sql.BigInt, userId)
      .input("updated_by", sql.BigInt, userId)
      .query(sqlQueries.createOpenDateTimes);
    return data.recordset[0].openDateTimesId;
  } catch (error) {
    throw error;
  }
};
const createPostReview = async (postReviewData, userId, ipAddress, device) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("shop");
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
      .query(sqlQueries.createPostReview);

    if (!postReviewData.postReview.isCreateShop) {
      const listFollower = await pool
        .request()
        .input("userId", sql.BigInt, userId)
        .query(sqlQueries.getFollowersForReview);

      const listFollowerData = listFollower.recordset && listFollower.recordset.length != 0 ? listFollower.recordset : null;

      if (listFollowerData) {
        const sqlQueries2 = await utils.loadSqlQueryies("user");
        const myInfo = await pool
          .request()
          .input("userId", sql.BigInt, userId)
          .query(sqlQueries2.getUserByUserId);
        const myInfoData = myInfo.recordset[0];

        const shopName = await pool
          .request()
          .input("shop_id", sql.BigInt, postReviewData.postReview.shop_id)
          .query(sqlQueries.getShopNameById);

        for (const follower of listFollowerData) {
          const sendnotiData = await pool
            .request()
            .input("user_id", sql.BigInt, userId)
            .input("withs", sql.BigInt, follower.follower_user_id)
            .input("vTitle", sql.NVarChar(100), myInfoData.name)
            .input("vDescription", sql.NVarChar(1000), "ได้รีวิวร้าน " + shopName.recordset[0].shopName)
            .input("vTypes", sql.NVarChar(50), "followingReview")
            .input("ref_id", sql.BigInt, postReviewData.postReview.shop_id)
            .query(sqlQueries.sendReviewNoti);
        }
      }
    }

    return data.recordset[0].postReviewId;
  } catch (error) {
    throw error;
  }
};

const createShopHistory = async (shopHistoryData, userId) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("shop");
    const data = await pool
      .request()
      .input("types", sql.NVarChar(255), shopHistoryData.history.types)
      .input("details", sql.NVarChar(500), shopHistoryData.history.details)
      .input("created_by", sql.BigInt, userId)
      .input("updated_by", sql.BigInt, userId)
      .input("from_to", sql.NVarChar(sql.MAX), shopHistoryData.history.from_to)
      .query(sqlQueries.createShopHistory);
    return data.recordset[0].shopHistoryId;
  } catch (error) {
    throw error;
  }
};
const createShopHistorys = async (shopHistorysData, userId) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("shop");
    const data = await pool
      .request()
      .input("types", sql.NVarChar(255), shopHistorysData.historys.types)
      .input("details", sql.NVarChar(500), shopHistorysData.historys.details)
      .input("history_id", sql.BigInt, shopHistorysData.historys.history_id)
      .input("created_by", sql.BigInt, userId)
      .input("updated_by", sql.BigInt, userId)
      .input("from_to", sql.NVarChar(sql.MAX), shopHistorysData.historys.from_to)
      .query(sqlQueries.createShopHistorys);
    return data.recordset[0].shopHistorysId;
  } catch (error) {
    throw error;
  }
};

const updateEatingType = async (data) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("shop");
    const update = await pool
      .request()
      .input("shopId", sql.BigInt, data.shopId)
      .input("shopEatingTypeId", sql.BigInt, data.shopEatingTypeId)
      .query(sqlQueries.updateEatingType);
    return true;
  } catch (error) {
    throw error;
  }
};

const updatePostReviewNoQuality = async (postReviewData, post_review_quality_id) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("shop");
    await pool
      .request()
      .input("post_review_quality_id", sql.BigInt, post_review_quality_id)
      .input("check_key", sql.NVarChar(255), postReviewData.check_key ? postReviewData.check_key : postReviewData.postReview.check_key)
      .query(sqlQueries.updatePostReviewNoQuality);
  } catch (error) {
    throw error;
  }
};

const countShopListMenu = async (shop_id, menu, type) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("shop");
    const data = await pool
      .request()
      .input("shop_id", sql.BigInt, shop_id)
      .input("menu", sql.NVarChar(50), menu)
      .input("type", sql.NVarChar(50), type)
      .query(sqlQueries.countShopListMenu);
    return data.recordset[0].count;
  } catch (error) {
    throw error;
  }
};

const addShopListMenu = async (shop_id, menu, review_id, type) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("shop");
    await pool
      .request()
      .input("shop_id", sql.BigInt, shop_id)
      .input("menu", sql.NVarChar(50), menu)
      .input("review_id", sql.BigInt, review_id)
      .input("type", sql.NVarChar(50), type)
      .query(sqlQueries.addShopListMenu);
  } catch (error) {
    throw error;
  }
};




const handleReviewSendMaxPoints = async (point_type, postReviewData, userId, shopType, mappingKey, req) => {
  try {

    utils.logDebug('handleReviewSendMaxPoints Run.... mappingKey:' + mappingKey + ' userId:' + userId);
    let matching = null;
    let dataObject = {
      point_type: point_type ? point_type : 'review_shop',
      shop_id: postReviewData.postReview.shop_id,
      user_id: userId,
      review_id: postReviewData.postReview.review_id
    }

    utils.logDebug('Send to /api/campaign/campaignPoint/point API data:' + JSON.stringify(dataObject) + ' mappingKey:' + mappingKey + ' userId:' + userId);
    let campaignPointRes = await axios({
      url: `${config.ADMIN_API}/api/campaign/campaignPoint/point`,
      method: 'POST',
      headers: {
        'token': req.headers.token,
        'Content-Type': 'application/json'
      },
      data: {
        point_type: point_type ? point_type : 'review_shop',
        shop_id: postReviewData.postReview.shop_id,
        user_id: userId,
        review_id: postReviewData.postReview.review_id
      }
    })
      .then(data => {
        return data.data.data
      })
      .catch(err => {
        throw err
      })

    utils.logDebug('Data campaignPoint/point retrun Data:' + JSON.stringify(campaignPointRes) + ' mappingKey:' + mappingKey + ' userId:' + userId);

    if (!campaignPointRes || campaignPointRes.length == 0) {
      return null;
    }


    let defaultMaxpoint = campaignPointRes[0].point;
    let promoCode = campaignPointRes[0].campaign_point_id;

    //let getEventId = await referralService.getpromosInfo(campaignPointRes?.data[0].campaign_point_id);
    let getEventId = await getpromosInfo(campaignPointRes[0].campaign_point_id);



    let eventsDataObject = {
      promoCode: promoCode,
      eventId: getEventId[0]?.event_id,
      reviewScore: postReviewData.postReview.checked_rating ? postReviewData.postReview.checked_rating : null,
      merchant_id: null,
      shop_id: postReviewData.postReview.shop_id,
      userId: null,
      approve_status: postReviewData.postReview.isCreateShop ? 'WAIT_FOR_APPROVE' : null
    }

    utils.logDebug('Send to /api/promotion/patois-event/matching/events API data:' + JSON.stringify(eventsDataObject) + ' mappingKey:' + mappingKey + ' userId:' + userId);
    let resp = await axios({
      url: `${config.EVENT_API}/api/promotion/patois-event/matching/events`,
      method: 'POST',
      headers: {
        'token': req.headers.token,
        'Content-Type': 'application/json'
      },
      data: {
        promoCode: promoCode,
        eventId: getEventId[0]?.event_id,
        reviewScore: postReviewData.postReview.checked_rating ? postReviewData.postReview.checked_rating : null,
        merchant_id: null,
        shop_id: postReviewData.postReview.shop_id,
        userId: null,
        approve_status: postReviewData.postReview.isCreateShop ? 'WAIT_FOR_APPROVE' : null
      }
    })
      .then(data => {
        return data.data.data
      })
      .catch(err => {
        throw err
      })


    utils.logDebug('Data patois-event/matching/events retrun Data:' + JSON.stringify(resp) + ' mappingKey:' + mappingKey + ' userId:' + userId);
    let promo = {};
    promo.promo = getEventId[0];

    let messageNotiCondition = ` MAX POINT จากการร่วมรีวิวในพาทัวร์ โดยคุณสามารถใช้คะแนนได้ในวันถัดไป 🙂`;
    /*if (postReviewData.postReview.review) {
        messageNotiCondition = ` Max point จากการร่วมรีวิวในพาทัวร์ โดยคุณสามารถได้รับคะแนนหลังจากได้รับการอนุมัติ 🙂`;
        await CRMutils.sendNotiPointLineOA(userId, mappingKey, req, getEventId, messageNotiCondition );
        utils.logDebug('sendNotiPointLineOA Complete'+' mappingKey:'+mappingKey);
    } else */
    matching = resp[0].RESULT;
    if (resp[0].RESULT == 'MATCHED') {
      if (postReviewData.postReview.isCreateShop) {
        messageNotiCondition = ` Max point จากการร่วมรีวิวในพาทัวร์ โดยคุณสามารถได้รับคะแนนหลังจากได้รับการอนุมัติ 🙂`;
        await CRMutils.sendNotiPointLineOA(userId, mappingKey, req, promo, messageNotiCondition);
        utils.logDebug('sendNotiPointLineOA Complete' + ' mappingKey:' + mappingKey);
      } else {
        messageNotiCondition = ` MAX POINT จากการร่วมรีวิวในพาทัวร์ โดยคุณสามารถใช้คะแนนได้ในวันถัดไป 🙂`;
        await CRMutils.sendMaxPoints(userId, mappingKey, req, promo, postReviewData.postReview.review_id, shopType === 'shop' ? 'reviewShop' : 'reviewMerchant', messageNotiCondition);
        utils.logDebug('sendMaxPoints Complete' + ' mappingKey:' + mappingKey + ' userId:' + userId);

      }
    }

    return matching;

  } catch (error) {
    const requestErrorLog = await errorLogData.createErrorLog({
      error_from: "Patois Api",
      error_name: "Catch error",
      error_func_name: "handleReviewSendMaxPoints",
      error_code: "",
      error_massage: error.message
    }, userId ? userId : '');
    //return error.message;
    throw error;
  }
};


const getpromosInfo = async (promosCode) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("shop");
    const user = await pool
      .request()
      .input("promosCode", sql.NVarChar, promosCode)
      .query(sqlQueries.promosInfo);
    return user.recordset;
  } catch (error) {
    //return error.message;
    throw error;
  }
};

const getShopsListSuggest = async (lat, lng, filter, text, pageNumber, rowsOfPage, userId) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("shop");
    const list = await pool
      .request()
      .input("lat", sql.Decimal(10, 8), lat)
      .input("lng", sql.Decimal(11, 8), lng)
      //.input("filter", sql.NVarChar(20), filter)
      .input("text", sql.NVarChar(255), text)
      .input("pageNumber", sql.Int, pageNumber)
      .input("rowsOfPage", sql.Int, rowsOfPage)
      .input("user_id", sql.BigInt, userId)
      .execute("p_Patois_Shop_Search_List_Suggest")
    return list.recordset;
  } catch (error) {
    throw error;
  }
};

const updateEditOpenDateTime = async (oldOpenDateTimes) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("shop");
    const update = await pool
      .request()
      .input("updated_by", sql.BigInt, oldOpenDateTimes.updatedBy)
      .input("shop_id", sql.BigInt, oldOpenDateTimes.shopId)
      .input("opendatetime_id", sql.BigInt, oldOpenDateTimes.openDateTimeId)
      .query(sqlQueries.updateEditOpenDateTime);
    return update.recordset;
  } catch (error) {
    throw error;
  }
};

const updateShopIdByOpenDateTimeId = async (openDateTimeId, shopId) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("shop");
    const update = await pool
      .request()
      .input("shop_id", sql.BigInt, shopId)
      .input("opendatetime_id", sql.BigInt, openDateTimeId)
      .query(sqlQueries.updateShopByOpenDateTimeId);
    return update.recordset[0].opendatetime_id;
  } catch (error) {
    throw error;
  }
};

const updateShopHistory = async (shopHistoryId, shopHistoryData, userId) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("shop");
    const update = await pool
      .request()
      .input("types", sql.NVarChar(255), shopHistoryData.history.types)
      .input("details", sql.NVarChar(500), shopHistoryData.history.details)
      .input("updated_by", sql.BigInt, userId)
      .input("from_to", sql.NVarChar(sql.MAX), shopHistoryData.history.from_to)
      .input("id", sql.BigInt, shopHistoryId)
      .query(sqlQueries.updateShopHistory);
    return update.recordset;
  } catch (error) {
    throw error;
  }
};

const updateShopHistoryId = async (shopId, shopHistoryData) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("shop");
    const update = await pool
      .request()
      .input("history_id", sql.BigInt, shopHistoryData.history.history_id)
      .input("shop_id", sql.BigInt, shopId)
      .query(sqlQueries.updateShopHistoryId);
    return update.recordset;
  } catch (error) {
    throw error;
  }
};


const getByIdAndAllActive = async (shopId, userId) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("shop");
    const oneShop = await pool
      .request()
      .input("shop_id", sql.BigInt, shopId)
      .input("user_id", sql.BigInt, userId)
      .query(sqlQueries.shopByIdAndAllActive);
    return oneShop.recordset;
  } catch (error) {
    //return error.message;
    throw error;
  }
};

const getShopMyReviewAuth = async (shopId, userId, pageNumber, rowsOfPage) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("shop");
    const data = await pool
      .request()
      .input("shop_id", sql.BigInt, shopId)
      .input("user_id", sql.BigInt, userId)
      .input("pageNumber", sql.Int, pageNumber)
      .input("rowsOfPage", sql.Int, rowsOfPage)
      .query(sqlQueries.getShopMyReviewAuth);
    return data.recordset;
  } catch (error) {
    throw error;
  }
};



const handleShopInCampaign = async (postReviewData, usered, mappingKey, req) => {
   try {
 
     utils.logDebug('handleShopInCampaign Run.... mappingKey:' + mappingKey + ' userId:' + usered.userId);
     let respoiseCampaign = null;
     let pool = await sql.connect(config.sql);
     const sqlQueries = await utils.loadSqlQueryies("shop");
     const shopInfo = await pool
     .request()
     .input("shop_id", sql.BigInt, postReviewData.postReview.shop_id)
     .query(sqlQueries.getShopInCampaignInfoById);
     let shopInfoData = shopInfo.recordset && shopInfo.recordset.length != 0 ? shopInfo.recordset[0] : null;

     if(shopInfoData && shopInfoData.in_campaign_type){
         if(shopInfoData.in_campaign_type=='REIVEW'){

            // Set Campaign 
            let campaign_data={};
            campaign_data.page_type = "review";
            campaign_data.ref_type = "review";
            campaign_data.ref_code = utils.AES_encrypt(shopInfoData.ref_code);
            campaign_data.campaign_code = utils.AES_encrypt(shopInfoData.campaign_code);
            campaign_data.campaign_code_text = shopInfoData.campaign_code;
            campaign_data.for_new_user_only = null;
            
            utils.logDebug('Process Shop In Campaign send Campaign campaign_data:'+JSON.stringify(campaign_data)+ ' mappingKey:'+mappingKey);
            respoiseCampaign = await campaignUtils.handleCampaignSendPromo(campaign_data, usered, mappingKey, req);
            utils.logDebug('Process Shop In Campaign send Campaign Response respoiseCampaign:'+JSON.stringify(respoiseCampaign) + ' mappingKey:'+mappingKey);
         

         }

     }
 
     return respoiseCampaign;
 
   } catch (error) {
     const requestErrorLog = await errorLogData.createErrorLog({
       error_from: "Patois Api",
       error_name: "Catch error",
       error_func_name: "handleShopInCampaign",
       error_code: "",
       error_massage: error.message
     }, usered.userId ? usered.userId : '');
     //return error.message;
     throw error;
   }
 };
 
 


module.exports = {
  createShop,
  getByMyUserProfile,
  getById,
  getImageFromFirstReview,
  getImageFromMaxLikeReview,
  getShopPostReviewAllMyUserProfile,
  getShopPostReviewAll,
  getShopPostReviewLikes,
  getShopOpenDateTime,
  createOpenDateTime,
  createOpenDateTimes,
  createShopHistory,
  createShopHistorys,
  updateEatingType,
  createPostReview,
  updatePostReviewNoQuality,
  countShopListMenu,
  addShopListMenu,
  createShopReviewScore,
  handleReviewSendMaxPoints,
  getpromosInfo,
  getShopsListSuggest,
  updateEditOpenDateTime,
  updateShopIdByOpenDateTimeId,
  updateShopHistory,
  updateShopHistoryId,
  updateEditShop,
  updateShopReviewScore,
  getByIdAndAllActive,
  getShopMyReviewAuth,
  handleShopInCampaign
};
