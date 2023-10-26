"use strict";

const utils = require("../utils");
const config = require("../../config");
const sql = require("mssql");

const createPatoisImages = async (imagesData) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("image");
    const insertWongnokImages = await pool
      .request()
      .input("fileName", sql.VarChar(sql.MAX), imagesData.fileName)
      .input("fileExtensions", sql.VarChar(sql.MAX), imagesData.fileExtensions)
      .input("description", sql.VarChar(sql.MAX), imagesData.description)
      .input("tag_id", sql.BigInt, 0)
      .input("img_alt", sql.NVarChar(500), imagesData.imgAlt)
      .query(sqlQueries.createPatoisImages);
    return insertWongnokImages.recordset[0].imagesId;
  } catch (error) {
    throw error;
  }
};

const createPatoisImagesThumbnailContent = async (fileName_thumbnail, description_thumbnail, fileExtensions, patois_images_id, imgAlt) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("image");
    const insertWongnokImages = await pool
      .request()
      .input("fileName", sql.VarChar(sql.MAX), fileName_thumbnail)
      .input("fileExtensions", sql.VarChar(sql.MAX), fileExtensions)
      .input("description", sql.VarChar(sql.MAX), description_thumbnail)
      .input("tag_id", sql.BigInt, 0)
      .input("patois_images_id", sql.BigInt, patois_images_id)
      .input("img_alt", sql.NVarChar(500), imgAlt)
      .query(sqlQueries.createPatoisImagesThumbnailContent);
    return insertWongnokImages.recordset[0].thumbnailId;
  } catch (error) {
    throw error;
  }
};

const createPatoisImagesThumbnail = async (fileName_thumbnail, description_thumbnail, fileExtensions, patois_images_id) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("image");
    const insertWongnokImages = await pool
      .request()
      .input("fileName", sql.VarChar(sql.MAX), fileName_thumbnail)
      .input("fileExtensions", sql.VarChar(sql.MAX), fileExtensions)
      .input("description", sql.VarChar(sql.MAX), description_thumbnail)
      .input("tag_id", sql.BigInt, 0)
      .input("patois_images_id", sql.BigInt, patois_images_id)
      .query(sqlQueries.createPatoisImagesThumbnail);
    return insertWongnokImages.recordset[0].thumbnailId;
  } catch (error) {
    throw error;
  }
};

const createPatoisImageHash = async (imagesData) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("image");
    const insertWongnokImages = await pool
      .request()
      .input("imageHashVal", sql.NVarChar(sql.MAX), imagesData.imageHashVal)
      .input("status", sql.NVarChar(sql.MAX), imagesData.status)
      .input("imageId", sql.BigInt, imagesData.imageId)
      .input("error_massage", sql.NVarChar(sql.MAX), imagesData.error_massage)
      .input("fileName", sql.NVarChar(sql.MAX), imagesData.fileName)
      .input("active", sql.NVarChar(sql.MAX), imagesData.active)
      .input("verification_status_code", sql.NVarChar(sql.MAX), imagesData.verification_status_code)
      .input("userId", sql.BigInt, imagesData.userId)
      .query(sqlQueries.createPatoisImageHash);
    return insertWongnokImages.recordset[0].imageHashId;
  } catch (error) {
    throw error;
  }
};

const checkIsDupImageByHash = async (imageHashVal) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("image");
    const data = await pool
      .request()
      .input("imageHashVal", sql.NVarChar(sql.MAX), imageHashVal)
      .query(sqlQueries.checkIsDupImageByHash);
    return data.recordset && data.recordset.length != 0 ? data.recordset[0].image_hash_id : null;
  } catch (error) {
    throw error;
  }
};

const checkIsDupImageHash = async (fileName) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("image");
    const data = await pool
      .request()
      .input("fileName", sql.NVarChar(sql.MAX), fileName)
      .query(sqlQueries.checkIsDupImageHash);
    return data.recordset && data.recordset.length != 0 ? data.recordset[0].image_hash_id : null;
  } catch (error) {
    throw error;
  }
};

const deleteImage = async (imageId) => {
  try {
    let pool = await sql.connect(config.sql);
    const sqlQueries = await utils.loadSqlQueryies("image");
    const data = await pool
      .request()
      .input("imagesId", sql.BigInt, imageId)
      .query(sqlQueries.deleteImage);
    return true;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  checkIsDupImageByHash,
  createPatoisImages,
  createPatoisImagesThumbnail,
  createPatoisImageHash,
  checkIsDupImageHash,
  createPatoisImagesThumbnailContent,
  deleteImage,
};
