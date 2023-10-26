"use strict";

const express = require("express");
const contentController = require("../controllers/contentController");
const router = express.Router();
const verify = require("../middleware/verifyToken");
const verifySignature = require("../middleware/verifySignature");

const { getAllContent,
  getContentBySubCategory,
  getContentByContentId,
  getContentByTagId,
  getContentRelated,
  getContentPopular,
  getAllTag,
  getAllCategory,
  getSubCategoryByCategoryId,
  createContent,
  createImageContent,
  getListCategories,
  getListContent,
  getContentByContentIdAll,
  viewContent,
  editContent,
  editSubCategory,
  editCategory,
  getContentHotConfig,
  getContentCarouselBanner,
  getContentSugessionConfig,
  getContentLastUpdate,
  getADSbannerConfig,
  getBannerInpageByConfigName,
  getPartnership,
  getTripSugessionConfig,
  getContentCarouselBannerCms,
  getSugessionContentCms,
  getAdsBannerCms,
  getImageAndTitleByContentId,
  getSelectSubCategory,
  saveContentCarouselBanner,
  saveContentSugession,
  saveContentAdsBanner,
  searchCategories,
  searchSubCategories,
  addCategories,
  addSubCategories,
  assignSubCategories,
  getAllSubCategories,
  getCategoryById,
  deleteCategory,
  deleteSubCategory,
} = contentController;

router.get("/content/getAllContent", getAllContent);
router.get("/content/getContentBySubCategory", getContentBySubCategory);
router.get("/content/getContentByContentId", getContentByContentId);
router.get("/content/getContentByTagId", getContentByTagId);
router.get("/content/getContentRelated", getContentRelated);
router.get("/content/getContentPopular", getContentPopular);
router.get("/content/getAllTag", getAllTag);

router.get("/content/getContentHotConfig", getContentHotConfig);
router.get("/content/getContentCarouselBanner", getContentCarouselBanner);
router.get("/content/getContentSugessionConfig", getContentSugessionConfig);
router.get("/content/getContentLastUpdate", getContentLastUpdate);
router.get("/content/getADSbannerConfig", getADSbannerConfig);
router.get("/content/getBannerInpageByConfigName", getBannerInpageByConfigName);
router.get("/content/getPartnership", getPartnership);
router.get("/content/getTripSugessionConfig", getTripSugessionConfig);



// content management (cms)
router.get("/content/getAllCategory", getAllCategory);
router.get("/content/getContentByContentIdAll", getContentByContentIdAll);
router.get("/content/getSubCategoryByCategoryId", getSubCategoryByCategoryId);
router.get("/content/list/content", getListContent);
router.post("/content/upload/image", createImageContent);
router.post("/content/createContent", createContent)
router.get("/content/view/content", viewContent);
router.put("/content/edit/content/:id", editContent);


// config contents (cms)
router.get("/content/cms/getContentCarouselBannerCms", getContentCarouselBannerCms);
router.get("/content/cms/getSugessionContentCms", getSugessionContentCms);
router.get("/content/cms/getAdsBannerCms", getAdsBannerCms);
router.get("/content/cms/getImageAndTitleByContentId", getImageAndTitleByContentId);
router.put("/content/cms/saveContentCarouselBanner", saveContentCarouselBanner);
router.put("/content/cms/saveContentSugession", saveContentSugession);
router.put("/content/cms/saveContentAdsBanner", saveContentAdsBanner);

// categories and sub_categories (cms)
router.get("/content/list/categories", getListCategories);

router.get("/categories/cms/searchCategories", searchCategories);
router.post("/categories/cms/addCategories", addCategories);
router.put("/categories/cms/editCategory/:id", editCategory);
router.get("/categories/cms/getCategoryById/:id", getCategoryById);
router.put("/categories/cms/deleteCategory", deleteCategory);

router.get("/subCategories/cms/getAllSubCategories", getAllSubCategories);
router.get("/subCategories/cms/searchSubCategories", searchSubCategories);
router.post("/subCategories/cms/addSubCategories", addSubCategories);
router.put("/subCategories/cms/assignSubCategories/:id", assignSubCategories);
router.put("/subCategories/cms/deleteSubCategory", deleteSubCategory);

router.put("/subCategories/cms/editSubCategory/:id", editSubCategory);
router.get("/subCategories/cms/getSelectSubCategory", getSelectSubCategory);

module.exports = {
  routes: router,
};
