"use strict";

const express = require("express");
const activityController = require("../controllers/activityController");
const router = express.Router();
const verify = require("../middleware/verifyToken");

const { getActivityShopsHit,
  getActivityShopsHitAuth,
  getActivityShopsNearby } = activityController;

router.get("/activity/shopsHit", getActivityShopsHit);
router.get("/activity/shopsHitAuth", verify, getActivityShopsHitAuth);
router.get("/activity/shopsNearby", getActivityShopsNearby);

module.exports = {
  routes: router,
};
