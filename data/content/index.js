"use strict";

const utils = require("../utils");
const config = require("../../config");
const sql = require("mssql");


const getAllContent = async (pageNumber, rowsOfPage) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("content");
    const data = await pool
      .request()
      .input("pageNumber", sql.Int, pageNumber)
      .input("rowsOfPage", sql.Int, rowsOfPage)
      .query(sqlQueries.getAllContent);
    return data.recordset;
  }
  catch (error) {
    throw error;
  }
};

const getAllTag = async (pageNumber, rowsOfPage, active = 1) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("content");
    const data = await pool
      .request()
      .input("active", sql.Bit, active == null ? 1 : Number(active))
      .input("pageNumber", sql.Int, pageNumber)
      .input("rowsOfPage", sql.Int, rowsOfPage)
      .query(sqlQueries.getAllTag);
    return data.recordset;
  }
  catch (error) {
    throw error;
  }
};

const getContentBySubCategory = async (pageNumber, rowsOfPage, subCatId) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("content");
    const data = await pool
      .request()
      .input("subCatId", sql.BigInt, subCatId)
      .input("pageNumber", sql.Int, pageNumber)
      .input("rowsOfPage", sql.Int, rowsOfPage)
      .query(sqlQueries.getContentBySubCategory);
    return data.recordset;
  }
  catch (error) {
    throw error;
  }
};


const getContentRelated = async (pageNumber = 1, rowsOfPage = 6, content_id) => {
  try {

    let content = await getContentByContentId(content_id);
    content = content[0];


    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("content");
    const data = await pool
      .request()
      .input("content_id", sql.BigInt, content.content_id)
      .input("subCatId", sql.BigInt, content.content_sub_category_id)
      .input("pageNumber", sql.Int, pageNumber)
      .input("rowsOfPage", sql.Int, rowsOfPage)
      .query(sqlQueries.getContentRelatedBySubCategory);
    return data.recordset;
  }
  catch (error) {
    throw error;
  }
};


const getContentPopular = async (pageNumber = 1, rowsOfPage = 6) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("content");
    const data = await pool
      .request()
      .input("pageNumber", sql.Int, pageNumber)
      .input("rowsOfPage", sql.Int, rowsOfPage)
      .query(sqlQueries.getAllContent);//getContentPopular ต้องแก้ไขเพิ่มเมื่อได้ logic bisuness
    return data.recordset;
  }
  catch (error) {
    throw error;
  }
};



const getContentByTagId = async (pageNumber, rowsOfPage, tagId) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("content");
    const data = await pool
      .request()
      .input("tag_id", sql.BigInt, tagId)
      .input("pageNumber", sql.Int, pageNumber)
      .input("rowsOfPage", sql.Int, rowsOfPage)
      .query(sqlQueries.getContentByTagId);
    return data.recordset;
  }
  catch (error) {
    throw error;
  }
};


const getContentByContentId = async (content_id) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("content");
    const data = await pool
      .request()
      .input("content_id", sql.BigInt, content_id)
      .query(sqlQueries.getContentByContentId);
    return data.recordset;
  }
  catch (error) {
    throw error;
  }
};

const getAllCategory = async () => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("content");
    const data = await pool
      .request()
      .query(sqlQueries.getAllCategory);
    return data.recordset;
  }
  catch (error) {
    throw error;
  }
};

const getSubCategoryByCategoryId = async (contentCategoryId) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("content");
    const data = await pool
      .request()
      .input("content_category_id", sql.BigInt, contentCategoryId)
      .query(sqlQueries.getSubCategoryByCategoryId);
    return data.recordset;
  }
  catch (error) {
    throw error;
  }
};

