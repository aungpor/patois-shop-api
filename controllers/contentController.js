"use strict";


const contentData = require("../data/content");
const utils = require("../data/utils");
const axios = require('axios');
const errorLogData = require("../data/errorLog");
const configData = require("../data/config");
const userData = require("../data/user");

const formidable = require("formidable");
const imageData = require("../data/image");
const { BlobServiceClient, BlobSASPermissions } = require("@azure/storage-blob");
const { v4: uuidv4 } = require("uuid");
const config = require("../config");
const fs = require("fs");
const sharp = require('sharp');
const imageHashUtil = require("../data/imageHashUtil");
const supportData = require("../data/support");
const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "OPTIONS, POST, GET",
  "Access-Control-Max-Age": 2592000, // 30 days
  /** add other headers as per requirement */
};




const getAllContent = async (req, res, next) => {
  const mappingKey = utils.mappingRequestResponse();
  try {
    utils.logger.info(await utils.requestMsg(req, mappingKey));
    const { pageNumber, rowsOfPage } = req.query;
    const content = await contentData.getAllContent(pageNumber, rowsOfPage);
    utils.logger.info(utils.responseMsg(res, content, req, mappingKey));
    res.send({ ResponseCode: 200, ResponseMsg: "success", data: content });
  } catch (error) {
    let e_ = utils.errorMsg(error, mappingKey);
    utils.logger.error(utils.responseMsg(res, e_, req, mappingKey));
    res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
  }
};

const getAllTag = async (req, res, next) => {
  const mappingKey = utils.mappingRequestResponse();
  try {
    utils.logger.info(await utils.requestMsg(req, mappingKey));
    const { pageNumber, rowsOfPage, active } = req.query;
    const tag = await contentData.getAllTag(pageNumber, rowsOfPage, active);
    utils.logger.info(utils.responseMsg(res, tag, req, mappingKey));
    res.send({ ResponseCode: 200, ResponseMsg: "success", data: tag });
  } catch (error) {
    let e_ = utils.errorMsg(error, mappingKey);
    utils.logger.error(utils.responseMsg(res, e_, req, mappingKey));
    res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
  }
};



const getContentBySubCategory = async (req, res, next) => {
  const mappingKey = utils.mappingRequestResponse();
  try {
    utils.logger.info(await utils.requestMsg(req, mappingKey));
    const { pageNumber, rowsOfPage, subCatId } = req.query;
    const content = await contentData.getContentBySubCategory(pageNumber, rowsOfPage, subCatId);
    utils.logger.info(utils.responseMsg(res, content, req, mappingKey));
    res.send({ ResponseCode: 200, ResponseMsg: "success", data: content });
  } catch (error) {
    let e_ = utils.errorMsg(error, mappingKey);
    utils.logger.error(utils.responseMsg(res, e_, req, mappingKey));
    res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
  }
};

const getContentRelated = async (req, res, next) => {
  const mappingKey = utils.mappingRequestResponse();
  try {
    utils.logger.info(await utils.requestMsg(req, mappingKey));
    const { pageNumber, rowsOfPage, content_id } = req.query;
    const content = await contentData.getContentRelated(pageNumber, rowsOfPage, content_id);
    utils.logger.info(utils.responseMsg(res, content, req, mappingKey));
    res.send({ ResponseCode: 200, ResponseMsg: "success", data: content });
  } catch (error) {
    let e_ = utils.errorMsg(error, mappingKey);
    utils.logger.error(utils.responseMsg(res, e_, req, mappingKey));
    res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
  }
};

const getContentPopular = async (req, res, next) => {
  const mappingKey = utils.mappingRequestResponse();
  try {
    utils.logger.info(await utils.requestMsg(req, mappingKey));
    const { pageNumber, rowsOfPage, subCatId } = req.query;
    const content = await contentData.getContentPopular(pageNumber, rowsOfPage);
    utils.logger.info(utils.responseMsg(res, content, req, mappingKey));
    res.send({ ResponseCode: 200, ResponseMsg: "success", data: content });
  } catch (error) {
    let e_ = utils.errorMsg(error, mappingKey);
    utils.logger.error(utils.responseMsg(res, e_, req, mappingKey));
    res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
  }
};


const getContentByTagId = async (req, res, next) => {
  const mappingKey = utils.mappingRequestResponse();
  try {
    utils.logger.info(await utils.requestMsg(req, mappingKey));
    const { pageNumber, rowsOfPage, tagId } = req.query;
    const content = await contentData.getContentByTagId(pageNumber, rowsOfPage, tagId);
    utils.logger.info(utils.responseMsg(res, content, req, mappingKey));
    res.send({ ResponseCode: 200, ResponseMsg: "success", data: content });
  } catch (error) {
    let e_ = utils.errorMsg(error, mappingKey);
    utils.logger.error(utils.responseMsg(res, e_, req, mappingKey));
    res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
  }
};


const getContentByContentId = async (req, res, next) => {
  const mappingKey = utils.mappingRequestResponse();
  try {
    utils.logger.info(await utils.requestMsg(req, mappingKey));
    //const { pageNumber, rowsOfPage, content_id } = req.query;
    const { pageNumber, rowsOfPage, content_id, lat, lng, } = req.query;
    const content = await contentData.getContentByContentId(content_id);

    /** ดึงร้าที่จะแสดงใน Content ด้วย */

    const usered = await utils.getUser(req.headers.token);
    let userId = usered && usered.userId ? usered.userId : "";
    if (content && content.length != 0 && content[0].review_shop_id) {
      content[0].shop_review_list = null;
      let ShopReviewData = await contentData.getShopById(content[0].review_shop_id, userId, lat, lng,);
      if (ShopReviewData && ShopReviewData.length != 0) {
        content[0].shop_review_list = ShopReviewData;
      }
    }


    utils.logger.info(utils.responseMsg(res, content, req, mappingKey));
    res.send({ ResponseCode: 200, ResponseMsg: "success", data: content });
  } catch (error) {
    let e_ = utils.errorMsg(error, mappingKey);
    utils.logger.error(utils.responseMsg(res, e_, req, mappingKey));
    res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
  }
};

