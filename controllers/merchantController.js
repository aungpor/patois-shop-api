"use strict";

const merchantData = require("../data/merchant");
const utils = require("../data/utils");
const missionUtils = require("../data/missionUtils");
const configData = require("../data/config");
const axios = require('axios');
const shopData = require("../data/shop");
const config = require("../config");

const getMerchantShop = async (req, res, next) => {
  const mappingKey = utils.mappingRequestResponse();
  try {
    utils.logger.info(await utils.requestMsg(req, mappingKey));
    const shopId = req.params.id;
    const oneShop = await merchantData.getMerchantShopById(shopId, "");
    let shopsData = [];
    await Promise.all(
      oneShop.map(async (shop) => {
        //Set imageId on Shop is not have imageId
        if (!shop.images_id) {
          const firstReview = await merchantData.getImageFromFirstReview(shopId);
          if (firstReview) {
            shop.images_id = firstReview.images_id;
            shop.image_list = firstReview.image_list;
            shop.image_list_thumbnail = firstReview.image_list_thumbnail;
            shop.image_url = firstReview.image_url;
            shop.image_url_thumbnail = firstReview.image_url_thumbnail;
          }
        }
        //Set imageId on Shop is not have imageId

        // set imageId from review is max like
        const maxLikeReview = await merchantData.getImageFromMaxLikeReview(shopId);
        if (maxLikeReview) {
          shop.image_list += (',' + maxLikeReview.image_list);
          shop.image_list_thumbnail += (',' + maxLikeReview.image_list_thumbnail);
          shop.image_url += (',' + maxLikeReview.image_url);
          shop.image_url_thumbnail += (',' + maxLikeReview.image_url_thumbnail);
        }
        // set imageId from review is max like

        const reviews = await merchantData.getMerchantShopPostReviewAll(shopId, "");
        if (reviews) {
          shop = { ...shop, reviews: reviews };
        }
        else {
          shop;
        }
        shopsData.push(shop);
      })
    )
    utils.logger.info(utils.responseMsg(res, shopsData, req, mappingKey));
    res.send({ ResponseCode: 200, ResponseMsg: "success", data: shopsData });

  } catch (error) {
    let e_ = utils.errorMsg(error, mappingKey);
    utils.logger.error(utils.responseMsg(res, e_, req, mappingKey));
    res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
  }
};