const createContent = async (dataContent) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("content");
    const data = await pool
      .request()
      .input("content_sub_category_id", sql.BigInt, dataContent.content_sub_category_id)
      .input("content_name", sql.NVarChar(500), dataContent.content_name)
      .input("content_detail", sql.NVarChar(sql.MAX), dataContent.content_detail)
      .input("images_id", sql.BigInt, dataContent.images_id)
      .input("short_desc", sql.NVarChar(sql.MAX), dataContent.short_desc)
      .input("short_quote", sql.NVarChar(sql.MAX), dataContent.short_quote)
      .input("show_writer_name", sql.Bit, dataContent.show_writer_name)
      .input("start_date", sql.DateTime, dataContent.start_date)
      .input("end_date", sql.DateTime, dataContent.end_date)
      .input("active", sql.Bit, dataContent.status == "draft" ? 0 : 1)
      .input("create_by", sql.BigInt, 44114)
      .input("update_by", sql.BigInt, 44114)
      .input("order_no", sql.BigInt, dataContent.order_no)
      .input("approve", sql.Bit, dataContent.status == "draft" ? 0 : 1)
      .input("images_id_desktop", sql.BigInt, dataContent.images_id_desktop)
      .input("sponsored", sql.Bit, dataContent.sponsored)
      .input("review_url", sql.NVarChar(200), dataContent.review_url)
      .input("status", sql.VarChar(10), dataContent.status)
      .input("review_shop_id", sql.BigInt, dataContent.review_url ? dataContent.review_url.match(/(\d+)/)[0] : null)
      .query(sqlQueries.createContent);

    if (dataContent.tag_id && dataContent.tag_id.length != 0) {
      for (const element of dataContent.tag_id) {
        await pool
          .request()
          .input("ref_id", sql.BigInt, data.recordset[0].contentId)
          .input("ref_type", sql.VarChar(25), 'CONTENT')
          .input("tag_id", sql.BigInt, element)
          .query(sqlQueries.createBindTag);
      }
    }
    return data.recordset;
  }
  catch (error) {
    throw error;
  }
};

const getListCategories = async (pageNumber, rowsOfPage) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("content");
    const data = await pool
      .request()
      .input("pageNumber", sql.Int, pageNumber)
      .input("rowsOfPage", sql.Int, rowsOfPage)
      .query(sqlQueries.getListCategories);
    return data.recordset;
  }
  catch (error) {
    throw error;
  }
};

const getListContent = async (pageNumber, rowsOfPage, status) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("content");
    if (!status) {
      const data = await pool
        .request()
        .input("pageNumber", sql.Int, pageNumber)
        .input("rowsOfPage", sql.Int, rowsOfPage)
        .query(sqlQueries.getListContent);
      return data.recordset;
    }
    else {
      const data = await pool
        .request()
        .input("pageNumber", sql.Int, pageNumber)
        .input("rowsOfPage", sql.Int, rowsOfPage)
        .input("status", sql.VarChar(10), status)
        .query(sqlQueries.getListContentByStatus);
      return data.recordset;
    }
  }
  catch (error) {
    throw error;
  }
};

const getTagByContentId = async (content_id) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("content");
    const data = await pool
      .request()
      .input("content_id", sql.BigInt, content_id)
      .query(sqlQueries.getTagByContentId);
    return data.recordset;
  }
  catch (error) {
    throw error;
  }
};

const getContentByContentIdAll = async (content_id) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("content");
    const data = await pool
      .request()
      .input("content_id", sql.BigInt, content_id)
      .query(sqlQueries.getContentByContentIdAll);
    return data.recordset[0];
  }
  catch (error) {
    throw error;
  }
};

const getCountContent = async (status) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("content");
    if (!status) {
      const data = await pool
        .request()
        .query(sqlQueries.getCountContent);
      return data.recordset[0].total;
    }
    else {
      const data = await pool
        .request()
        .input("status", sql.VarChar(10), status)
        .query(sqlQueries.getCountContentByStatus);
      return data.recordset[0].total;
    }
  }
  catch (error) {
    throw error;
  }
};

const viewContent = async (content_id) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("content");
    const data = await pool
      .request()
      .input("content_id", sql.BigInt, content_id)
      .query(sqlQueries.viewContent);
    return data.recordset[0];
  }
  catch (error) {
    throw error;
  }
};

const createContentHistory = async (contentId, update_by) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("content");
    const data = await pool
      .request()
      .input("content_id", sql.BigInt, contentId)
      .input("history_create_by", sql.BigInt, update_by)
      .query(sqlQueries.createContentHistory);
    return data.recordset;
  }
  catch (error) {
    throw error;
  }
};