const getAllCategory = async (req, res, next) => {
  const mappingKey = utils.mappingRequestResponse();
  try {
    utils.logger.info(await utils.requestMsg(req, mappingKey));
    const category = await contentData.getAllCategory();
    utils.logger.info(utils.responseMsg(res, category, req, mappingKey));
    res.send({ ResponseCode: 200, ResponseMsg: "success", data: category });
  } catch (error) {
    let e_ = utils.errorMsg(error, mappingKey);
    utils.logger.error(utils.responseMsg(res, e_, req, mappingKey));
    res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
  }
};

const getSubCategoryByCategoryId = async (req, res, next) => {
  const mappingKey = utils.mappingRequestResponse();
  try {
    utils.logger.info(await utils.requestMsg(req, mappingKey));
    const { contentCategoryId } = req.query
    const subCategory = await contentData.getSubCategoryByCategoryId(contentCategoryId);
    utils.logger.info(utils.responseMsg(res, subCategory, req, mappingKey));
    res.send({ ResponseCode: 200, ResponseMsg: "success", data: subCategory });
  } catch (error) {
    let e_ = utils.errorMsg(error, mappingKey);
    utils.logger.error(utils.responseMsg(res, e_, req, mappingKey));
    res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
  }
};

const createContent = async (req, res, next) => {
  const mappingKey = utils.mappingRequestResponse();
  try {
    utils.logger.info(await utils.requestMsg(req, mappingKey));
    const dataContent = req.body
    const contentId = await contentData.createContent(dataContent);
    utils.logger.info(utils.responseMsg(res, contentId, req, mappingKey));
    res.send({ ResponseCode: 200, ResponseMsg: "success", data: contentId });

  } catch (error) {
    let e_ = utils.errorMsg(error, mappingKey);
    utils.logger.error(utils.responseMsg(res, e_, req, mappingKey));
    res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
  }
};

