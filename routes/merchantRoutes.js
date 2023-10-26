"use strict";

const express = require("express");
const merchantController = require("../controllers/merchantController");
const router = express.Router();
const verify = require("../middleware/verifyToken");

const { addMerchant,
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
} = merchantController;

router.post("/merchant", verify, addMerchant);
router.get("/merchant/shopId/:id", getMerchantShop);
router.get("/merchant/shopAuth/:id", verify, getMerchantShopAuth);
router.post("/merchant/shop/post/review", verify, addMerchantPostReview);
router.post("/merchant/shop/reviewScore", verify, addMerchantShopReviewScore);
router.post("/merchant/check/personalId", verify, checkUserIdAndPersonelDupilcate);

router.get("/merchant/getListMerchantShopByUserId", verify, getListMerchantShopByUserId);
router.get("/merchant/getCountReviewMerchantShop", verify, getCountReviewMerchantShop);

router.get("/merchant/shop/view", verify, viewMerchant); // api สำหรับ getMerchant ก่อนหน้า edit
router.get("/merchant/review/count/retrospect", verify, countReviewRetrospect); // ยอดรีวิวย้อนหลัง
router.get("/merchant/score/average/shop", verify, scoreAverageShop); // คะแนนเฉลี่ยร้านค้า
router.get("/merchant/score/average/group", verify, scoreAverageGroup); // คะแนนเฉลี่ยตามหมวดหมู่
router.get("/merchant/shop/review/filter", verify, getMerchantShopReviewFilter) // หน้ารีวิว Merchant ที่มีการ filter score, ใหม่ล่าสุด
router.post("/merchant/edit", verify, updateEditMerchantShop); // api edit merchant shop

module.exports = {
  routes: router,
};
