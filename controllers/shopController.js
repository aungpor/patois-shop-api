"use strict";

const shopData = require("../data/shop");
const utils = require("../data/utils");
const axios = require('axios');
const errorLogData = require("../data/errorLog");
const configData = require("../data/config");
const missionUtils = require("../data/missionUtils");
const userData = require("../data/user");
const config = require("../config");

const addShop = async (req, res, next) => {
  const mappingKey = utils.mappingRequestResponse();
  try {
    utils.logger.info(await utils.requestMsg(req, mappingKey));
    let usered = await utils.getUser(req.headers.token);
    if (usered.error === "Token is expired!") {
      utils.logger.info(utils.responseMsg(res, usered.error, req, mappingKey));
      res.status(401).send({ ResponseCode: 401, ResponseMsg: usered.error, data: null });
    } else {
      const data = req.body;
      const result = await shopData.createShop(data, usered.userId);
      utils.logger.info(utils.responseMsg(res, result, req, mappingKey));
      res.send({ ResponseCode: 200, ResponseMsg: "success", data: { shopId: result } });

    }
  } catch (error) {
    let e_ = utils.errorMsg(error, mappingKey);
    utils.logger.error(utils.responseMsg(res, e_, req, mappingKey));
    res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });

  }
};

const getShop = async (req, res, next) => {
  const mappingKey = utils.mappingRequestResponse();
  try {
    utils.logger.info(await utils.requestMsg(req, mappingKey));
    let {pageNumber, rowsOfPage} = req.query;
    pageNumber=(pageNumber) ? pageNumber : 1;
    rowsOfPage=(rowsOfPage) ? rowsOfPage : 5000;
    const shopId = req.params.id;
    const oneShop = await shopData.getById(shopId, "");

    let shopsData = [];
    await Promise.all(
      oneShop.map(async (shop) => {
        //Set imageId on Shop is not have imageId
        if (!shop.images_id) {
          const firstReview = await shopData.getImageFromFirstReview(shopId);
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
        const maxLikeReview = await shopData.getImageFromMaxLikeReview(shopId);
        if (maxLikeReview) {
          shop.image_list += (',' + maxLikeReview.image_list);
          shop.image_list_thumbnail += (',' + maxLikeReview.image_list_thumbnail);
          shop.image_url += (',' + maxLikeReview.image_url);
          shop.image_url_thumbnail += (',' + maxLikeReview.image_url_thumbnail);
        }
        // set imageId from review is max like


        const reviews = await shopData.getShopPostReviewAll(shopId, "", pageNumber, rowsOfPage);
        if (reviews) {
          reviews.map((item) => {
            shop.image_list += (',' + item.image_list);
            shop.image_list_thumbnail += (',' + item.image_list_thumbnail);
            shop.image_url += (',' + item.image_url);
            shop.image_url_thumbnail += (',' + item.image_url_thumbnail);
          })
          shop = { ...shop, reviews: reviews };
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

  } catch (error) {
    let e_ = utils.errorMsg(error, mappingKey);
    utils.logger.error(utils.responseMsg(res, e_, req, mappingKey));
    const requestErrorLog = await errorLogData.createErrorLog({
      error_from: "Patois Api",
      error_name: "Catch error",
      error_func_name: "getShop",
      error_code: "",
      error_massage: error.message
    }, '');

    res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
  }
};

const getShopAuth = async (req, res, next) => {
  const mappingKey = utils.mappingRequestResponse();
  try {
    utils.logger.info(await utils.requestMsg(req, mappingKey));
    const usered = await utils.getUser(req.headers.token);
    if (usered.error === "Token is expired!") {
      utils.logger.info(utils.responseMsg(res, usered.error, req, mappingKey));
      res.status(401).send({ ResponseCode: 401, ResponseMsg: usered.error, data: null });
    } else {
      let { isMyUserProfile, pageNumber, rowsOfPage} = req.query;
      pageNumber=(pageNumber) ? pageNumber : 1;
      rowsOfPage=(rowsOfPage) ? rowsOfPage : 5000;
      const shopId = req.params.id;

      let oneShop = await shopData.getByMyUserProfile(shopId, usered.userId);
      if(!oneShop.length){
        oneShop = await shopData.getById(shopId, usered.userId);
      }

      let shopsData = [];
      await Promise.all(
        oneShop.map(async (shop) => {
          //Set imageId on Shop is not have imageId
          if (!shop.images_id) {
            const firstReview = await shopData.getImageFromFirstReview(shopId);
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
          const maxLikeReview = await shopData.getImageFromMaxLikeReview(shopId);
          if (maxLikeReview) {
            shop.image_list += (',' + maxLikeReview.image_list);
            shop.image_list_thumbnail += (',' + maxLikeReview.image_list_thumbnail);
            shop.image_url += (',' + maxLikeReview.image_url);
            shop.image_url_thumbnail += (',' + maxLikeReview.image_url_thumbnail);
          }
          // set imageId from review is max like

          let reviews
          if (isMyUserProfile == "true") {
            reviews = await shopData.getShopPostReviewAllMyUserProfile(shopId, usered.userId);
          }
          else {
            reviews = await shopData.getShopPostReviewAll(shopId, usered.userId, pageNumber, rowsOfPage);
          }
          let reviewsData = [];
          if (reviews) {
            await Promise.all(
              reviews.map(async (r) => {
                let reviewsLike = await shopData.getShopPostReviewLikes(r.post_review_id);
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
            reviews.map((item) => {
              shop.image_list += (',' + item.image_list);
              shop.image_list_thumbnail += (',' + item.image_list_thumbnail);
              shop.image_url += (',' + item.image_url);
              shop.image_url_thumbnail += (',' + item.image_url_thumbnail);
            })
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
    const requestErrorLog = await errorLogData.createErrorLog({
      error_from: "Patois Api",
      error_name: "Catch error",
      error_func_name: "getShopAuth",
      error_code: "",
      error_massage: error.message
    }, '');

    res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
  }
};



const getShopMyReviewAuth = async (req, res, next) => {
   const mappingKey = utils.mappingRequestResponse();
   try {
     utils.logger.info(await utils.requestMsg(req, mappingKey));
     const usered = await utils.getUser(req.headers.token);
     if (usered.error === "Token is expired!") {
       utils.logger.info(utils.responseMsg(res, usered.error, req, mappingKey));
       res.status(401).send({ ResponseCode: 401, ResponseMsg: usered.error, data: null });
     } else {
         const { pageNumber, rowsOfPage, shopId } = req.body;
 
         let reviews=null;
         reviews = await shopData.getShopMyReviewAuth(shopId, usered.userId, pageNumber, rowsOfPage);

         let reviewsData = [];
         if (reviews) {
            await Promise.all(
            reviews.map(async (r) => {
               let reviewsLike = await shopData.getShopPostReviewLikes(r.post_review_id);
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
         }
        
       
       utils.logger.info(utils.responseMsg(res, reviewsData, req, mappingKey));
       res.send({ ResponseCode: 200, ResponseMsg: "success", data: reviewsData });
 
     }
   } catch (error) {
     let e_ = utils.errorMsg(error, mappingKey);
     utils.logger.error(utils.responseMsg(res, e_, req, mappingKey));
     const requestErrorLog = await errorLogData.createErrorLog({
       error_from: "Patois Api",
       error_name: "Catch error",
       error_func_name: "getShopMyReviewAuth",
       error_code: "",
       error_massage: error.message
     }, '');
 
     res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
   }
 };
 

const addOpenDateTime = async (req, res, next) => {
  const mappingKey = utils.mappingRequestResponse();
  try {
    utils.logger.info(await utils.requestMsg(req, mappingKey));
    let usered = await utils.getUser(req.headers.token);
    if (usered.error === "Token is expired!") {
      utils.logger.info(utils.responseMsg(res, usered.error, req, mappingKey));
      res.status(401).send({ ResponseCode: 401, ResponseMsg: usered.error, data: null });
    } else {
      const data = req.body;
      const openDateTimeId = await shopData.createOpenDateTime(usered.userId);
      await Promise.all(
        data.openDateTimes.map(async (item) => {
          await shopData.createOpenDateTimes(item, usered.userId, openDateTimeId);

        })
      )
      utils.logger.info(utils.responseMsg(res, openDateTimeId, req, mappingKey));
      res.send({ ResponseCode: 200, ResponseMsg: "success", data: { openDateTimeId: openDateTimeId } });

    }
  } catch (error) {
    let e_ = utils.errorMsg(error, mappingKey);
    utils.logger.error(utils.responseMsg(res, e_, req, mappingKey));
    res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });

  }
};

const addShopHistory = async (req, res, next) => {
  const mappingKey = utils.mappingRequestResponse();
  try {
    utils.logger.info(await utils.requestMsg(req, mappingKey));
    let usered = await utils.getUser(req.headers.token);
    if (usered.error === "Token is expired!") {
      utils.logger.info(utils.responseMsg(res, usered.error, req, mappingKey));
      res.status(401).send({ ResponseCode: 401, ResponseMsg: usered.error, data: null });
    } else {
      const data = req.body;
      const result = await shopData.createShopHistory(data, usered.userId);
      utils.logger.info(utils.responseMsg(res, result, req, mappingKey));
      res.send({ ResponseCode: 200, ResponseMsg: "success", data: { shopHistoryId: result } });

    }
  } catch (error) {
    let e_ = utils.errorMsg(error, mappingKey);
    utils.logger.error(utils.responseMsg(res, e_, req, mappingKey));
    res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });

  }
};

const addShopHistorys = async (req, res, next) => {
  const mappingKey = utils.mappingRequestResponse();
  try {
    utils.logger.info(await utils.requestMsg(req, mappingKey));
    let usered = await utils.getUser(req.headers.token);
    if (usered.error === "Token is expired!") {
      utils.logger.info(utils.responseMsg(res, usered.error, req, mappingKey));
      res.status(401).send({ ResponseCode: 401, ResponseMsg: usered.error, data: null });
    } else {
      const data = req.body;
      const result = await shopData.createShopHistorys(data, usered.userId);
      utils.logger.info(utils.responseMsg(res, result, req, mappingKey));
      res.send({ ResponseCode: 200, ResponseMsg: "success", data: { shopHistorysId: result } });

    }
  } catch (error) {
    let e_ = utils.errorMsg(error, mappingKey);
    utils.logger.error(utils.responseMsg(res, e_, req, mappingKey));
    res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });

  }
};

const updateEatingType = async (req, res, next) => {
  const mappingKey = utils.mappingRequestResponse();
  try {
    utils.logger.info(await utils.requestMsg(req, mappingKey));
    const data = req.body;
    const updated = await shopData.updateEatingType(data);
    utils.logger.info(utils.responseMsg(res, updated, req, mappingKey));
    res.send({ ResponseCode: 200, ResponseMsg: "success", data: updated });

  } catch (error) {
    let e_ = utils.errorMsg(error, mappingKey);
    utils.logger.error(utils.responseMsg(res, e_, req, mappingKey));
    res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
  }
};


const addPostReview = async (req, res, next) => {
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
      const device = req.headers['user-agent'];
      const result = await shopData.createPostReview(data, usered.userId, ipAddress, device);


      let mission_code=null;
      let handleMissoin=null;

      if (!data.postReview.isCreateShop && (data.postReview.quality_status == 'Qualify' || data.postReview.quality_status == 'Good Quality')) {

         // รีวิวภายใน 14 วัน รับคูปอง Punthai Buy 1 Get 1 free
         mission_code = 'M0000014';
         handleMissoin = await missionUtils.handleMissoinByMissionCode(mission_code, usered, mappingKey, req, 'S003');
      }

      if (data.postReview.quality_status == 'Qualify' || data.postReview.quality_status == 'Good Quality') {

         // รีวิวครั้งแรกรับ 100 Point
         mission_code = 'M0000010';
         handleMissoin = await missionUtils.handleMissoinByMissionCode(mission_code, usered, mappingKey, req);


         // รีวิวครั้งที่ 2 รับ 100 Point
         mission_code = 'M0000011';
         handleMissoin = await missionUtils.handleMissoinByMissionCode(mission_code, usered, mappingKey, req);


         
         //อัพรูปอย่างเดียวไม่ได้ ต้องรีวิวอย่างน้อย 60 ตัวอักษรด้วย 
         if(data.postReview.review && data.postReview.review.length >= 60 ){
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

      let handleampaign = null;
      try {
         utils.logDebug('handleampaign Start..' + ' mappingKey:' + mappingKey);
         handleampaign = await shopData.handleShopInCampaign(data, usered, mappingKey, req);
      } catch (error) {
         console.log(error)
      }
      utils.logDebug('handleampaign Complete handleampaign:'+JSON.stringify(handleampaign) + ' mappingKey:' + mappingKey);

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
            const count = await shopData.countShopListMenu(data.postReview.shop_id, menu, "shop");
            if (count == 0) {
              await shopData.addShopListMenu(data.postReview.shop_id, menu, result, "shop");
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
        //const notificationsId = await shopData.createNotiPostReview(configMessage, usered.userId, result, 'report_review_shop');
        const logResult = { ResponseMsg: configMessage, data: { postReviewId: result, matching: handlePointResult, attend_campaign: handleampaign} }
        utils.logger.info(utils.responseMsg(res, logResult, req, mappingKey));
        res.send({ ResponseCode: 200, ResponseMsg: configMessage, data: { postReviewId: result, matching: handlePointResult, attend_campaign: handleampaign } });
      } else {
        const logResult = { ResponseMsg: "success", data: { postReviewId: result, matching: handlePointResult, attend_campaign: handleampaign } }
        utils.logger.info(utils.responseMsg(res, logResult, req, mappingKey));
        res.send({ ResponseCode: 200, ResponseMsg: "success", data: { postReviewId: result, matching: handlePointResult, attend_campaign: handleampaign } });
      }

    }
  } catch (error) {
    let e_ = utils.errorMsg(error, mappingKey);
    utils.logger.error(utils.responseMsg(res, e_, req, mappingKey));
    res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });

  }
};

const addShopReviewScore = async (req, res, next) => {
  const mappingKey = utils.mappingRequestResponse();
  try {
    utils.logger.info(await utils.requestMsg(req, mappingKey));
    let usered = await utils.getUser(req.headers.token);
    if (usered.error === "Token is expired!") {
      utils.logger.info(utils.responseMsg(res, usered.error, req, mappingKey));
      res.status(401).send({ ResponseCode: 401, ResponseMsg: usered.error, data: null });
    } else {
      const data = req.body;
      const floatValue = parseFloat(data.shopReviewScore.total);

      if (floatValue > 5) {
        utils.logger.info(utils.responseMsg(res, null, req, mappingKey));
        res.status(400).send({ ResponseCode: 400, ResponseMsg: 'Invalid data!', data: null });
      }else {
        const result = await shopData.createShopReviewScore(data, usered.userId);
        utils.logger.info(utils.responseMsg(res, result, req, mappingKey));
        res.send({ ResponseCode: 200, ResponseMsg: "success", data: { reviewScoreId: result } });
      }
    }
  } catch (error) {
    let e_ = utils.errorMsg(error, mappingKey);
    utils.logger.error(utils.responseMsg(res, e_, req, mappingKey));
    res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });

  }
};

const getShopsListSuggestAuth = async (req, res, next) => {
  const mappingKey = utils.mappingRequestResponse();
  try {
    utils.logger.info(await utils.requestMsg(req, mappingKey));
    const usered = await utils.getUser(req.headers.token);
    if (usered.error === "Token is expired!") {
      utils.logger.info(utils.responseMsg(res, usered.error, req, mappingKey));
      res.status(401).send({ ResponseCode: 401, ResponseMsg: usered.error, data: null });
    } else {
      const { lat, lng, filter, text, pageNumber, rowsOfPage } = req.query;
      const shops = await shopData.getShopsListSuggest(lat, lng, filter, text, pageNumber, rowsOfPage, usered.userId);
      utils.logger.info(utils.responseMsg(res, shops, req, mappingKey));
      res.send({ ResponseCode: 200, ResponseMsg: "success", data: shops });
    }
  } catch (error) {
    let e_ = utils.errorMsg(error, mappingKey);
    utils.logger.error(utils.responseMsg(res, e_, req, mappingKey));
    const requestErrorLog = await errorLogData.createErrorLog({
      error_from: "Patois Api",
      error_name: "Catch error",
      error_func_name: "getShopsListSuggestAuth",
      error_code: "",
      error_massage: error.message
    }, '');

    res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
  }
};

const updateShopHistory = async (req, res, next) => {
  const mappingKey = utils.mappingRequestResponse();
  try {
    utils.logger.info(await utils.requestMsg(req, mappingKey));
    let usered = await utils.getUser(req.headers.token);
    if (usered.error === "Token is expired!") {
      utils.logger.info(utils.responseMsg(res, usered.error, req, mappingKey));
      res.status(401).send({ ResponseCode: 401, ResponseMsg: usered.error, data: null });
    } else {
      const shopHistoryId = req.params.id;
      const data = req.body;
      const updated = await shopData.updateShopHistory(shopHistoryId, data, usered.userId);
      utils.logger.info(utils.responseMsg(res, updated, req, mappingKey));
      res.send({ ResponseCode: 200, ResponseMsg: "success", data: updated });
    }
  } catch (error) {
    let e_ = utils.errorMsg(error, mappingKey);
    utils.logger.error(utils.responseMsg(res, e_, req, mappingKey));
    res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
  }
};

const updateShopHistoryId = async (req, res, next) => {
  const mappingKey = utils.mappingRequestResponse();
  try {
    utils.logger.info(await utils.requestMsg(req, mappingKey));
    const shopId = req.params.id;
    const data = req.body;
    const updated = await shopData.updateShopHistoryId(shopId, data);
    utils.logger.info(utils.responseMsg(res, updated, req, mappingKey));
    res.send({ ResponseCode: 200, ResponseMsg: "success", data: updated });
  } catch (error) {
    let e_ = utils.errorMsg(error, mappingKey);
    utils.logger.error(utils.responseMsg(res, e_, req, mappingKey));
    res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
  }
};

const updateEditShop = async (req, res, next) => {
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
      data.eatingTypeData.shopId = data.shopId
      await shopData.updateEatingType(data.eatingTypeData);
      // update OpenDateTime Data
      data.openDateTimeData.oldOpenDateTimes.shopId = data.shopId
      data.openDateTimeData.oldOpenDateTimes.updatedBy = usered.userId
      await shopData.updateEditOpenDateTime(data.openDateTimeData.oldOpenDateTimes);
      const openDateTimeId = await shopData.createOpenDateTime(usered.userId);
      await Promise.all(
        data.openDateTimeData.newOpenDateTimes.map(async (item) => {
          await shopData.createOpenDateTimes(item, usered.userId, openDateTimeId);

        })
      )
      const opendatetime_id = await shopData.updateShopIdByOpenDateTimeId(openDateTimeId, data.openDateTimeData.oldOpenDateTimes.shopId);
      // update Location Data
      data.locationData.oldLocation.shopId = data.shopId
      const location_id = await axios({
        url: `${config.LOCATION_API}/api/location/edit`,
        method: 'POST',
        headers: {
          'token': req.headers.token,
          'Content-Type': 'application/json'
        },
        data: data.locationData
      }).then(async resData => {
        return resData.data.data.result[0].location_id
      }).catch(err => {
        throw err
      })
      // update Shop Data
      data.shopData.location_id = location_id
      data.shopData.opendatetime_id = opendatetime_id
      const updated = await shopData.updateEditShop(data.shopId, data.shopData, usered.userId);
      utils.logger.info(utils.responseMsg(res, updated, req, mappingKey));
      res.send({ ResponseCode: 200, ResponseMsg: "success", data: updated });
    }
  } catch (error) {
    let e_ = utils.errorMsg(error, mappingKey);
    utils.logger.error(utils.responseMsg(res, e_, req, mappingKey));
    res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
  }
};

const editShopReviewScore = async (req, res, next) => {
  const mappingKey = utils.mappingRequestResponse();
  try {
    utils.logger.info(await utils.requestMsg(req, mappingKey));
    let usered = await utils.getUser(req.headers.token);
    if (usered.error === "Token is expired!") {
      utils.logger.info(utils.responseMsg(res, usered.error, req, mappingKey));
      res.status(401).send({ ResponseCode: 401, ResponseMsg: usered.error, data: null });
    } else {
      const reviewScoreId = req.params.id;
      const data = req.body;
      const result = await shopData.updateShopReviewScore(data, reviewScoreId);
      utils.logger.info(utils.responseMsg(res, result, req, mappingKey));
      res.send({ ResponseCode: 200, ResponseMsg: "success", data: result });
    }
  } catch (error) {
    let e_ = utils.errorMsg(error, mappingKey);
    utils.logger.error(utils.responseMsg(res, e_, req, mappingKey));
    res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });

  }
};


const getShopByIdAndAllActive = async (req, res, next) => {
  const mappingKey = utils.mappingRequestResponse();
  try {
    utils.logger.info(await utils.requestMsg(req, mappingKey));
    const shopId = req.params.id;
    const oneShop = await shopData.getByIdAndAllActive(shopId, "");

    let shopsData = [];
    await Promise.all(
      oneShop.map(async (shop) => {
        //Set imageId on Shop is not have imageId
        if (!shop.images_id) {
          const firstReview = await shopData.getImageFromFirstReview(shopId);
          if (firstReview) {
            shop.images_id = firstReview.images_id;
            shop.image_list = firstReview.image_list;
            shop.image_list_thumbnail = firstReview.image_list_thumbnail;
            shop.image_url = firstReview.image_url;
            shop.image_url_thumbnail = firstReview.image_url_thumbnail;
          }
        }
        //Set imageId on Shop is not have imageId

        const reviews = await shopData.getShopPostReviewAll(shopId, "");
        if (reviews) {
          shop = { ...shop, reviews: reviews };
        }
        else {
          shop;
        }
        let openDateTimes = await shopData.getShopOpenDateTime(shop.opendatetime_id);
        shop = { ...shop, openDateTimes: openDateTimes };
        shopsData.push(shop);
      })
    )

    // var sorted_shopsData = shopsData.sort(function(a, b) {
    //   return a.distance - b.distance;
    // });
    utils.logger.info(utils.responseMsg(res, shopsData, req, mappingKey));
    res.send({ ResponseCode: 200, ResponseMsg: "success", data: shopsData });

  } catch (error) {
    let e_ = utils.errorMsg(error, mappingKey);
    utils.logger.error(utils.responseMsg(res, e_, req, mappingKey));
    const requestErrorLog = await errorLogData.createErrorLog({
      error_from: "Patois Api",
      error_name: "Catch error",
      error_func_name: "getShop",
      error_code: "",
      error_massage: error.message
    }, '');

    res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
  }
};


module.exports = {
  addShop,
  getShop,
  getShopAuth,
  addOpenDateTime,
  addShopHistory,
  addShopHistorys,
  updateEatingType,
  addPostReview,
  addShopReviewScore,
  getShopsListSuggestAuth,
  updateShopHistory,
  updateShopHistoryId,
  updateEditShop,
  editShopReviewScore,
  getShopByIdAndAllActive,
  getShopMyReviewAuth
};