const createImageContent = async (req, res, next) => {
  const mappingKey = utils.mappingRequestResponse();
  try {
    utils.logger.info(await utils.requestMsg(req, mappingKey));
    const form = new formidable.IncomingForm({ multiples: true });
    form.uploadDir = "./wongnok_/wn";
    form.keepExtensions = true;
    form.parse(req, async (err, fields, files) => {
      if (err) {
        let e_ = utils.errorMsg(err, mappingKey);
        utils.logger.error(utils.responseMsg(res, e_, req, mappingKey));
        res.writeHead(400, headers);
        res.write(JSON.stringify({ ResponseCode: 400, ResponseMsg: err.message, data: null }));
        return res.end();
      }
      //Upload to Azure blob storeage
      const file = files["files[]"];
      const alt = fields.alt ? fields.alt.split(',') : null

      if (file.length > 1) {
        for (const e of file) {
          const lastIndex = e.name.lastIndexOf(".");
          const after = e.name.slice(lastIndex + 1);
          if (after != "png" && after != "jpg" && after != "jpeg") {
            res.send({ ResponseCode: 400, ResponseMsg: "File Format Not supported" });
          }
        }
      }
      else {
        const lastIndex = file.name.lastIndexOf(".");
        const after = file.name.slice(lastIndex + 1);
        if (after != "png" && after != "jpg" && after != "jpeg") {
          res.send({ ResponseCode: 400, ResponseMsg: "File Format Not supported" });
        }
      }

      let fileNames = [];
      let fileExtensions = [];
      let descriptions = [];
      let imgAlt = [];

      let fileName_thumbnail = [];
      let fileExtension_thumbnail = [];
      let description_thumbnail = [];
      let img_alt_thumbnail = [];

      const currentDate = new Date().getDate();
      let blobServiceClient = null
      if (currentDate >= 1 && currentDate <= 6) {
        blobServiceClient = await BlobServiceClient.fromConnectionString(config.AZURE_STORAGE_CONNECTION_STRING_NEW_STORAGE1);
      }
      else if (currentDate >= 7 && currentDate <= 12) {
        blobServiceClient = await BlobServiceClient.fromConnectionString(config.AZURE_STORAGE_CONNECTION_STRING_NEW_STORAGE2);
      }
      else if (currentDate >= 13 && currentDate <= 18) {
        blobServiceClient = await BlobServiceClient.fromConnectionString(config.AZURE_STORAGE_CONNECTION_STRING_NEW_STORAGE3);
      }
      else if (currentDate >= 19 && currentDate <= 24) {
        blobServiceClient = await BlobServiceClient.fromConnectionString(config.AZURE_STORAGE_CONNECTION_STRING_NEW_STORAGE4);
      }
      else if (currentDate >= 25 && currentDate <= 31) {
        blobServiceClient = await BlobServiceClient.fromConnectionString(config.AZURE_STORAGE_CONNECTION_STRING_NEW_STORAGE5);
      }
      const containerName = blobServiceClient.getContainerClient(config.AZURE_STORAGE_CONTAINER_NEW);
      const containerClient = await blobServiceClient.getContainerClient(containerName.containerName);
      await containerClient.createIfNotExists();

      if (file.length > 1) {
        await Promise.all(
          file.map(async (f, index) => {
            const nowLocal = new Date().toLocaleString('en-US', { timeZone: 'Asia/Bangkok', hour12: false }).split(", ");
            const date = nowLocal[0].split("/");
            const time = nowLocal[1].split(":");
            const day = date[2] + "-" + ("0" + (date[0])).slice(-2) + "-" + ("0" + date[1]).slice(-2) + "_" + ("0" + time[0]).slice(-2) + "_" + ("0" + time[1]).slice(-2) + "_" + ("0" + time[2]).slice(-2);
            const manageImage = [{ sizeImage: 960, type: "image" }, { sizeImage: 500, type: "thumbnail" }]
            const rFileName = `wongnok_/rwn/${f.path.replace('wongnok_/wn/', '').replace('wongnok_\\wn\\', '')}`;
            const filePath = f.path; //This is where you get the file path.

            for (var i = 0; i < manageImage.length; i++) {
              await sharp(f.path, { failOnError: false })
                .resize(manageImage[i].sizeImage) ///Hight auto scaled
                .withMetadata()
                .toFile(rFileName)
                .then(async data => {
                  const fileName = "PATOIS_" + day + "_" + uuidv4() + "." + f.name.substring(f.name.lastIndexOf(".") + 1, f.name.length);
                  const blobName = `${manageImage[i].type}/${date[2]}/${("0" + (date[0])).slice(-2)}/${("0" + date[1]).slice(-2)}/${fileName}`;
                  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
                  const uploadBlobResponse = await blockBlobClient.uploadFile(rFileName);
                  if (uploadBlobResponse.requestId) {
                    if (manageImage[i].type == "image") {
                      fileNames[index] = fileName;
                      fileExtensions[index] = f.type;
                      if (currentDate >= 1 && currentDate <= 6) {
                        descriptions[index] = `${config.AZURE_STORAGE_ENDPOINT_NEW_STORAGE1}/${config.AZURE_STORAGE_PATH_NEW_STORAGE}/${blobName}`
                      }
                      else if (currentDate >= 7 && currentDate <= 12) {
                        descriptions[index] = `${config.AZURE_STORAGE_ENDPOINT_NEW_STORAGE2}/${config.AZURE_STORAGE_PATH_NEW_STORAGE}/${blobName}`
                      }
                      else if (currentDate >= 13 && currentDate <= 18) {
                        descriptions[index] = `${config.AZURE_STORAGE_ENDPOINT_NEW_STORAGE3}/${config.AZURE_STORAGE_PATH_NEW_STORAGE}/${blobName}`
                      }
                      else if (currentDate >= 19 && currentDate <= 24) {
                        descriptions[index] = `${config.AZURE_STORAGE_ENDPOINT_NEW_STORAGE4}/${config.AZURE_STORAGE_PATH_NEW_STORAGE}/${blobName}`
                      }
                      else if (currentDate >= 25 && currentDate <= 31) {
                        descriptions[index] = `${config.AZURE_STORAGE_ENDPOINT_NEW_STORAGE5}/${config.AZURE_STORAGE_PATH_NEW_STORAGE}/${blobName}`
                      }
                      imgAlt[index] = alt ? alt[index] : null
                    }
                    else {
                      fileName_thumbnail[index] = fileName;
                      fileExtension_thumbnail[index] = f.type;
                      if (currentDate >= 1 && currentDate <= 6) {
                        description_thumbnail[index] = `${config.AZURE_STORAGE_ENDPOINT_NEW_STORAGE1}/${config.AZURE_STORAGE_PATH_NEW_STORAGE}/${blobName}`
                      }
                      else if (currentDate >= 7 && currentDate <= 12) {
                        description_thumbnail[index] = `${config.AZURE_STORAGE_ENDPOINT_NEW_STORAGE2}/${config.AZURE_STORAGE_PATH_NEW_STORAGE}/${blobName}`
                      }
                      else if (currentDate >= 13 && currentDate <= 18) {
                        description_thumbnail[index] = `${config.AZURE_STORAGE_ENDPOINT_NEW_STORAGE3}/${config.AZURE_STORAGE_PATH_NEW_STORAGE}/${blobName}`
                      }
                      else if (currentDate >= 19 && currentDate <= 24) {
                        description_thumbnail[index] = `${config.AZURE_STORAGE_ENDPOINT_NEW_STORAGE4}/${config.AZURE_STORAGE_PATH_NEW_STORAGE}/${blobName}`
                      }
                      else if (currentDate >= 25 && currentDate <= 31) {
                        description_thumbnail[index] = `${config.AZURE_STORAGE_ENDPOINT_NEW_STORAGE5}/${config.AZURE_STORAGE_PATH_NEW_STORAGE}/${blobName}`
                      }
                      img_alt_thumbnail[index] = alt ? alt[index] : null
                    }
                  }
                }).catch(async err => {
                  let e_ = utils.errorMsg(err, mappingKey);
                  utils.logger.error(utils.responseMsg(res, e_, req, mappingKey));
                  res.writeHead(400, headers);
                  res.write(JSON.stringify({ ResponseCode: 400, ResponseMsg: err?.message, data: null }));
                  return res.end();
                });
            }
            //delete file on web api "./wongnok_/wn"
            fs.unlinkSync(rFileName);
            fs.unlinkSync(filePath);
          })
        );
      }
      else {
        const nowLocal = new Date().toLocaleString('en-US', { timeZone: 'Asia/Bangkok', hour12: false }).split(", ");
        const date = nowLocal[0].split("/");
        const time = nowLocal[1].split(":");
        const day = date[2] + "-" + ("0" + (date[0])).slice(-2) + "-" + ("0" + date[1]).slice(-2) + "_" + ("0" + time[0]).slice(-2) + "_" + ("0" + time[1]).slice(-2) + "_" + ("0" + time[2]).slice(-2);
        const rFileName = `wongnok_/rwn/${file.path.replace('wongnok_/wn/', '').replace('wongnok_\\wn\\', '')}`;
        const manageImage = [{ sizeImage: null, type: "image" }, { sizeImage: 500, type: "thumbnail" }]
        const filePath = file.path; //This is where you get the file path.

        for (var i = 0; i < manageImage.length; i++) {
          await sharp(file.path, { failOnError: false })
            .resize(manageImage[i].sizeImage) ///Hight auto scaled
            .withMetadata()
            .toFile(rFileName)
            .then(async data => {
              const fileName = "PATOIS_" + day + "_" + uuidv4() + "." + file.name.substring(file.name.lastIndexOf(".") + 1, file.name.length);
              const blobName = `${manageImage[i].type}/${date[2]}/${("0" + (date[0])).slice(-2)}/${("0" + date[1]).slice(-2)}/${fileName}`;
              const blockBlobClient = containerClient.getBlockBlobClient(blobName);
              const uploadBlobResponse = await blockBlobClient.uploadFile(rFileName);
              if (uploadBlobResponse.requestId) {
                if (manageImage[i].type == "image") {
                  fileNames.push(fileName);
                  fileExtensions.push(file.type);
                  if (currentDate >= 1 && currentDate <= 6) {
                    descriptions.push(`${config.AZURE_STORAGE_ENDPOINT_NEW_STORAGE1}/${config.AZURE_STORAGE_PATH_NEW_STORAGE}/${blobName}`);
                  }
                  else if (currentDate >= 7 && currentDate <= 12) {
                    descriptions.push(`${config.AZURE_STORAGE_ENDPOINT_NEW_STORAGE2}/${config.AZURE_STORAGE_PATH_NEW_STORAGE}/${blobName}`);
                  }
                  else if (currentDate >= 13 && currentDate <= 18) {
                    descriptions.push(`${config.AZURE_STORAGE_ENDPOINT_NEW_STORAGE3}/${config.AZURE_STORAGE_PATH_NEW_STORAGE}/${blobName}`);
                  }
                  else if (currentDate >= 19 && currentDate <= 24) {
                    descriptions.push(`${config.AZURE_STORAGE_ENDPOINT_NEW_STORAGE4}/${config.AZURE_STORAGE_PATH_NEW_STORAGE}/${blobName}`);
                  }
                  else if (currentDate >= 25 && currentDate <= 31) {
                    descriptions.push(`${config.AZURE_STORAGE_ENDPOINT_NEW_STORAGE5}/${config.AZURE_STORAGE_PATH_NEW_STORAGE}/${blobName}`);
                  }
                  imgAlt.push(alt ? alt[0] : null)
                }
                else {
                  fileName_thumbnail.push(fileName);
                  fileExtension_thumbnail.push(file.type);
                  if (currentDate >= 1 && currentDate <= 6) {
                    description_thumbnail.push(`${config.AZURE_STORAGE_ENDPOINT_NEW_STORAGE1}/${config.AZURE_STORAGE_PATH_NEW_STORAGE}/${blobName}`);
                  }
                  else if (currentDate >= 7 && currentDate <= 12) {
                    description_thumbnail.push(`${config.AZURE_STORAGE_ENDPOINT_NEW_STORAGE2}/${config.AZURE_STORAGE_PATH_NEW_STORAGE}/${blobName}`);
                  }
                  else if (currentDate >= 13 && currentDate <= 18) {
                    description_thumbnail.push(`${config.AZURE_STORAGE_ENDPOINT_NEW_STORAGE3}/${config.AZURE_STORAGE_PATH_NEW_STORAGE}/${blobName}`);
                  }
                  else if (currentDate >= 19 && currentDate <= 24) {
                    description_thumbnail.push(`${config.AZURE_STORAGE_ENDPOINT_NEW_STORAGE4}/${config.AZURE_STORAGE_PATH_NEW_STORAGE}/${blobName}`);
                  }
                  else if (currentDate >= 25 && currentDate <= 31) {
                    description_thumbnail.push(`${config.AZURE_STORAGE_ENDPOINT_NEW_STORAGE5}/${config.AZURE_STORAGE_PATH_NEW_STORAGE}/${blobName}`);
                  }
                  img_alt_thumbnail.push(alt ? alt[0] : null)
                }
              }
            }).catch(async err => {
              let e_ = utils.errorMsg(err, mappingKey);
              utils.logger.error(utils.responseMsg(res, e_, req, mappingKey));
              res.writeHead(400, headers);
              res.write(JSON.stringify({ ResponseCode: 400, ResponseMsg: err?.message, data: null }));
              return res.end();
            });
        }
        //delete file on web api "./wongnok_/wn"
        fs.unlinkSync(rFileName);
        fs.unlinkSync(filePath);
      }

      let imagesData;
      if (file.length) {
        // Sort by index (image)
        let fileNamesTmp = [];
        let fileExtensionsTmp = [];
        let descriptionsTmp = [];
        let imgAltTmp = []
        for (let i = 0; i < fileNames.length; i++) {
          fileNamesTmp.push(fileNames[i]);
          fileExtensionsTmp.push(fileExtensions[i]);
          descriptionsTmp.push(descriptions[i]);
          imgAltTmp.push(imgAlt[i]);
        }

        imagesData = {
          fileName: fileNamesTmp.filter(Boolean).join(","),
          fileExtensions: fileExtensionsTmp.filter(Boolean).join(","),
          description: descriptionsTmp.filter(Boolean).join(","),
          imgAlt: imgAltTmp.every(element => element === null) ? null : imgAltTmp.filter(Boolean).join(","),
        };

        // Sort by index (thumbnail)
        let fileNamesThumbnailTmp = [];
        let descriptionsThumbnailTmp = [];
        let fileExtensionsThumbnailTmp = [];
        let imgAltThumbnailTmp = []
        for (let i = 0; i < fileName_thumbnail.length; i++) {
          if (fileName_thumbnail[i] != undefined) {
            fileNamesThumbnailTmp.push(fileName_thumbnail[i]);
            fileExtensionsThumbnailTmp.push(fileExtension_thumbnail[i]);
            descriptionsThumbnailTmp.push(description_thumbnail[i]);
            imgAltThumbnailTmp.push(img_alt_thumbnail[i]);
          }
        }
        fileName_thumbnail = fileNamesThumbnailTmp
        fileExtension_thumbnail = fileExtensionsThumbnailTmp
        description_thumbnail = descriptionsThumbnailTmp
        img_alt_thumbnail = imgAltThumbnailTmp
      }
      else {
        imagesData = {
          fileName: fileNames.filter(Boolean).join(","),
          fileExtensions: fileExtensions.filter(Boolean).join(","),
          description: descriptions.filter(Boolean).join(","),
          imgAlt: imgAlt.every(element => element === null) ? null : imgAlt.filter(Boolean).join(",")
        };
      }

      let imagesId;
      if (imagesData.fileName) {
        imagesId = await imageData.createPatoisImages(imagesData);
        for (let i = 0; i < fileName_thumbnail.length; i++) {
          const thumbnailId = await imageData.createPatoisImagesThumbnailContent(fileName_thumbnail[i], description_thumbnail[i], fileExtension_thumbnail[i], imagesId, img_alt_thumbnail[i]);
        }
      }

      const logResult = { ...imagesData, imagesId }
      utils.logger.info(utils.responseMsg(res, logResult, req, mappingKey));
      res.writeHead(200, headers);
      res.write(JSON.stringify({ ResponseCode: 200, ResponseMsg: "success", data: { ...imagesData, imagesId } }));
      return res.end();
    });
  } catch (error) {
    let e_ = utils.errorMsg(error, mappingKey);
    utils.logger.error(utils.responseMsg(res, e_, req, mappingKey));
    res.status(400).send({ ResponseCode: 400, ResponseMsg: error?.message, data: null });
  }
};