const getMerchantShopAuth = async (req, res, next) => {
  const mappingKey = utils.mappingRequestResponse();
  try {
    utils.logger.info(await utils.requestMsg(req, mappingKey));
    const usered = await utils.getUser(req.headers.token);
    if (usered.error === "Token is expired!") {
      utils.logger.info(utils.responseMsg(res, usered.error, req, mappingKey));
      res.status(401).send({ ResponseCode: 401, ResponseMsg: usered.error, data: null });
    } else {
      const shopId = req.params.id;
      let oneShop = await merchantData.getMerchantShopById(shopId, usered.userId);
      if (!oneShop.length) {
        res.send({ ResponseCode: 200, ResponseMsg: "success", data: [] });
      }

      let shopsData = [];
      await Promise.all(
        oneShop.map(async (shop) => {
          //Set imageId on Shop is not have imageId
          if (!shop.images_id) {
            const firstReview = await merchantData.getImageFromFirstReview(shopId);
            if (firstReview) {
              shop.images_id = firstReview.images_id;
              shop.image_list = firstReview.image_list;
              shop.image_list_thumbnail = firstReview.image_list_thumbnail;
              shop.image_url = firstReview.image_url;
              shop.image_url_thumbnail = firstReview.image_url_thumbnail;
            }
          }
          //Set imageId on Shop is not have imageId

          // set imageId from review is max like
          const maxLikeReview = await merchantData.getImageFromMaxLikeReview(shopId);
          if (maxLikeReview) {
            shop.image_list += (',' + maxLikeReview.image_list);
            shop.image_list_thumbnail += (',' + maxLikeReview.image_list_thumbnail);
            shop.image_url += (',' + maxLikeReview.image_url);
            shop.image_url_thumbnail += (',' + maxLikeReview.image_url_thumbnail);
          }
          // set imageId from review is max like
          let reviews = await merchantData.getMerchantShopPostReviewAll(shopId, usered.userId);

          let reviewsData = [];
          if (reviews) {
            await Promise.all(
              reviews.map(async (r) => {
                let reviewsLike = await merchantData.getMerchantShopPostReviewLikes(r.post_review_id);
                if (reviewsLike) {
                  r = { ...r, reviewsLike: reviewsLike };
                  reviewsData.push(r);
                }
              })
            )
            // Sort by index
            if (reviews) {
              let reviewsDataTmp = [];
              for (let i = 0; i < reviews.length; i++) {
                for (let j = 0; j < reviewsData.length; j++) {
                  if (reviews[i].post_review_id == reviewsData[j].post_review_id) {
                    reviewsDataTmp.push(reviewsData[j]);
                    break;
                  }

                }
              }
              reviewsData = reviewsDataTmp;
            }
            //
            shop = { ...shop, reviews: reviewsData };
          }
          else {
            shop;
          }
          let openDateTimes = await shopData.getShopOpenDateTime(shop.opendatetime_id);
          shop = { ...shop, openDateTimes: openDateTimes };
          shopsData.push(shop);
        })
      )
      utils.logger.info(utils.responseMsg(res, shopsData, req, mappingKey));
      res.send({ ResponseCode: 200, ResponseMsg: "success", data: shopsData });

    }
  } catch (error) {
    let e_ = utils.errorMsg(error, mappingKey);
    utils.logger.error(utils.responseMsg(res, e_, req, mappingKey));
    res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
  }
};

