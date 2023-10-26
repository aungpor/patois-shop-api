"use strict";
const formidable = require("formidable");
const imageData = require("../data/image");
const errorLogData = require("../data/errorLog");
const utils = require("../data/utils");
const { BlobServiceClient, BlobSASPermissions } = require("@azure/storage-blob");
const { v4: uuidv4 } = require("uuid");
const config = require("../config");
const fs = require("fs");
const sharp = require('sharp');
const imageHashUtil = require("../data/imageHashUtil");
const supportData = require("../data/support");
const userData = require("../data/user");
const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "OPTIONS, POST, GET",
  "Access-Control-Max-Age": 2592000, // 30 days
  /** add other headers as per requirement */
};

const uploadImages = async (req, res, next) => {
  const mappingKey = utils.mappingRequestResponse();
  try {
    utils.logger.info(await utils.requestMsg(req, mappingKey));
    let usered = await utils.getUser(req.headers.token);
    if (usered.error === "Token is expired!") {
      utils.logger.info(utils.responseMsg(res, usered.error, req, mappingKey));
      res.status(401).send({ ResponseCode: 401, ResponseMsg: usered.error, data: null });
    }
    else {
      const u = await userData.getUserProfileById(usered.userId);
      if (u[0].active == 0) {
        throw new Error('คุณไม่มีสิทธิ์ใช้งาน กรุณาติดต่อ ผู้ดูแลระบบ');
      }
      const form = new formidable.IncomingForm({ multiples: true });
      form.uploadDir = "./wongnok_/wn";
      form.keepExtensions = true;
      form.parse(req, async (err, fields, files) => {
        if (err) {
          let e_ = utils.errorMsg(err, mappingKey);
          utils.logger.error(utils.responseMsg(res, e_, req, mappingKey));
          console.log("some error", err);
          res.writeHead(400, headers);
          res.write(JSON.stringify({ ResponseCode: 400, ResponseMsg: err.message, data: null }));
          return res.end();
        }
        //Upload to Azure blob storeage
        const file = files["files[]"];

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

        let fileName_thumbnail = [];
        let fileExtension_thumbnail = [];
        let description_thumbnail = [];

        let imageHashObjectList = [];
        let imageHashValidateHashStatus = [];
        let UP_STATUS_ERROR = "ERROR";
        let UP_STATUS_SUCCESS = "SUCCESS";
        let UP_STATUS_DUPLICATE = "DUPLICATE";

        let fileNameIsDup = [];

        let prefixfolderName = ""

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

                    // Hash Image
                    let imagesDataHash = {};
                    let isDupImageHash = null;
                    let statusObject = {};
                    statusObject.fileName = f.name;
                    if (manageImage[i].type == "image") {
                      try {
                        imagesDataHash.imageId = null;
                        imagesDataHash.fileName = fileName;
                        imagesDataHash.active = 1;
                        imagesDataHash.verification_status_code = '10';
                        imagesDataHash.userId = usered.userId;
                        const imgHash = await imageHashUtil.generateIMageHash(rFileName);
                        isDupImageHash = await imageData.checkIsDupImageByHash(imgHash);
                        imagesDataHash.imageHashVal = imgHash;
                        imagesDataHash.status = UP_STATUS_SUCCESS;
                        imagesDataHash.error_massage = null;
                        statusObject.status = UP_STATUS_SUCCESS;
                      } catch (error) {
                        console.log(error);
                        imagesDataHash.status = UP_STATUS_ERROR;
                        imagesDataHash.error_massage = error?.message;
                        statusObject.status = UP_STATUS_ERROR;
                      }
                    }

                    if (isDupImageHash) {
                      fileNameIsDup[index] = f.name;
                      statusObject.status = UP_STATUS_DUPLICATE;
                      imagesDataHash.status = UP_STATUS_DUPLICATE;
                      imagesDataHash.verification_status_code = '20';
                    } else {
                      if (fileNameIsDup.some(e => e == f.name)) {

                      }
                      else {
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
                          }
                        }
                      }
                    }

                    if (manageImage[i].type == "image") {
                      imageHashValidateHashStatus.push(statusObject);
                      imageHashObjectList.push(imagesDataHash);
                    }
                  }).catch(async err => {
                    let e_ = utils.errorMsg(err, mappingKey);
                    utils.logger.error(utils.responseMsg(res, e_, req, mappingKey));
                    const requestErrorLog = await errorLogData.createErrorLog({
                      error_from: "Patois Api",
                      error_name: "Catch error",
                      error_func_name: "uploadImages",
                      error_code: "",
                      error_massage: err?.message
                    }, '');
                    console.log(err)
                    console.log("some error", err);
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
          const manageImage = [{ sizeImage: 960, type: "image" }, { sizeImage: 500, type: "thumbnail" }]
          const filePath = file.path; //This is where you get the file path.

          for (var i = 0; i < manageImage.length; i++) {
            await sharp(file.path, { failOnError: false })
              .resize(manageImage[i].sizeImage) ///Hight auto scaled
              .withMetadata()
              .toFile(rFileName)
              .then(async data => {
                const fileName = "PATOIS_" + day + "_" + uuidv4() + "." + file.name.substring(file.name.lastIndexOf(".") + 1, file.name.length);
                const blobName = `${manageImage[i].type}/${date[2]}/${("0" + (date[0])).slice(-2)}/${("0" + date[1]).slice(-2)}/${fileName}`;

                // Hash Image
                let imagesDataHash = {};
                let isDupImageHash = null;
                let statusObject = {};
                statusObject.fileName = file.name;
                if (manageImage[i].type == "image") {
                  try {
                    imagesDataHash.imageId = null;
                    imagesDataHash.fileName = fileName;
                    imagesDataHash.active = 1;
                    imagesDataHash.verification_status_code = '10';
                    imagesDataHash.userId = usered.userId;
                    const imgHash = await imageHashUtil.generateIMageHash(rFileName);
                    isDupImageHash = await imageData.checkIsDupImageByHash(imgHash);
                    imagesDataHash.imageHashVal = imgHash;
                    imagesDataHash.status = UP_STATUS_SUCCESS;
                    imagesDataHash.error_massage = null;
                    statusObject.status = UP_STATUS_SUCCESS;
                  } catch (error) {
                    console.log(error);
                    imagesDataHash.status = UP_STATUS_ERROR;
                    imagesDataHash.error_massage = error?.message;
                    statusObject.status = UP_STATUS_ERROR;
                  }
                }

                if (isDupImageHash) {// Is Dup
                  fileNameIsDup = file.name;
                  statusObject.status = UP_STATUS_DUPLICATE;
                  imagesDataHash.status = UP_STATUS_DUPLICATE;
                  imagesDataHash.verification_status_code = '20';
                }
                else {
                  if (file.name == fileNameIsDup) {

                  }
                  else {
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
                      }
                    }
                  }
                }
                if (manageImage[i].type == "image") {
                  imageHashValidateHashStatus.push(statusObject);
                  imageHashObjectList.push(imagesDataHash);
                }
              }).catch(async err => {
                let e_ = utils.errorMsg(err, mappingKey);
                utils.logger.error(utils.responseMsg(res, e_, req, mappingKey));
                const requestErrorLog = await errorLogData.createErrorLog({
                  error_from: "Patois Api",
                  error_name: "Catch error",
                  error_func_name: "uploadImages",
                  error_code: "",
                  error_massage: err?.message
                }, '');
                console.log(err)
                console.log("some error", err);
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
          for (let i = 0; i < fileNames.length; i++) {
            fileNamesTmp.push(fileNames[i]);
            fileExtensionsTmp.push(fileExtensions[i]);
            descriptionsTmp.push(descriptions[i]);
          }
          imagesData = {
            fileName: fileNamesTmp.filter(Boolean).join(","),
            fileExtensions: fileExtensionsTmp.filter(Boolean).join(","),
            description: descriptionsTmp.filter(Boolean).join(","),
          };

          // Sort by index (thumbnail)
          let fileNamesThumbnailTmp = [];
          let descriptionsThumbnailTmp = [];
          let fileExtensionsThumbnailTmp = [];
          for (let i = 0; i < fileName_thumbnail.length; i++) {
            if (fileName_thumbnail[i] != undefined) {
              fileNamesThumbnailTmp.push(fileName_thumbnail[i]);
              fileExtensionsThumbnailTmp.push(fileExtension_thumbnail[i]);
              descriptionsThumbnailTmp.push(description_thumbnail[i]);
            }
          }
          fileName_thumbnail = fileNamesThumbnailTmp
          fileExtension_thumbnail = fileExtensionsThumbnailTmp
          description_thumbnail = descriptionsThumbnailTmp
        }
        else {
          imagesData = {
            fileName: fileNames.filter(Boolean).join(","),
            fileExtensions: fileExtensions.filter(Boolean).join(","),
            description: descriptions.filter(Boolean).join(","),
          };
        }

        let isImageDup = false;
        for (const imageHashValidateHashStatusObj of imageHashValidateHashStatus) {
          if (imageHashValidateHashStatusObj.status == UP_STATUS_DUPLICATE) {
            isImageDup = true;
            break;
          }
        }

        let imagesId;
        if (imagesData.fileName) {
          imagesId = await imageData.createPatoisImages(imagesData);
          for (let i = 0; i < fileName_thumbnail.length; i++) {
            const thumbnailId = await imageData.createPatoisImagesThumbnail(fileName_thumbnail[i], description_thumbnail[i], fileExtension_thumbnail[i], imagesId);
          }
          // Insert Hash Image Object
          for (const imageHashObject of imageHashObjectList) {
            imageHashObject.imageId = imagesId;
            const imageHashId = await imageData.createPatoisImageHash(imageHashObject);
            if (imageHashObject.verification_status_code == '20') {
              // Send to Report
              let transData = {};
              transData.sourceId = 3;
              transData.categoryId = 1;
              transData.referenceId = imagesId;
              transData.verificationStatusCode = imageHashObject.verification_status_code;
              transData.remark = 'Duplicate Image';
              const result = await supportData.createReport(transData, 'system hash');
            }
          }
        }

        const logResult = { ...imagesData, imagesId, imageHashValidateHashStatus }
        utils.logger.info(utils.responseMsg(res, logResult, req, mappingKey));
        res.writeHead(200, headers);
        res.write(JSON.stringify({ ResponseCode: 200, ResponseMsg: "success", data: { ...imagesData, imagesId, imageHashValidateHashStatus, countFail: imageHashValidateHashStatus.filter(e => e.status == "DUPLICATE").length, countSuccess: imageHashValidateHashStatus.filter(e => e.status == "SUCCESS").length } }));
        return res.end();
      });

    }
  } catch (error) {
    let e_ = utils.errorMsg(error, mappingKey);
    utils.logger.error(utils.responseMsg(res, e_, req, mappingKey));
    const requestErrorLog = await errorLogData.createErrorLog({
      error_from: "Patois Api",
      error_name: "Catch error",
      error_func_name: "uploadImages",
      error_code: "",
      error_massage: error?.message
    }, '');

    res.status(400).send({ ResponseCode: 400, ResponseMsg: error?.message, data: null });
  }
};

const deleteImage = async (req, res, next) => {
  const mappingKey = utils.mappingRequestResponse();
  try {
    utils.logger.info(await utils.requestMsg(req, mappingKey));
    const imageId = req.params.imageId;
    const result = await imageData.deleteImage(imageId);
    utils.logger.info(utils.responseMsg(res, result, req, mappingKey));
    res.send({ ResponseCode: 200, ResponseMsg: "success", data: { status: result } });
  } catch (error) {
    let e_ = utils.errorMsg(error, mappingKey);
    utils.logger.error(utils.responseMsg(res, e_, req, mappingKey));
    res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
  }
};

module.exports = {
  uploadImages,
  deleteImage
};