const getListCategories = async (req, res, next) => {
  const mappingKey = utils.mappingRequestResponse();
  try {
    utils.logger.info(await utils.requestMsg(req, mappingKey));
    const { pageNumber, rowsOfPage } = req.query;
    const listCategories = await contentData.getListCategories(pageNumber, rowsOfPage);
    for (const index in listCategories) {
      const subCategory = await contentData.getSubCategoryByCategoryId(listCategories[index].content_category_id);
      listCategories[index].subCategoryAmount = subCategory.length
      listCategories[index].subCategory = subCategory
    }
    utils.logger.info(utils.responseMsg(res, listCategories, req, mappingKey));
    res.send({ ResponseCode: 200, ResponseMsg: "success", data: listCategories });

  } catch (error) {
    let e_ = utils.errorMsg(error, mappingKey);
    utils.logger.error(utils.responseMsg(res, e_, req, mappingKey));
    res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
  }
};

const getListContent = async (req, res, next) => {
  const mappingKey = utils.mappingRequestResponse();
  try {
    utils.logger.info(await utils.requestMsg(req, mappingKey));
    const { pageNumber, rowsOfPage, status } = req.query;
    const total = await contentData.getCountContent(status);
    const listContent = await contentData.getListContent(pageNumber, rowsOfPage, status);
    for (const index in listContent) {
      const tag = await contentData.getTagByContentId(listContent[index].content_id);
      listContent[index].tag = tag
    }
    utils.logger.info(utils.responseMsg(res, listContent, req, mappingKey));
    res.send({ ResponseCode: 200, ResponseMsg: "success", total: total, data: listContent });

  } catch (error) {
    let e_ = utils.errorMsg(error, mappingKey);
    utils.logger.error(utils.responseMsg(res, e_, req, mappingKey));
    res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
  }
};