const addMerchantPostReview = async (req, res, next) => {
  const mappingKey = utils.mappingRequestResponse();
  try {
    utils.logger.info(await utils.requestMsg(req, mappingKey));
    let usered = await utils.getUser(req.headers.token);
    if (usered.error === "Token is expired!") {
      utils.logger.info(utils.responseMsg(res, usered.error, req, mappingKey));
      res.status(401).send({ ResponseCode: 401, ResponseMsg: usered.error, data: null });
    } else {
      const data = req.body;

      // ตอน create review เพิ่มการเก็บ ipAddress และ device
      const ipAddress = req.headers['x-forwarded-for'].split(",").length > 1 ? req.headers['x-forwarded-for'].split(",")[0] : req.headers['x-forwarded-for'];
      const device = req.headers['user-agent']
      const result = await merchantData.addMerchantPostReview(data, usered.userId, ipAddress, device);

      let mission_code = null;
      let handleMissoin = null;

      if (data.postReview.quality_status == 'Qualify' || data.postReview.quality_status == 'Good Quality') {

        // รีวิวครั้งแรกรับ 100 Point
        mission_code = 'M0000010';
        handleMissoin = await missionUtils.handleMissoinByMissionCode(mission_code, usered, mappingKey, req);


        // รีวิวครั้งที่ 2 รับ 100 Point
        mission_code = 'M0000011';
        handleMissoin = await missionUtils.handleMissoinByMissionCode(mission_code, usered, mappingKey, req);

        // รีวิวภายใน 14 วัน รับคูปอง Punthai Buy 1 Get 1 free
        mission_code = 'M0000014';
        handleMissoin = await missionUtils.handleMissoinByMissionCode(mission_code, usered, mappingKey, req, 'S003');


        //อัพรูปอย่างเดียวไม่ได้ ต้องรีวิวอย่างน้อย 60 ตัวอักษรด้วย 
        if (data.postReviewData.postReview.review && data.postReviewData.postReview.review.length >= 60) {
          // Autobacs รีวิว 1 ร้านค้า 
          mission_code = 'M0000024';
          handleMissoin = await missionUtils.handleMissoinByMissionCode(mission_code, usered, mappingKey, req);
        }


        // Autobacs รีวิวครั้งแรกรับ 100 Point
        mission_code = 'M0000022';
        handleMissoin = await missionUtils.handleMissoinByMissionCode(mission_code, usered, mappingKey, req);

        // Autobacs รีวิวครั้งที่ 2 รับ 100 Point
        mission_code = 'M0000023';
        handleMissoin = await missionUtils.handleMissoinByMissionCode(mission_code, usered, mappingKey, req);




        // รีวิวครั้งแรกรับ 100 Point สำหรับ Mission Invite Code PUN001
        //mission_code = 'M0000017';
        //handleMissoin = await missionUtils.handleMissoinByMissionCode(mission_code, usered, mappingKey, req);


        // รีวิวครั้งที่ 2 รับ 100 Point สำหรับ Mission Invite Code PUN001
        //mission_code = 'M0000018';
        //handleMissoin = await missionUtils.handleMissoinByMissionCode(mission_code, usered, mappingKey, req);


        /* Mission */
        // รีวิวร้านอาหารครบ 5 ร้าน
        /*let mission_code = 'M0000006';
        let handleMissoin = await missionUtils.handleMissoinByMissionCode(mission_code, usered, mappingKey, req);*/

        // รีวิวร้านอาหารครบ 10 ร้าน
        /*mission_code = 'M0000007';
        handleMissoin = await missionUtils.handleMissoinByMissionCode(mission_code, usered, mappingKey, req);*/
        /* Mission */
      }

      
   /* เวลารีวิวร้านค้า Merchant จะวิ่งไปที่เส้น /shop/post/review แทน
      let handleampaign = null;
      try {
         utils.logDebug('handleampaign Start..' + ' mappingKey:' + mappingKey);
         handleampaign = await shopData.handleShopInCampaign(data.postReviewData, usered, mappingKey, req);
      } catch (error) {
         console.log(error)
      }
      utils.logDebug('handleampaign Complete handleampaign:'+JSON.stringify(handleampaign) + ' mappingKey:' + mappingKey);
      */

      /* Handle Send MaxPoints */
      let postReviewData = data;
      postReviewData.postReview.review_id = result;
      let point_type = null;
      if (postReviewData.postReview.isCreateShop) {
        point_type = postReviewData.postReview.review ? 'create_shop' : 'create_shop_no_review';
      } else {
        point_type = postReviewData.postReview.review ? 'review_shop' : 'review_shop_no_review';
      }
      let handlePointResult = await shopData.handleReviewSendMaxPoints(point_type, postReviewData, usered.userId, 'shop', mappingKey, req);
      utils.logDebug('handleReviewSendMaxPoints Complete' + ' mappingKey:' + mappingKey);



      // update review no quality ว่าเป็น review ของ quality ไหน
      await shopData.updatePostReviewNoQuality(data, result);

      // insert shop list menu
      axios({
        url: 'https://prd-qualityservice-api.azurewebsites.net/list_menu',
        method: 'POST',
        data: {
          text: data.postReview.review
        }
      })
        .then(async dataList => {
          const list_menu = dataList.data.list_menu;
          for (const menu of list_menu) {
            const count = await shopData.countShopListMenu(data.postReview.shop_id, menu, "merchant");
            if (count == 0) {
              await shopData.addShopListMenu(data.postReview.shop_id, menu, result, "merchant");
            }
          }
        })
        .catch(async err => {
          let e_ = utils.errorMsg(err, mappingKey);
          utils.logger.error(utils.responseMsg(res, e_, req, mappingKey));
        })

      if ('No Qualify' == data.postReview.quality_status) {
        let message_type = 'review', message_code = 'R002'
        const configMessage = await configData.getConfigMessage(message_type, message_code);
        // New Flow Noti By Admin System
        //const notificationsId = await shopData.createNotiPostReview(configMessage, usered.userId, result, 'report_review_merchant');
        const logResult = { ResponseMsg: configMessage, data: { postReviewId: result, matching: handlePointResult } }
        utils.logger.info(utils.responseMsg(res, logResult, req, mappingKey));
        res.send({ ResponseCode: 200, ResponseMsg: configMessage, data: { postReviewId: result, matching: handlePointResult } });
      } else {
        const logResult = { ResponseMsg: "success", data: { postReviewId: result, matching: handlePointResult } }
        utils.logger.info(utils.responseMsg(res, logResult, req, mappingKey));
        res.send({ ResponseCode: 200, ResponseMsg: "success", data: { postReviewId: result, matching: handlePointResult } });
      }

    }
  } catch (error) {
    let e_ = utils.errorMsg(error, mappingKey);
    utils.logger.error(utils.responseMsg(res, e_, req, mappingKey));
    res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });

  }
};