const editContent = async (contentId, dataContent) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("content");
    const data = await pool
      .request()
      .input("content_sub_category_id", sql.BigInt, dataContent.content_sub_category_id)
      .input("content_name", sql.NVarChar(500), dataContent.content_name)
      .input("content_detail", sql.NVarChar(sql.MAX), dataContent.content_detail)
      .input("images_id", sql.BigInt, dataContent.images_id)
      .input("short_desc", sql.NVarChar(sql.MAX), dataContent.short_desc)
      .input("short_quote", sql.NVarChar(sql.MAX), dataContent.short_quote)
      .input("start_date", sql.DateTime, dataContent.start_date)
      .input("end_date", sql.DateTime, dataContent.end_date)
      .input("active", sql.Bit, dataContent.currentStatus == "draft" ? 0 : 1)
      .input("update_by", sql.BigInt, dataContent.update_by)
      .input("approve", sql.Bit, dataContent.currentStatus == "draft" ? 0 : 1)
      .input("images_id_desktop", sql.BigInt, dataContent.images_id_desktop)
      .input("sponsored", sql.Bit, dataContent.sponsored)
      .input("review_url", sql.NVarChar(200), dataContent.review_url)
      .input("status", sql.VarChar(10), dataContent.currentStatus)
      .input("review_shop_id", sql.BigInt, dataContent.review_url ? dataContent.review_url.match(/(\d+)/)[0] : null)
      .input("content_id", sql.BigInt, contentId)
      .query(sqlQueries.editContent);

    await pool
      .request()
      .input("ref_id", sql.BigInt, contentId)
      .input("ref_type", sql.VarChar(25), 'CONTENT')
      .query(sqlQueries.deleteBindTag);

    if (dataContent.tag_id && dataContent.tag_id.length != 0) {
      for (const element of dataContent.tag_id) {
        await pool
          .request()
          .input("ref_id", sql.BigInt, contentId)
          .input("ref_type", sql.VarChar(25), 'CONTENT')
          .input("tag_id", sql.BigInt, element)
          .query(sqlQueries.createBindTag);
      }
    }

    return data.recordset[0];
  }
  catch (error) {
    throw error;
  }
};




const getContentHotConfig = async (pageNumber, rowsOfPage, content_hot_type) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("content");
    const data = await pool
      .request()
      .input("pageNumber", sql.Int, pageNumber)
      .input("rowsOfPage", sql.Int, rowsOfPage)
      .input("content_hot_type", sql.VarChar, content_hot_type)
      .query(sqlQueries.getContentHotConfig);
    return data.recordset;
  }
  catch (error) {
    throw error;
  }
};


const getContentCarouselBanner = async (pageNumber, rowsOfPage) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("content");
    const data = await pool
      .request()
      .input("pageNumber", sql.Int, pageNumber)
      .input("rowsOfPage", sql.Int, rowsOfPage)
      .query(sqlQueries.getContentCarouselBanner);
    return data.recordset;
  }
  catch (error) {
    throw error;
  }
};

const getContentSugessionConfig = async (pageNumber, rowsOfPage) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("content");
    const data = await pool
      .request()
      .input("pageNumber", sql.Int, pageNumber)
      .input("rowsOfPage", sql.Int, rowsOfPage)
      .query(sqlQueries.getContentSugessionConfig);
    return data.recordset;
  }
  catch (error) {
    throw error;
  }
};

const getContentLastUpdate = async (pageNumber, rowsOfPage) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("content");
    const data = await pool
      .request()
      .input("pageNumber", sql.Int, pageNumber)
      .input("rowsOfPage", sql.Int, rowsOfPage)
      .query(sqlQueries.getContentLastUpdate);
    return data.recordset;
  }
  catch (error) {
    throw error;
  }
};

const getADSbannerConfig = async (pageNumber, rowsOfPage) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("content");
    const data = await pool
      .request()
      .input("pageNumber", sql.Int, pageNumber)
      .input("rowsOfPage", sql.Int, rowsOfPage)
      .query(sqlQueries.getADSbannerConfig);
    return data.recordset;
  }
  catch (error) {
    throw error;
  }
};

const getBannerInpageByConfigName = async (config_name) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("content");
    const data = await pool
      .request()
      .input("config_name", sql.VarChar, config_name)
      .query(sqlQueries.getBannerInpageByConfigName);
    return data.recordset;
  }
  catch (error) {
    throw error;
  }
};

const getPartnership = async (pageNumber, rowsOfPage) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("content");
    const data = await pool
      .request()
      .input("pageNumber", sql.Int, pageNumber)
      .input("rowsOfPage", sql.Int, rowsOfPage)
      .query(sqlQueries.getPartnership);
    return data.recordset;
  }
  catch (error) {
    throw error;
  }
};

const getTripSugessionConfig = async (pageNumber, rowsOfPage) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("content");
    const data = await pool
      .request()
      .input("pageNumber", sql.Int, pageNumber)
      .input("rowsOfPage", sql.Int, rowsOfPage)
      .query(sqlQueries.getTripSugessionConfig);
    return data.recordset;
  }
  catch (error) {
    throw error;
  }
};

const getContentCarouselBannerCms = async (pageNumber, rowsOfPage) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("content");
    const data = await pool
      .request()
      .input("pageNumber", sql.Int, pageNumber)
      .input("rowsOfPage", sql.Int, rowsOfPage)
      .query(sqlQueries.getContentCarouselBannerCms);
    return data.recordset;
  }
  catch (error) {
    throw error;
  }
};

