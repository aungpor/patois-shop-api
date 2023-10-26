"use strict";

const utils = require("./utils");
const config = require("../config");
const sql = require("mssql");
const errorLogData = require("../data/errorLog");
const axios = require('axios');

let SERVER_EXCEPTION_MESSAGE = "System error. Please contact the administrator.";

 const sendMaxPoints = async (userId, mappingKey, req , promo, transactionId, referenceType, messageNotiCondition) => {

   try {
      utils.logDebug('playMission Run.... mappingKey:'+mappingKey);
      // ยิง Maxpoint
      // Check MaxCard

      let pool = await sql.connect(config.sql);
      const sqlQueries = await utils.loadSqlQueryies("crmUtils");
      const maxCardData = await pool
      .request()
      .input("user_id", sql.BigInt, userId)
      .query(sqlQueries.getUserMaxCard);
      const usermaxCardD = maxCardData.recordset && maxCardData.recordset.length !=0 ? maxCardData.recordset[0] : null;

      let sendPointsDataEncpty = "";
      let sendPoints=null;
      let dataObject=null;
      
      let dateTime_ =  utils.getDateTimeNowFormat1();

      if(usermaxCardD){// มี Maxcard
         dataObject = 
         {
            "MID":"396221113400001",
            "TID":"99999999",
            "BATCH_ID":"30012023",
            "STAND_ID":"24",
            "CARD_NO":usermaxCardD.patois_maxcard_no,
            "PRODUCT_CODE":"4101001000002",
            "PRODUCT_PRICE":"1.00",
            "PRODUCT_QUAN":promo.promo.promos_point,
            "TIME":dateTime_,//"2023/01/30 03:23:39",
            "referenceId":transactionId,
            "referenceType":referenceType,
            "promosCode":promo.promo.promos_code,
            "IS_FORCE_CARD_NO":"N",
            "IS_FORCE_USER_ID":"N",
            "userId":""
         }

         sendPointsDataEncpty =  utils.AES_encrypt_object(dataObject);
         utils.logDebug('Send to /api/maxcard/reward/point API data:'+JSON.stringify(dataObject)+' mappingKey:'+mappingKey);
         utils.logDebug('Send to /api/maxcard/reward/point API StringEncpty:'+sendPointsDataEncpty+' mappingKey:'+mappingKey);
         sendPoints = await axios({
            url: `${config.MAXCARD_REWARD_POINT_API}/api/maxcard/reward/point`,
            method: 'POST',
            headers: { 
               'token': req.headers.token, 
               'Content-Type': 'application/json'
            },
            data: {
               data: sendPointsDataEncpty
            }
         })
            .then(data => {
            return data.data.data
            })
            .catch(err => {
            throw err
            })
            
            utils.logDebug('Data point return Data:'+JSON.stringify(sendPoints)+' mappingKey:'+mappingKey);
      }else{// ไม่มี Maxcard
         dataObject = 
         {
            "MID":"396221113400001",
            "TID":"99999999",
            "BATCH_ID":"30012023",
            "STAND_ID":"24",
            "CARD_NO":null,
            "PRODUCT_CODE":"4101001000002",
            "PRODUCT_PRICE":"1.00",
            "PRODUCT_QUAN":promo.promo.promos_point,
            "TIME":dateTime_,//"2023/01/30 03:23:39",
            "referenceId":transactionId,
            "referenceType":referenceType,
            "promosCode":promo.promo.promos_code,
            "IS_FORCE_CARD_NO":"N",
            "IS_FORCE_USER_ID":"N",
            "userId":""
         }
         sendPointsDataEncpty =  utils.AES_encrypt_object(dataObject);
         utils.logDebug('Send to /api/maxcard/reward/pointDraft API data:'+JSON.stringify(dataObject)+' mappingKey:'+mappingKey);
         utils.logDebug('Send to /api/maxcard/reward/pointDraft API StringEncpty:'+sendPointsDataEncpty+' mappingKey:'+mappingKey);
         sendPoints = await axios({
            url: `${config.MAXCARD_REWARD_POINT_API}/api/maxcard/reward/pointDraft`,
            method: 'POST',
            headers: { 
               'token': req.headers.token, 
               'Content-Type': 'application/json'
            },
            data: {
               data: sendPointsDataEncpty
            }
         })
            .then(data => {
            return data.data.data
            })
            .catch(err => {
            throw err
            })

            utils.logDebug('Data pointDraft retrun Data:'+JSON.stringify(sendPoints)+' mappingKey:'+mappingKey);

      }

      // Send Notification Line OA to user
      const userLineTokeData = await pool
      .request()
      .input("user_id", sql.BigInt, userId)
      .query(sqlQueries.getUserLineToken);
      const userLineToke = userLineTokeData.recordset && userLineTokeData.recordset.length !=0 ? userLineTokeData.recordset[0] : null;
      if(userLineToke.token_customer){
         //let messageNoti = "ยินดีด้วย คุณ "+userLineToke.name+" ได้รับ "+promo.promo.promos_point+" Max points โดยคุณสามารถใช้คะแนนได้ในวันถัดไป 🙂";
         let messageNoti = "ยินดีด้วย คุณ "+userLineToke.name+" ได้รับ "+promo.promo.promos_point+messageNotiCondition;
         let sendnotiResult = await axios({
            url: `${config.BOT_WEB_HOOK_API}/api/system/customer/bot/webhook`,
            method: 'POST',
            headers: { 
               'token': req.headers.token, 
               'Content-Type': 'application/json'
            },
            data: {
               "message": messageNoti,
               "lineId": userLineToke.token_customer
            }
         })
            .then(data => {
            return data.data.data
            })
            .catch(err => {
            throw err
            })
         utils.logDebug('Send to Line OA:'+messageNoti+' mappingKey:'+mappingKey);
      }else{
         utils.logDebug('No Send to Line OA token_customer:'+userLineToke.token_customer+' mappingKey:'+mappingKey);
      }



   } catch (error) {
      const requestErrorLog = await errorLogData.createErrorLog({
      error_from: "Patois Api",
      error_name: "Catch error",
      error_func_name: "sendMaxPoints",
      error_code: "",
      error_massage: error.message
      },userId ? userId : '');


      // return error.message;
      throw error;
   }


 }


 const sendNotiPointLineOA = async (userId, mappingKey, req , promo, messageNotiCondition) => {
   try {
      // Send Notification Line OA to user
      let pool = await sql.connect(config.sql);
      const sqlQueries = await utils.loadSqlQueryies("crmUtils");
      const userLineTokeData = await pool
      .request()
      .input("user_id", sql.BigInt, userId)
      .query(sqlQueries.getUserLineToken);
      const userLineToke = userLineTokeData.recordset && userLineTokeData.recordset.length !=0 ? userLineTokeData.recordset[0] : null;
      if(userLineToke.token_customer){
         //let messageNoti = "ยินดีด้วย คุณ "+userLineToke.name+" ได้รับ "+promo.promo.promos_point+" Max points โดยคุณสามารถใช้คะแนนได้ในวันถัดไป 🙂";
         let messageNoti = "ยินดีด้วย คุณ "+userLineToke.name+" ได้รับ "+promo.promo.promos_point+messageNotiCondition;
         let sendnotiResult = await axios({
            url: `${config.BOT_WEB_HOOK_API}/api/system/customer/bot/webhook`,
            method: 'POST',
            headers: { 
               'token': req.headers.token, 
               'Content-Type': 'application/json'
            },
            data: {
               "message": messageNoti,
               "lineId": userLineToke.token_customer
            }
         })
            .then(data => {
            return data.data.data
            })
            .catch(err => {
            throw err
            })
         utils.logDebug('Send to Line OA:'+messageNoti+' mappingKey:'+mappingKey);
      }else{
         utils.logDebug('No Send to Line OA token_customer:'+userLineToke.token_customer+' mappingKey:'+mappingKey);
      }

   } catch (error) {
      const requestErrorLog = await errorLogData.createErrorLog({
      error_from: "Patois Api",
      error_name: "Catch error",
      error_func_name: "sendNotiLineOA",
      error_code: "",
      error_massage: error.message
      },userId ? userId : '');

      // return error.message;
      throw error;
   }
 }


module.exports = {
  sendMaxPoints,
  sendNotiPointLineOA,
};