const addMerchantShopReviewScore = async (req, res, next) => {
  const mappingKey = utils.mappingRequestResponse();
  try {
    utils.logger.info(await utils.requestMsg(req, mappingKey));
    let usered = await utils.getUser(req.headers.token);
    if (usered.error === "Token is expired!") {
      utils.logger.info(utils.responseMsg(res, usered.error, req, mappingKey));
      res.status(401).send({ ResponseCode: 401, ResponseMsg: usered.error, data: null });
    } else {
      const data = req.body;
      const result = await merchantData.createMerchantShopReviewScore(data, usered.userId);
      utils.logger.info(utils.responseMsg(res, result, req, mappingKey));
      res.send({ ResponseCode: 200, ResponseMsg: "success", data: { reviewScoreId: result } });

    }
  } catch (error) {
    let e_ = utils.errorMsg(error, mappingKey);
    utils.logger.error(utils.responseMsg(res, e_, req, mappingKey));
    res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });

  }
};

const addMerchant = async (req, res, next) => {
  const mappingKey = utils.mappingRequestResponse();
  try {
    utils.logger.info(await utils.requestMsg(req, mappingKey));
    let usered = await utils.getUser(req.headers.token);
    if (usered.error === "Token is expired!") {
      utils.logger.info(utils.responseMsg(res, usered.error, req, mappingKey));
      res.status(401).send({ ResponseCode: 401, ResponseMsg: usered.error, data: null });
    } else {
      const data = req.body;
      const result = await merchantData.createMerchant(data, usered.userId);
      let status
      if (result) {
        await axios({
          url: `${config.SMS_API}/api/sms/send/message`,
          method: 'POST',
          headers: {
            'token': req.headers.token,
            'Content-Type': 'application/json'
          },
          data: {
            phoneNumber: data.merchant_tel,
            config_name: "message_text_create_merchant",
            referenceId: result,
            referenceType: "PATOIS-CREATE-MERCHANT"
          }
        }).then(async resData => {
          if (resData.data.ResponseCode != 200) {

          }
          else {
            status = resData.data.data.details[0].status
          }
        }).catch(err => {
          throw err
        })
      }
      utils.logger.info(utils.responseMsg(res, { ResponseCode: 200, ResponseMsg: "success", data: { shopId: result }, smsResponse: status }, req, mappingKey));
      res.send({ ResponseCode: 200, ResponseMsg: "success", data: { shopId: result }, smsResponse: status });
    }
  } catch (error) {
    let e_ = utils.errorMsg(error, mappingKey);
    utils.logger.error(utils.responseMsg(res, e_, req, mappingKey));
    res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
  }
};