const getSugessionContentCms = async (pageNumber, rowsOfPage) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("content");
    const data = await pool
      .request()
      .input("pageNumber", sql.Int, pageNumber)
      .input("rowsOfPage", sql.Int, rowsOfPage)
      .query(sqlQueries.getSugessionContentCms);
    return data.recordset;
  }
  catch (error) {
    throw error;
  }
};

const getAdsBannerCms = async (pageNumber, rowsOfPage) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("content");
    const data = await pool
      .request()
      .input("pageNumber", sql.Int, pageNumber)
      .input("rowsOfPage", sql.Int, rowsOfPage)
      .query(sqlQueries.getAdsBannerCms);
    return data.recordset;
  }
  catch (error) {
    throw error;
  }
};

const getImageAndTitleByContentId = async (contentId) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("content");
    const data = await pool
      .request()
      .input("content_id", sql.BigInt, contentId)
      .query(sqlQueries.getImageAndTitleByContentId);
    return data.recordset[0];
  }
  catch (error) {
    throw error;
  }
};

const saveContentCarouselBanner = async (data) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("content");
    const result = await pool
      .request()
      .input("title", sql.NVarChar(500), data.title)
      .input("content_url", sql.NVarChar(500), data.content_url)
      .input("content_id", sql.BigInt, data.content_id)
      .input("order_no", sql.Int, data.order_no)
      .input("active", sql.Bit, 1)
      .input("create_by", sql.BigInt, data.create_by)
      .input("update_by", sql.BigInt, data.update_by)
      .query(sqlQueries.saveContentCarouselBanner);
    return result.recordset[0];
  }
  catch (error) {
    throw error;
  }
};

const saveContentSugession = async (data) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("content");
    const result = await pool
      .request()
      .input("title", sql.NVarChar(500), data.title)
      .input("content_url", sql.NVarChar(500), data.content_url)
      .input("content_id", sql.BigInt, data.content_id)
      .input("order_no", sql.Int, data.order_no)
      .input("active", sql.Bit, 1)
      .input("create_by", sql.BigInt, data.create_by)
      .input("update_by", sql.BigInt, data.update_by)
      .query(sqlQueries.saveContentSugession);
    return result.recordset[0];
  }
  catch (error) {
    throw error;
  }
};

const saveContentAdsBanner = async (data) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("content");
    const result = await pool
      .request()
      .input("image_id", sql.BigInt, data.image_id)
      .input("image_id_desktop", sql.BigInt, data.image_id_desktop)
      .input("url", sql.NVarChar(500), data.url)
      .input("order_no", sql.Int, data.order_no)
      .input("active", sql.Bit, 1)
      .input("create_by", sql.BigInt, data.create_by)
      .input("update_by", sql.BigInt, data.update_by)
      .query(sqlQueries.saveContentAdsBanner);
    return result.recordset[0];
  }
  catch (error) {
    throw error;
  }
};

const getShopById = async (shopId, userId, lat, lng,) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("content");
    const oneShop = await pool
      .request()
      .input("lat", sql.Decimal(10, 8), lat)
      .input("lng", sql.Decimal(11, 8), lng)
      .input("shop_id", sql.BigInt, shopId)
      .input("user_id", sql.BigInt, userId)
      .query(sqlQueries.shopById);
    return oneShop.recordset;
  } catch (error) {
    throw error;
  }
};

const searchCategories = async (pageNumber, rowsOfPage, text) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("content");
    const result = await pool
      .request()
      .input("text", sql.NVarChar, text)
      .input("pageNumber", sql.Int, pageNumber)
      .input("rowsOfPage", sql.Int, rowsOfPage)
      .query(sqlQueries.searchCategories);
    return { total: result.recordsets[0][0].total, list: result.recordsets[1] };
  } catch (error) {
    throw error;
  }
  
};

const searchSubCategories = async (pageNumber, rowsOfPage, text) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("content");
    const result = await pool
      .request()
      .input("text", sql.NVarChar, text)
      .input("pageNumber", sql.Int, pageNumber)
      .input("rowsOfPage", sql.Int, rowsOfPage)
      .query(sqlQueries.searchSubCategories);
    return { total: result.recordsets[0][0].total, list: result.recordsets[1] };
  } catch (error) {
    throw error;
  }
};