const getContentByContentIdAll = async (req, res, next) => {
  const mappingKey = utils.mappingRequestResponse();
  try {
    utils.logger.info(await utils.requestMsg(req, mappingKey));
    const { content_id } = req.query;
    const content = await contentData.getContentByContentIdAll(content_id);
    utils.logger.info(utils.responseMsg(res, content, req, mappingKey));
    res.send({ ResponseCode: 200, ResponseMsg: "success", data: content });
  } catch (error) {
    let e_ = utils.errorMsg(error, mappingKey);
    utils.logger.error(utils.responseMsg(res, e_, req, mappingKey));
    res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
  }
};

const viewContent = async (req, res, next) => {
  const mappingKey = utils.mappingRequestResponse();
  try {
    utils.logger.info(await utils.requestMsg(req, mappingKey));
    const { content_id } = req.query;
    const content = await contentData.viewContent(content_id);
    content.tag = await contentData.getTagByContentId(content.content_id);
    utils.logger.info(utils.responseMsg(res, content, req, mappingKey));
    res.send({ ResponseCode: 200, ResponseMsg: "success", data: content });
  } catch (error) {
    let e_ = utils.errorMsg(error, mappingKey);
    utils.logger.error(utils.responseMsg(res, e_, req, mappingKey));
    res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
  }
};

const editContent = async (req, res, next) => {
  const mappingKey = utils.mappingRequestResponse();
  try {
    utils.logger.info(await utils.requestMsg(req, mappingKey));
    const contentId = req.params.id;
    const data = req.body;
    const contentHistoryId = await contentData.createContentHistory(contentId, data.update_by);
    const result = await contentData.editContent(contentId, data)
    result.tag = await contentData.getTagByContentId(result.content_id);
    utils.logger.info(utils.responseMsg(res, result, req, mappingKey));
    res.send({ ResponseCode: 200, ResponseMsg: "success", data: result });
  } catch (error) {
    let e_ = utils.errorMsg(error, mappingKey);
    utils.logger.error(utils.responseMsg(res, e_, req, mappingKey));
    res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
  }
};




const getContentHotConfig = async (req, res, next) => {
  const mappingKey = utils.mappingRequestResponse();
  try {
    utils.logger.info(await utils.requestMsg(req, mappingKey));
    const { pageNumber, rowsOfPage, contentHotType } = req.query;
    const content = await contentData.getContentHotConfig(pageNumber, rowsOfPage, contentHotType);
    utils.logger.info(utils.responseMsg(res, content, req, mappingKey));
    res.send({ ResponseCode: 200, ResponseMsg: "success", data: content });
  } catch (error) {
    let e_ = utils.errorMsg(error, mappingKey);
    utils.logger.error(utils.responseMsg(res, e_, req, mappingKey));
    res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
  }
};

const getContentCarouselBanner = async (req, res, next) => {
  const mappingKey = utils.mappingRequestResponse();
  try {
    utils.logger.info(await utils.requestMsg(req, mappingKey));
    const { pageNumber, rowsOfPage } = req.query;
    const content = await contentData.getContentCarouselBanner(pageNumber, rowsOfPage);
    utils.logger.info(utils.responseMsg(res, content, req, mappingKey));
    res.send({ ResponseCode: 200, ResponseMsg: "success", data: content });
  } catch (error) {
    let e_ = utils.errorMsg(error, mappingKey);
    utils.logger.error(utils.responseMsg(res, e_, req, mappingKey));
    res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
  }
};