const checkUserIdAndPersonelDupilcate = async (req, res, next) => {
  const mappingKey = utils.mappingRequestResponse();
  try {
    utils.logger.info(await utils.requestMsg(req, mappingKey));
    let usered = await utils.getUser(req.headers.token);
    if (usered.error === "Token is expired!") {
      utils.logger.info(utils.responseMsg(res, usered.error, req, mappingKey));
      res.status(401).send({ ResponseCode: 401, ResponseMsg: usered.error, data: null });
    } else {
      const data = req.body;
      if (!utils.validNationalID(data.merchant_personal_id)) {
        utils.logger.info(utils.responseMsg(res, { ResponseCode: 400, ResponseMsg: "Invalid ID Format" }, req, mappingKey));
        res.send({ ResponseCode: 400, ResponseMsg: "Invalid ID Format" });
      }
      else {
        const isDup = await merchantData.checkUserIdAndPersonelDupilcate(data.merchant_personal_id, usered.userId);
        if (isDup) {
          utils.logger.info(utils.responseMsg(res, { ResponseCode: 200, ResponseMsg: "success", data: { isDup: isDup, message: "เลขบัตรประชาชนนี้ถูกใช้งานไปแล้ว" } }, req, mappingKey));
          res.send({ ResponseCode: 200, ResponseMsg: "success", data: { isDup: isDup, message: "เลขบัตรประชาชนนี้ถูกใช้งานไปแล้ว" } });
        }
        else {
          utils.logger.info(utils.responseMsg(res, { ResponseCode: 200, ResponseMsg: "success", data: { isDup: isDup, message: "เลขบัตรประชาชนนี้สามารถใช้งานได้" } }, req, mappingKey));
          res.send({ ResponseCode: 200, ResponseMsg: "success", data: { isDup: isDup, message: "เลขบัตรประชาชนนี้สามารถใช้งานได้" } });
        }
      }
    }
  } catch (error) {
    let e_ = utils.errorMsg(error, mappingKey);
    utils.logger.error(utils.responseMsg(res, e_, req, mappingKey));
    res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
  }
};

const getListMerchantShopByUserId = async (req, res, next) => {
  const mappingKey = utils.mappingRequestResponse();
  try {
    utils.logger.info(await utils.requestMsg(req, mappingKey));
    let usered = await utils.getUser(req.headers.token);
    if (usered.error === "Token is expired!") {
      utils.logger.info(utils.responseMsg(res, usered.error, req, mappingKey));
      res.status(401).send({ ResponseCode: 401, ResponseMsg: usered.error, data: null });
    } else {
      const { pageNumber, rowsOfPage } = req.query;
      const listShop = await merchantData.getListMerchantShopByUserId(pageNumber, rowsOfPage, usered.userId);
      res.send({ ResponseCode: 200, ResponseMsg: "success", total: listShop.total, data: listShop.list });
    }
  } catch (error) {
    let e_ = utils.errorMsg(error, mappingKey);
    utils.logger.error(utils.responseMsg(res, e_, req, mappingKey));
    res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
  }
};

const getCountReviewMerchantShop = async (req, res, next) => {
  const mappingKey = utils.mappingRequestResponse();
  try {
    utils.logger.info(await utils.requestMsg(req, mappingKey));
    let usered = await utils.getUser(req.headers.token);
    if (usered.error === "Token is expired!") {
      utils.logger.info(utils.responseMsg(res, usered.error, req, mappingKey));
      res.status(401).send({ ResponseCode: 401, ResponseMsg: usered.error, data: null });
    } else {
      const { shopId } = req.query;
      const count = await merchantData.getCountReviewMerchantShop(shopId);
      res.send({ ResponseCode: 200, ResponseMsg: "success", data: count });
    }
  } catch (error) {
    let e_ = utils.errorMsg(error, mappingKey);
    utils.logger.error(utils.responseMsg(res, e_, req, mappingKey));
    res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
  }
};

const viewMerchant = async (req, res, next) => {
  const mappingKey = utils.mappingRequestResponse();
  try {
    utils.logger.info(await utils.requestMsg(req, mappingKey));
    let usered = await utils.getUser(req.headers.token);
    if (usered.error === "Token is expired!") {
      utils.logger.info(utils.responseMsg(res, usered.error, req, mappingKey));
      res.status(401).send({ ResponseCode: 401, ResponseMsg: usered.error, data: null });
    } else {
      const { shopId } = req.query;
      const data = await merchantData.viewMerchant(shopId, usered.userId);
      if (data.shopType) {
        let openDateTimes = await shopData.getShopOpenDateTime(data.shopType.opendatetime_id);
        data.shopType = { ...data.shopType, openDateTimes: openDateTimes };
      }
      res.send({ ResponseCode: 200, ResponseMsg: "success", data: data });
    }
  } catch (error) {
    let e_ = utils.errorMsg(error, mappingKey);
    utils.logger.error(utils.responseMsg(res, e_, req, mappingKey));
    res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
  }
};

