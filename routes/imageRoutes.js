"use strict";

const express = require("express");
const imageController = require("../controllers/imageController");
const router = express.Router();
const verify = require("../middleware/verifyToken");

const { uploadImages,
  deleteImage
} = imageController;

router.post("/image/upload", verify, uploadImages);
router.delete("/image/deleteImage/:imageId", verify , deleteImage);

module.exports = {
  routes: router,
};
