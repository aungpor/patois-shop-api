"use strict";

const utils = require("./utils");
const config = require("../config");
const sql = require("mssql");
const errorLogData = require("../data/errorLog");
const axios = require('axios');

let SERVER_EXCEPTION_MESSAGE = "System error. Please contact the administrator.";

 const handleCampaignSendPromo = async (campaign_data, usered, mappingKey, req) => {

   try {
         utils.logDebug('handleCampaignSendPromo Run.... mappingKey:'+mappingKey);      
         utils.logDebug('Send to /api/campaign/sendCampaignPromo API data campaign_data:'+JSON.stringify(campaign_data)+' mappingKey:'+mappingKey);

         const ipAddress = req.headers['x-forwarded-for'].split(",").length > 1 ? req.headers['x-forwarded-for'].split(",")[0] : req.headers['x-forwarded-for'];
         const device = req.headers['user-agent'];

         let sendCampaignPromoResult = await axios({
            url: `${config.MISSION_API}/api/campaign/sendCampaignPromo`,
            method: 'POST',
            headers: { 
               'token': req.headers.token, 
               'Content-Type': 'application/json'
            },
            data: {...campaign_data, ipAddress, device}
         })
            .then(data => {
            return data.data.data
            })
            .catch(err => {
            throw err
            })
         utils.logDebug('handleCampaignSendPromo Complete  mappingKey:'+mappingKey);
         utils.logDebug('Send to /api/campaign/sendCampaignPromo API data sendCampaignPromo:'+JSON.stringify(sendCampaignPromoResult)+' mappingKey:'+mappingKey);
         return sendCampaignPromoResult;

   } catch (error) {
      const requestErrorLog = await errorLogData.createErrorLog({
      error_from: "Patois Api",
      error_name: "Catch error",
      error_func_name: "handleCampaignSendPromo",
      error_code: "",
      error_massage: error.message
      },usered.userId ? usered.userId : '');


      // return error.message;
      throw error;
   }


 }


module.exports = {
   handleCampaignSendPromo,

};