const countReviewRetrospect = async (req, res, next) => {
  const mappingKey = utils.mappingRequestResponse();
  try {
    utils.logger.info(await utils.requestMsg(req, mappingKey));
    let usered = await utils.getUser(req.headers.token);
    if (usered.error === "Token is expired!") {
      utils.logger.info(utils.responseMsg(res, usered.error, req, mappingKey));
      res.status(401).send({ ResponseCode: 401, ResponseMsg: usered.error, data: null });
    } else {
      const { shopId, day } = req.query;
      const data = await merchantData.countReviewRetrospect(shopId, day);
      res.send({ ResponseCode: 200, ResponseMsg: "success", total: data.total, data: data.list });
    }
  } catch (error) {
    let e_ = utils.errorMsg(error, mappingKey);
    utils.logger.error(utils.responseMsg(res, e_, req, mappingKey));
    res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
  }
};

const scoreAverageShop = async (req, res, next) => {
  const mappingKey = utils.mappingRequestResponse();
  try {
    utils.logger.info(await utils.requestMsg(req, mappingKey));
    let usered = await utils.getUser(req.headers.token);
    if (usered.error === "Token is expired!") {
      utils.logger.info(utils.responseMsg(res, usered.error, req, mappingKey));
      res.status(401).send({ ResponseCode: 401, ResponseMsg: usered.error, data: null });
    } else {
      const { shopId } = req.query;
      const data = await merchantData.scoreAverageShop(shopId);
      res.send({ ResponseCode: 200, ResponseMsg: "success", countReviewAll: data.countReviewAll, scoreTotal: data.scoreTotal, data: data.list });
    }
  } catch (error) {
    let e_ = utils.errorMsg(error, mappingKey);
    utils.logger.error(utils.responseMsg(res, e_, req, mappingKey));
    res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
  }
};

const scoreAverageGroup = async (req, res, next) => {
  const mappingKey = utils.mappingRequestResponse();
  try {
    utils.logger.info(await utils.requestMsg(req, mappingKey));
    let usered = await utils.getUser(req.headers.token);
    if (usered.error === "Token is expired!") {
      utils.logger.info(utils.responseMsg(res, usered.error, req, mappingKey));
      res.status(401).send({ ResponseCode: 401, ResponseMsg: usered.error, data: null });
    } else {
      const { shopId } = req.query;
      const data = await merchantData.scoreAverageGroup(shopId);
      res.send({ ResponseCode: 200, ResponseMsg: "success", data: data });
    }
  } catch (error) {
    let e_ = utils.errorMsg(error, mappingKey);
    utils.logger.error(utils.responseMsg(res, e_, req, mappingKey));
    res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
  }
};

const getMerchantShopReviewFilter = async (req, res, next) => {
  const mappingKey = utils.mappingRequestResponse();
  try {
    utils.logger.info(await utils.requestMsg(req, mappingKey));
    let usered = await utils.getUser(req.headers.token);
    if (usered.error === "Token is expired!") {
      utils.logger.info(utils.responseMsg(res, usered.error, req, mappingKey));
      res.status(401).send({ ResponseCode: 401, ResponseMsg: usered.error, data: null });
    } else {
      const { shopId, score, sort, pageNumber, rowsOfPage } = req.query;
      const data = await merchantData.getMerchantShopReviewFilter(shopId, score ? score : 0, sort ? sort : 'desc', pageNumber, rowsOfPage);
      res.send({ ResponseCode: 200, ResponseMsg: "success", data: data });
    }
  } catch (error) {
    let e_ = utils.errorMsg(error, mappingKey);
    utils.logger.error(utils.responseMsg(res, e_, req, mappingKey));
    res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
  }
};

