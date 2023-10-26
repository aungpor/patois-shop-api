"use strict";

const masterBistroData = require("../data/masterBistro");
const utils = require("../data/utils");

const getShopTypes = async (req, res, next) => {
  const mappingKey = utils.mappingRequestResponse();
  try {
    utils.logger.info(await utils.requestMsg(req, mappingKey));
    let usered = await utils.getUser(req.headers.token);
    if (usered.error === "Token is expired!") {
      utils.logger.info(utils.responseMsg(res, usered.error, req, mappingKey));
      res.status(401).send({ ResponseCode: 401, ResponseMsg: usered.error, data: null });
    } else {
      const data = await masterBistroData.getShopTypes();
      utils.logger.info(utils.responseMsg(res, data, req, mappingKey));
      res.send({ ResponseCode: 200, ResponseMsg: "success", data: data });
    }
  } catch (error) {
    let e_ = utils.errorMsg(error, mappingKey);
    utils.logger.error(utils.responseMsg(res, e_, req, mappingKey));
    res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
  }
};

const getFoodTypes = async (req, res, next) => {
  const mappingKey = utils.mappingRequestResponse();
  try {
    utils.logger.info(await utils.requestMsg(req, mappingKey));
    const data = await masterBistroData.getFoodTypes();
    utils.logger.info(utils.responseMsg(res, data, req, mappingKey));
    res.send({ ResponseCode: 200, ResponseMsg: "success", data: data });

  } catch (error) {
    let e_ = utils.errorMsg(error, mappingKey);
    utils.logger.error(utils.responseMsg(res, e_, req, mappingKey));
    res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
  }
};

const getPriceRangs = async (req, res, next) => {
  const mappingKey = utils.mappingRequestResponse();
  try {
    utils.logger.info(await utils.requestMsg(req, mappingKey));
    let usered = await utils.getUser(req.headers.token);
    if (usered.error === "Token is expired!") {
      utils.logger.info(utils.responseMsg(res, usered.error, req, mappingKey));
      res.status(401).send({ ResponseCode: 401, ResponseMsg: usered.error, data: null });
    } else {
      const data = await masterBistroData.getPriceRangs();
      utils.logger.info(utils.responseMsg(res, data, req, mappingKey));
      res.send({ ResponseCode: 200, ResponseMsg: "success", data: data });
    }
  } catch (error) {
    let e_ = utils.errorMsg(error, mappingKey);
    utils.logger.error(utils.responseMsg(res, e_, req, mappingKey));
    res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
  }
};

const shopEatingType = async (req, res, next) => {
  const mappingKey = utils.mappingRequestResponse();
  try {
    utils.logger.info(await utils.requestMsg(req, mappingKey));
    let usered = await utils.getUser(req.headers.token);
    if (usered.error === "Token is expired!") {
      utils.logger.info(utils.responseMsg(res, usered.error, req, mappingKey));
      res.status(401).send({ ResponseCode: 401, ResponseMsg: usered.error, data: null });
    } else {
      const data = await masterBistroData.shopEatingType();
      utils.logger.info(utils.responseMsg(res, data, req, mappingKey));
      res.send({ ResponseCode: 200, ResponseMsg: "success", data: data });
    }
  } catch (error) {
    let e_ = utils.errorMsg(error, mappingKey);
    utils.logger.error(utils.responseMsg(res, e_, req, mappingKey));
    res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
  }
};

module.exports = {
  getShopTypes,
  getFoodTypes,
  getPriceRangs,
  shopEatingType,
};
