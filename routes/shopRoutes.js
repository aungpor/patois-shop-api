"use strict";

const express = require("express");
const shopController = require("../controllers/shopController");
const router = express.Router();
const verify = require("../middleware/verifyToken");
const verifySignature = require("../middleware/verifySignature");

const { addShop,
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
} = shopController;

router.post("/", addShop);
router.get("/getShop/:id", getShop);
router.get("/shopAuth/:id", verify, getShopAuth);
router.post("/updateEatingType", verify, updateEatingType);
router.post("/post/review", verify, verifySignature, addPostReview);
router.post("/reviewScore", verify, addShopReviewScore);
router.put("/reviewScore/edit/:id", verify, editShopReviewScore);
router.get("/shopsListSuggestAuth", verify, getShopsListSuggestAuth)
router.get("/allaction/:id", getShopByIdAndAllActive);;

router.post("/shopDecrypt", verify, verifySignature, addShop);
router.post("/edit", verify, verifySignature, updateEditShop);

router.post("/open/datetime", verify, addOpenDateTime);

router.post("/history", verify, addShopHistory);
router.post("/historys", verify, addShopHistorys);
router.put("/history/:id", verify, updateShopHistory);
router.put("/historyId/:id", verify, updateShopHistoryId);
router.post("/getShopMyReviewAuth", verify, getShopMyReviewAuth);


module.exports = {
  routes: router,
};