const updateEditMerchantShop = async (req, res, next) => {
  const mappingKey = utils.mappingRequestResponse();
  try {
    utils.logger.info(await utils.requestMsg(req, mappingKey));
    let usered = await utils.getUser(req.headers.token);
    if (usered.error === "Token is expired!") {
      utils.logger.info(utils.responseMsg(res, usered.error, req, mappingKey));
      res.status(401).send({ ResponseCode: 401, ResponseMsg: usered.error, data: null });
    } else {
      const data = req.body;
      // update EatingType Data
      const eatingTypeData = {}
      eatingTypeData.shopId = data.shop_id
      eatingTypeData.shopEatingTypeId = data.shopEatingTypeId
      await shopData.updateEatingType(eatingTypeData);
      // update OpenDateTime Data
      const openDateTimeData = {
        newOpenDateTimes: [],
        oldOpenDateTimes: {}
      }
      openDateTimeData.newOpenDateTimes = data.openDateTimes
      openDateTimeData.oldOpenDateTimes.openDateTimeId = data.oldOpenDateTimeId
      openDateTimeData.oldOpenDateTimes.shopId = data.shop_id
      openDateTimeData.oldOpenDateTimes.updatedBy = usered.userId
      await shopData.updateEditOpenDateTime(openDateTimeData.oldOpenDateTimes);
      const openDateTimeId = await shopData.createOpenDateTime(usered.userId);
      await Promise.all(
        openDateTimeData.newOpenDateTimes.map(async (item) => {
          await shopData.createOpenDateTimes(item, usered.userId, openDateTimeId);

        })
      )
      const opendatetime_id = await shopData.updateShopIdByOpenDateTimeId(openDateTimeId, openDateTimeData.oldOpenDateTimes.shopId);
      // update Location Data
      const locationData = {
        newLocation: {},
        oldLocation: {}
      }
      locationData.newLocation = data.location
      locationData.oldLocation.locationId = data.oldLocationId
      locationData.oldLocation.shopId = data.shop_id
      const location_id = await axios({
        url: `${config.LOCATION_API}/api/location/edit`,
        method: 'POST',
        headers: {
          'token': req.headers.token,
          'Content-Type': 'application/json'
        },
        data: locationData
      }).then(async resData => {
        return resData.data.data.result[0].location_id
      }).catch(err => {
        throw err
      })
      // update Shop Data
      const shop = {}
      shop.location_id = location_id
      shop.shopName = data.shopName
      shop.shopNameEN = data.shopNameEN
      shop.shop_branch_name = data.shop_branch_name
      shop.shopType_id = data.shopType_id
      shop.foodType_id = data.foodType_id
      shop.opening_time = data.opening_time
      shop.recommend = data.recommend
      shop.images_id = data.images_id
      shop.remark = data.remark
      shop.shopweekday_id = data.shopweekday_id
      shop.closing_time = data.closing_time
      shop.price_range = data.price_range
      shop.tel = data.tel
      shop.opendatetime_id = opendatetime_id
      shop.foodType_other = data.foodType_other
      const updated = await shopData.updateEditShop(data.shop_id, shop, usered.userId);
      utils.logger.info(utils.responseMsg(res, updated, req, mappingKey));
      res.send({ ResponseCode: 200, ResponseMsg: "success", data: updated });
    }
  } catch (error) {
    let e_ = utils.errorMsg(error, mappingKey);
    utils.logger.error(utils.responseMsg(res, e_, req, mappingKey));
    res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
  }
};

module.exports = {
  addMerchant,
  getMerchantShop,
  getMerchantShopAuth,
  addMerchantPostReview,
  addMerchantShopReviewScore,
  checkUserIdAndPersonelDupilcate,
  getListMerchantShopByUserId,
  getCountReviewMerchantShop,
  viewMerchant,
  countReviewRetrospect,
  scoreAverageShop,
  scoreAverageGroup,
  getMerchantShopReviewFilter,
  updateEditMerchantShop
};