const addCategories = async (categories) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("content");
    const result = await pool
      .request()
      .input("content_section_id", sql.BigInt, 1)
      .input("category_name", sql.NVarChar(500), categories.category_name)
      .input("category_desc", sql.NVarChar(1000), categories.category_desc)
      .input("active", sql.Bit, 1)
      .input("create_by", sql.BigInt, categories.create_by)
      .input("update_by", sql.BigInt, categories.update_by)
      .input("order_no", sql.Int, 1)
      .query(sqlQueries.addCategories);
    return result.recordset[0];
  } catch (error) {
    throw error;
  }
};

const addSubCategories = async (subCategories) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("content");
    const result = await pool
      .request()
      .input("content_category_id", sql.BigInt, null)
      .input("sub_category_name", sql.NVarChar(500), subCategories.sub_category_name)
      .input("sub_category_desc", sql.NVarChar(1000), subCategories.sub_category_desc)
      .input("active", sql.Bit, 1)
      .input("create_by", sql.BigInt, subCategories.create_by)
      .input("update_by", sql.BigInt, subCategories.update_by)
      .input("order_no", sql.Int, 1)
      .query(sqlQueries.addSubCategories);
    return result.recordset[0];
  } catch (error) {
    throw error;
  }
};

const assignSubCategories = async (subCategoriesId, categoriesId) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("content");
    const result = await pool
      .request()
      .input("content_category_id", sql.BigInt, categoriesId)
      .input("content_sub_category_id", sql.BigInt, subCategoriesId)
      .query(sqlQueries.assignSubCategories);
    return result.recordset[0];
  } catch (error) {
    throw error;
  }
};

const getAllSubCategories = async (active) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("content");
    const result = await pool
      .request()
      .input("active", sql.Bit, active == 1 || active == 0 ? Number(active) : 1)
      .query(sqlQueries.getAllSubCategories);
    return result.recordset;
  } catch (error) {
    throw error;
  }
};

const editSubCategory = async (subCategoryId, categoryName) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("content");
    const result = await pool
      .request()
      .input("content_sub_category_id", sql.BigInt, subCategoryId)
      .input("sub_category_name", sql.NVarChar(500), categoryName)
      .query(sqlQueries.editSubCategory);
    return result.recordset;
  } catch (error) {
    throw error;
  }
}

const editCategory = async (categoryId, categoryName) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("content");
    const result = await pool
      .request()
      .input("content_category_id", sql.BigInt, categoryId)
      .input("category_name", sql.NVarChar(500), categoryName)
      .query(sqlQueries.editCategory);
    return result.recordset;
  } catch (error) {
    throw error;
  }
  
}

const getSelectSubCategory = async () => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("content");
    const data = await pool
      .request()
      .query(sqlQueries.getSelectSubCategories);
    return data.recordset;
  }
  catch (error) {
    throw error;
  }

};

const getCategoryById = async (categoryId) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("content");
    const data = await pool
      .request()
      .input("content_category_id", sql.BigInt, categoryId)
      .query(sqlQueries.getCategoryById);
    return data.recordset;
  } catch (error) {
    throw error;
  }
};

const deleteCategory = async (categoryId) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("content");
    const result = await pool
      .request()
      .input("content_category_id", sql.BigInt, categoryId)
      .query(sqlQueries.deleteCategory);
    return result.recordset;
  } catch (error) {
    throw error;
  }
}

const deleteSubCategory = async (subCategoryId) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("content");
    const result = await pool
      .request()
      .input("content_sub_category_id", sql.BigInt, subCategoryId)
      .query(sqlQueries.deleteSubCategory);
    return result.recordset;
  } catch (error) {
    throw error;
  }
}

const deleteContent = async (subCategoryId) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("content");
    console.log("subCategoryId " + subCategoryId);
    const result = await pool
      .request()
      .input("content_sub_category_id", sql.BigInt, subCategoryId)
      .query(sqlQueries.deleteContentBySubCategory);
    return result.recordset;
  } catch (error) {
    throw error;
  }
}
//test

module.exports = {
  getAllContent,
  getContentBySubCategory,
  getContentByContentId,
  getContentByTagId,
  getContentRelated,
  getContentPopular,
  getAllTag,
  getAllCategory,
  getSubCategoryByCategoryId,
  createContent,
  getListCategories,
  getListContent,
  getTagByContentId,
  getContentByContentIdAll,
  getCountContent,
  viewContent,
  createContentHistory,
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
  getShopById,
  searchCategories,
  searchSubCategories,
  addCategories,
  addSubCategories,
  assignSubCategories,
  getAllSubCategories,
  getCategoryById,
  deleteSubCategory,
  deleteCategory,
  deleteContent
};