const getContentSugessionConfig = async (req, res, next) => {
  const mappingKey = utils.mappingRequestResponse();
  try {
    utils.logger.info(await utils.requestMsg(req, mappingKey));
    const { pageNumber, rowsOfPage } = req.query;
    const content = await contentData.getContentSugessionConfig(pageNumber, rowsOfPage);
    utils.logger.info(utils.responseMsg(res, content, req, mappingKey));
    res.send({ ResponseCode: 200, ResponseMsg: "success", data: content });
  } catch (error) {
    let e_ = utils.errorMsg(error, mappingKey);
    utils.logger.error(utils.responseMsg(res, e_, req, mappingKey));
    res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
  }
};

const getContentLastUpdate = async (req, res, next) => {
  const mappingKey = utils.mappingRequestResponse();
  try {
    utils.logger.info(await utils.requestMsg(req, mappingKey));
    const { pageNumber, rowsOfPage } = req.query;
    const content = await contentData.getContentLastUpdate(pageNumber, rowsOfPage);
    utils.logger.info(utils.responseMsg(res, content, req, mappingKey));
    res.send({ ResponseCode: 200, ResponseMsg: "success", data: content });
  } catch (error) {
    let e_ = utils.errorMsg(error, mappingKey);
    utils.logger.error(utils.responseMsg(res, e_, req, mappingKey));
    res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
  }
};

const getADSbannerConfig = async (req, res, next) => {
  const mappingKey = utils.mappingRequestResponse();
  try {
    utils.logger.info(await utils.requestMsg(req, mappingKey));
    const { pageNumber, rowsOfPage } = req.query;
    const content = await contentData.getADSbannerConfig(pageNumber, rowsOfPage);
    utils.logger.info(utils.responseMsg(res, content, req, mappingKey));
    res.send({ ResponseCode: 200, ResponseMsg: "success", data: content });
  } catch (error) {
    let e_ = utils.errorMsg(error, mappingKey);
    utils.logger.error(utils.responseMsg(res, e_, req, mappingKey));
    res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
  }
};

const getBannerInpageByConfigName = async (req, res, next) => {
  const mappingKey = utils.mappingRequestResponse();
  try {
    utils.logger.info(await utils.requestMsg(req, mappingKey));
    const { configName } = req.query;
    const content = await contentData.getBannerInpageByConfigName(configName);
    utils.logger.info(utils.responseMsg(res, content, req, mappingKey));
    res.send({ ResponseCode: 200, ResponseMsg: "success", data: content });
  } catch (error) {
    let e_ = utils.errorMsg(error, mappingKey);
    utils.logger.error(utils.responseMsg(res, e_, req, mappingKey));
    res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
  }
};

const getPartnership = async (req, res, next) => {
  const mappingKey = utils.mappingRequestResponse();
  try {
    utils.logger.info(await utils.requestMsg(req, mappingKey));
    const { pageNumber, rowsOfPage } = req.query;
    const content = await contentData.getPartnership(pageNumber, rowsOfPage);
    utils.logger.info(utils.responseMsg(res, content, req, mappingKey));
    res.send({ ResponseCode: 200, ResponseMsg: "success", data: content });
  } catch (error) {
    let e_ = utils.errorMsg(error, mappingKey);
    utils.logger.error(utils.responseMsg(res, e_, req, mappingKey));
    res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
  }
};

const getTripSugessionConfig = async (req, res, next) => {
  const mappingKey = utils.mappingRequestResponse();
  try {
    utils.logger.info(await utils.requestMsg(req, mappingKey));
    const { pageNumber, rowsOfPage } = req.query;
    const content = await contentData.getTripSugessionConfig(pageNumber, rowsOfPage);
    utils.logger.info(utils.responseMsg(res, content, req, mappingKey));
    res.send({ ResponseCode: 200, ResponseMsg: "success", data: content });
  } catch (error) {
    let e_ = utils.errorMsg(error, mappingKey);
    utils.logger.error(utils.responseMsg(res, e_, req, mappingKey));
    res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
  }
};

const getContentCarouselBannerCms = async (req, res, next) => {
  const mappingKey = utils.mappingRequestResponse();
  try {
    utils.logger.info(await utils.requestMsg(req, mappingKey));
    const { pageNumber, rowsOfPage } = req.query;
    const listContentCarouselBanner = await contentData.getContentCarouselBannerCms(pageNumber, rowsOfPage);
    utils.logger.info(utils.responseMsg(res, listContentCarouselBanner, req, mappingKey));
    res.send({ ResponseCode: 200, ResponseMsg: "success", data: listContentCarouselBanner });
  } catch (error) {
    let e_ = utils.errorMsg(error, mappingKey);
    utils.logger.error(utils.responseMsg(res, e_, req, mappingKey));
    res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
  }
};

const getSugessionContentCms = async (req, res, next) => {
  const mappingKey = utils.mappingRequestResponse();
  try {
    utils.logger.info(await utils.requestMsg(req, mappingKey));
    const { pageNumber, rowsOfPage } = req.query;
    const listSugessionContent = await contentData.getSugessionContentCms(pageNumber, rowsOfPage);
    utils.logger.info(utils.responseMsg(res, listSugessionContent, req, mappingKey));
    res.send({ ResponseCode: 200, ResponseMsg: "success", data: listSugessionContent });
  } catch (error) {
    let e_ = utils.errorMsg(error, mappingKey);
    utils.logger.error(utils.responseMsg(res, e_, req, mappingKey));
    res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
  }
};

const getAdsBannerCms = async (req, res, next) => {
  const mappingKey = utils.mappingRequestResponse();
  try {
    utils.logger.info(await utils.requestMsg(req, mappingKey));
    const { pageNumber, rowsOfPage } = req.query;
    const listAdsBanner = await contentData.getAdsBannerCms(pageNumber, rowsOfPage);
    utils.logger.info(utils.responseMsg(res, listAdsBanner, req, mappingKey));
    res.send({ ResponseCode: 200, ResponseMsg: "success", data: listAdsBanner });
  } catch (error) {
    let e_ = utils.errorMsg(error, mappingKey);
    utils.logger.error(utils.responseMsg(res, e_, req, mappingKey));
    res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
  }
};

