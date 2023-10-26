'use strict';

const activityData = require('../data/activity');
const utils = require('../data/utils');
const errorLogData = require('../data/errorLog');
const shopData = require("../data/shop");
const merchantData = require("../data/merchant");

const getActivityShopsHit = async (req, res, next) => {
  const mappingKey = utils.mappingRequestResponse();
  try {
    utils.logger.info(await utils.requestMsg(req, mappingKey));
    const { lat, lng, pageNumber, rowsOfPage, groupCode } = req.query;
    const activitys = await activityData.getActivityShopsHit(
      lat,
      lng,
      pageNumber,
      rowsOfPage,
      groupCode
    );

    //Set imageId on Shop is not have imageId
    for (let i = 0; i < activitys.length; i++) {
      let sData = activitys[i];
      if (!sData.imageSrc) {
        let firstReview = null;
        if (sData.types == 'merchant_shop') {
          firstReview = await merchantData.getImageFromFirstReview(sData.sid);
        } else {
          firstReview = await shopData.getImageFromFirstReview(sData.sid);
        }
        if (firstReview) {
          sData.images_id = firstReview.images_id;
          sData.imageSrc = firstReview.image_list;
          sData.images_thumbnail_fileName = firstReview.image_list_thumbnail;
          sData.imageDescription = firstReview.image_url;
          sData.images_thumbnail_description = firstReview.image_url_thumbnail;
        }
      }
    }
    //Set imageId on Shop is not have imageId
    utils.logger.info(utils.responseMsg(res, activitys, req, mappingKey));
    res.send({ ResponseCode: 200, ResponseMsg: 'success', data: activitys });
  } catch (error) {
    let e_ = utils.errorMsg(error, mappingKey);
    utils.logger.error(utils.responseMsg(res, e_, req, mappingKey));
    const requestErrorLog = await errorLogData.createErrorLog(
      {
        error_from: 'Patois Api',
        error_name: 'Catch error',
        error_func_name: 'getActivityShopsHit',
        error_code: '',
        error_massage: error.message,
      },
      ''
    );
    res
      .status(400)
      .send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
  }
};

const getActivityShopsHitAuth = async (req, res, next) => {
  const mappingKey = utils.mappingRequestResponse();
  try {
    utils.logger.info(await utils.requestMsg(req, mappingKey));
    let usered = await utils.getUser(req.headers.token);
    if (usered.error === 'Token is expired!') {
      utils.logger.info(utils.responseMsg(res, usered.error, req, mappingKey));
      res.status(401).send({ ResponseCode: 401, ResponseMsg: usered.error, data: null });
    } else {
      const { lat, lng, pageNumber, rowsOfPage, groupCode } = req.query;
      const activitys = await activityData.getActivityShopsHitAuth(
        lat,
        lng,
        pageNumber,
        rowsOfPage,
        groupCode,
        usered.userId
      );
      //Set imageId on Shop is not have imageId
      for (let i = 0; i < activitys.length; i++) {
        let sData = activitys[i];
        if (!sData.imageSrc) {
          let firstReview = null;
          if (sData.types == 'merchant_shop') {
            firstReview = await merchantData.getImageFromFirstReview(sData.sid);
          } else {
            firstReview = await shopData.getImageFromFirstReview(sData.sid);
          }
          if (firstReview) {
            sData.images_id = firstReview.images_id;
            sData.imageSrc = firstReview.image_list;
            sData.images_thumbnail_fileName = firstReview.image_list_thumbnail;
            sData.imageDescription = firstReview.image_url;
            sData.images_thumbnail_description = firstReview.image_url_thumbnail;
          }
        }
      }
      //Set imageId on Shop is not have imageId
      utils.logger.info(utils.responseMsg(res, activitys, req, mappingKey));
      res.send({ ResponseCode: 200, ResponseMsg: 'success', data: activitys });
    }
  } catch (error) {
    let e_ = utils.errorMsg(error, mappingKey);
    utils.logger.error(utils.responseMsg(res, e_, req, mappingKey));
    const requestErrorLog = await errorLogData.createErrorLog(
      {
        error_from: 'Patois Api',
        error_name: 'Catch error',
        error_func_name: 'getActivityShopsHitAuth',
        error_code: '',
        error_massage: error.message,
      },
      ''
    );
    res
      .status(400)
      .send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
  }
};

const getActivityShopsNearby = async (req, res, next) => {
  const mappingKey = utils.mappingRequestResponse();
  try {
    utils.logger.info(await utils.requestMsg(req, mappingKey));
    const { lat, lng, pageNumber, rowsOfPage } = req.query;
    const activitys = await activityData.getActivityShopsNearby(
      lat,
      lng,
      pageNumber,
      rowsOfPage
    );

    //Set imageId on Shop is not have imageId
    for (let i = 0; i < activitys.length; i++) {
      let sData = activitys[i];
      if (!sData.imageSrc) {
        let firstReview = null;
        if (sData.types == 'merchant_shop') {
          firstReview = await merchantData.getImageFromFirstReview(sData.sid);
        } else {
          firstReview = await shopData.getImageFromFirstReview(sData.sid);
        }
        if (firstReview) {
          sData.images_id = firstReview.images_id;
          sData.imageSrc = firstReview.image_list;
          sData.images_thumbnail_fileName = firstReview.image_list_thumbnail;
          sData.imageDescription = firstReview.image_url;
          sData.images_thumbnail_description = firstReview.image_url_thumbnail;
        }
      }
    }
    //Set imageId on Shop is not have imageId
    utils.logger.info(utils.responseMsg(res, activitys, req, mappingKey));
    res.send({ ResponseCode: 200, ResponseMsg: 'success', data: activitys });
  } catch (error) {
    let e_ = utils.errorMsg(error, mappingKey);
    utils.logger.error(utils.responseMsg(res, e_, req, mappingKey));
    const requestErrorLog = await errorLogData.createErrorLog(
      {
        error_from: 'Patois Api',
        error_name: 'Catch error',
        error_func_name: 'getActivityShopsNearby',
        error_code: '',
        error_massage: error.message,
      },
      ''
    );
    res
      .status(400)
      .send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
  }
};

module.exports = {
  getActivityShopsHit,
  getActivityShopsHitAuth,
  getActivityShopsNearby,
};
