"use strict";

const express = require("express");
const masterBistroController = require("../controllers/masterBistroController");
const router = express.Router();
const verify = require("../middleware/verifyToken");

const {
  getShopTypes,
  getFoodTypes,
  getPriceRangs,
  shopEatingType,
} = masterBistroController;

router.get("/master/bistro/foodtypes", getFoodTypes);
router.get("/master/bistro/shopEatingType", verify, shopEatingType);
router.get("/master/bistro/shoptypes", verify, getShopTypes);
router.get("/master/bistro/pricerangs", verify, getPriceRangs);

module.exports = {
  routes: router,
};