const getImageAndTitleByContentId = async (req, res, next) => {
  const mappingKey = utils.mappingRequestResponse();
  try {
    utils.logger.info(await utils.requestMsg(req, mappingKey));
    const { contentId } = req.query;
    const imageData = await contentData.getImageAndTitleByContentId(contentId);
    utils.logger.info(utils.responseMsg(res, imageData, req, mappingKey));
    res.send({ ResponseCode: 200, ResponseMsg: "success", data: imageData });
  } catch (error) {
    let e_ = utils.errorMsg(error, mappingKey);
    utils.logger.error(utils.responseMsg(res, e_, req, mappingKey));
    res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
  }
};

const saveContentCarouselBanner = async (req, res, next) => {
  const mappingKey = utils.mappingRequestResponse();
  try {
    utils.logger.info(await utils.requestMsg(req, mappingKey));
    const listData = req.body
    let listContentCarouselBanner = []
    for (const data of listData) {
      listContentCarouselBanner.push(await contentData.saveContentCarouselBanner(data))
    }
    utils.logger.info(utils.responseMsg(res, listContentCarouselBanner, req, mappingKey));
    res.send({ ResponseCode: 200, ResponseMsg: "success", data: listContentCarouselBanner });
  } catch (error) {
    let e_ = utils.errorMsg(error, mappingKey);
    utils.logger.error(utils.responseMsg(res, e_, req, mappingKey));
    res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
  }
};

const saveContentSugession = async (req, res, next) => {
  const mappingKey = utils.mappingRequestResponse();
  try {
    utils.logger.info(await utils.requestMsg(req, mappingKey));
    const listData = req.body
    let listContentSugession = []
    for (const data of listData) {
      listContentSugession.push(await contentData.saveContentSugession(data))
    }
    utils.logger.info(utils.responseMsg(res, listContentSugession, req, mappingKey));
    res.send({ ResponseCode: 200, ResponseMsg: "success", data: listContentSugession });
  } catch (error) {
    let e_ = utils.errorMsg(error, mappingKey);
    utils.logger.error(utils.responseMsg(res, e_, req, mappingKey));
    res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
  }
};

const saveContentAdsBanner = async (req, res, next) => {
  const mappingKey = utils.mappingRequestResponse();
  try {
    utils.logger.info(await utils.requestMsg(req, mappingKey));
    const listData = req.body
    let listContentAdsBanner = []
    for (const data of listData) {
      listContentAdsBanner.push(await contentData.saveContentAdsBanner(data))
    }
    utils.logger.info(utils.responseMsg(res, listContentAdsBanner, req, mappingKey));
    res.send({ ResponseCode: 200, ResponseMsg: "success", data: listContentAdsBanner });
  } catch (error) {
    let e_ = utils.errorMsg(error, mappingKey);
    utils.logger.error(utils.responseMsg(res, e_, req, mappingKey));
    res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
  }
};

const searchCategories = async (req, res, next) => {
  const mappingKey = utils.mappingRequestResponse();
  try {
    utils.logger.info(await utils.requestMsg(req, mappingKey));
    const { pageNumber, rowsOfPage, text } = req.query;
    const listCategories = await contentData.searchCategories(pageNumber, rowsOfPage, text)
    for (const index in listCategories.list) {
      const subCategory = await contentData.getSubCategoryByCategoryId(listCategories.list[index].content_category_id);
      listCategories.list[index].subCategoryAmount = subCategory.length
      listCategories.list[index].subCategory = subCategory
    }
    utils.logger.info(utils.responseMsg(res, listCategories, req, mappingKey));
    res.send({ ResponseCode: 200, ResponseMsg: "success", total: listCategories.total, data: listCategories.list });
  } catch (error) {
    let e_ = utils.errorMsg(error, mappingKey);
    utils.logger.error(utils.responseMsg(res, e_, req, mappingKey));
    res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
  }
};

const searchSubCategories = async (req, res, next) => {
  const mappingKey = utils.mappingRequestResponse();
  try {
    utils.logger.info(await utils.requestMsg(req, mappingKey));
    const { pageNumber, rowsOfPage, text } = req.query;
    const listSubCategories = await contentData.searchSubCategories(pageNumber, rowsOfPage, text)
    utils.logger.info(utils.responseMsg(res, listSubCategories, req, mappingKey));
    res.send({ ResponseCode: 200, ResponseMsg: "success", total: listSubCategories.total, data: listSubCategories.list });
  } catch (error) {
    let e_ = utils.errorMsg(error, mappingKey);
    utils.logger.error(utils.responseMsg(res, e_, req, mappingKey));
    res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
  }
};

const addCategories = async (req, res, next) => {
  const mappingKey = utils.mappingRequestResponse();
  try {
    utils.logger.info(await utils.requestMsg(req, mappingKey));
    const categories = req.body;
    const contentCategoryId = await contentData.addCategories(categories)
    utils.logger.info(utils.responseMsg(res, contentCategoryId, req, mappingKey));
    res.send({ ResponseCode: 200, ResponseMsg: "success", data: contentCategoryId });
  } catch (error) {
    let e_ = utils.errorMsg(error, mappingKey);
    utils.logger.error(utils.responseMsg(res, e_, req, mappingKey));
    res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
  }
};

const addSubCategories = async (req, res, next) => {
  const mappingKey = utils.mappingRequestResponse();
  try {
    utils.logger.info(await utils.requestMsg(req, mappingKey));
    const subCategories = req.body;
    const contentSubCategoryId = await contentData.addSubCategories(subCategories)
    utils.logger.info(utils.responseMsg(res, contentSubCategoryId, req, mappingKey));
    res.send({ ResponseCode: 200, ResponseMsg: "success", data: contentSubCategoryId });
  } catch (error) {
    let e_ = utils.errorMsg(error, mappingKey);
    utils.logger.error(utils.responseMsg(res, e_, req, mappingKey));
    res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
  }
};

const assignSubCategories = async (req, res, next) => {
  const mappingKey = utils.mappingRequestResponse();
  try {
    utils.logger.info(await utils.requestMsg(req, mappingKey));
    const subCategoriesId = req.params.id
    const data = req.body;
    const subCategories = await contentData.assignSubCategories(subCategoriesId, data.categoriesId)
    utils.logger.info(utils.responseMsg(res, subCategories, req, mappingKey));
    res.send({ ResponseCode: 200, ResponseMsg: "success", data: subCategories });
  } catch (error) {
    let e_ = utils.errorMsg(error, mappingKey);
    utils.logger.error(utils.responseMsg(res, e_, req, mappingKey));
    res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
  }
};

const getAllSubCategories = async (req, res, next) => {
  const mappingKey = utils.mappingRequestResponse();
  try {
    utils.logger.info(await utils.requestMsg(req, mappingKey));
    const { active } = req.query
    const listSubCategories = await contentData.getAllSubCategories(active)
    utils.logger.info(utils.responseMsg(res, listSubCategories, req, mappingKey));
    res.send({ ResponseCode: 200, ResponseMsg: "success", data: listSubCategories });
  } catch (error) {
    let e_ = utils.errorMsg(error, mappingKey);
    utils.logger.error(utils.responseMsg(res, e_, req, mappingKey));
    res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
  }
};

const editSubCategory = async (req, res, next) => {
  const mappingKey = utils.mappingRequestResponse();
  try {
    utils.logger.info(await utils.requestMsg(req, mappingKey));
    const subCategoryId = req.params.id
    const data = req.body;
    const subCategory = await contentData.editSubCategory(subCategoryId, data.sub_category_name)
    utils.logger.info(utils.responseMsg(res, data, req, mappingKey));
    res.send({ ResponseCode: 200, ResponseMsg: "success", data: subCategory, body: data, test: data.sub_category_name });
  } catch (error) {
    let e_ = utils.errorMsg(error, mappingKey);
    utils.logger.error(utils.responseMsg(res,e_, req, mappingKey));
    res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
  }
};

const editCategory = async (req, res, next) => {
  const mappingKey = utils.mappingRequestResponse();
  try {
    utils.logger.info(await utils.requestMsg(req, mappingKey));
    const categoryId = req.params.id
    const data = req.body;
    const category = await contentData.editCategory(categoryId, data.category_name)
    utils.logger.info(utils.responseMsg(res, data, req, mappingKey));
    res.send({ ResponseCode: 200, ResponseMsg: "success", data: category, body: data});
  } catch (error) {
    let e_ = utils.errorMsg(error, mappingKey);
    utils.logger.error(utils.responseMsg(res, e_, req, mappingKey));
    res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
  }
};

const getSelectSubCategory = async (req, res, next) => {
  const mappingKey = utils.mappingRequestResponse();
  try {
    utils.logger.info(await utils.requestMsg(req, mappingKey));
    const subCategory = await contentData.getSelectSubCategory();
    utils.logger.info(utils.responseMsg(res, subCategory, req, mappingKey));
    res.send({ ResponseCode: 200, ResponseMsg: "success", data: subCategory });
  } catch (error) {
    let e_ = utils.errorMsg(error, mappingKey);
    utils.logger.error(utils.responseMsg(res, e_, req, mappingKey));
    res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
  }
};

const getCategoryById = async (req, res, next) => {
  const mappingKey = utils.mappingRequestResponse();
  try {
    utils.logger.info(await utils.requestMsg(req, mappingKey));
    const categoryId = req.params.id
    const category = await contentData.getCategoryById(categoryId);

    const subCategory = await contentData.getSubCategoryByCategoryId(category[0].content_category_id);
    category[0].subCategory = subCategory

    utils.logger.info(utils.responseMsg(res, category, req, mappingKey));
    res.send({ ResponseCode: 200, ResponseMsg: "success", data: category });
  } catch (error) {
    let e_ = utils.errorMsg(error, mappingKey);
    utils.logger.error(utils.responseMsg(res, e_, req, mappingKey));
    res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
  }
};

const deleteCategory = async (req, res, next) => {
  const mappingKey = utils.mappingRequestResponse();
  try {
    utils.logger.info(await utils.requestMsg(req, mappingKey));
    const data = req.body;
    const category = await contentData.deleteCategory(data.content_category_id)

    const subCategoryList = await contentData.getSubCategoryByCategoryId(category[0].content_category_id);
    for(const subCategory of subCategoryList){
      //await contentData.assignSubCategories(subCategory.content_sub_category_id, null);
      await contentData.deleteSubCategory(subCategory.content_sub_category_id)
      await contentData.deleteContent(subCategory.content_sub_category_id)
    }

    utils.logger.info(utils.responseMsg(res, data, req, mappingKey));
    res.send({ ResponseCode: 200, ResponseMsg: "success", data: category, body: data, test: subCategoryList});
  } catch (error) {
    let e_ = utils.errorMsg(error, mappingKey);
    utils.logger.error(utils.responseMsg(res, e_, req, mappingKey));
    res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
  }
};

const deleteSubCategory = async (req, res, next) => {
  const mappingKey = utils.mappingRequestResponse();
  try {
    utils.logger.info(await utils.requestMsg(req, mappingKey));
    const data = req.body;
    const subCategory = await contentData.deleteSubCategory(data.content_sub_category_id)
    const content = await contentData.deleteContent(data.content_sub_category_id)
    utils.logger.info(utils.responseMsg(res, data, req, mappingKey));
    res.send({ ResponseCode: 200, ResponseMsg: "success", data: subCategory, body: data, content: content});
  } catch (error) {
    let e_ = utils.errorMsg(error, mappingKey);
    utils.logger.error(utils.responseMsg(res, e_, req, mappingKey));
    res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
  }
};

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
  createImageContent,
  getListCategories,
  getListContent,
  getContentByContentIdAll,
  viewContent,
  editContent,
  editCategory,
  editSubCategory,
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
};
