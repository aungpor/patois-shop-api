"use strict";

const utils = require("./utils");
const config = require("../config");
const sql = require("mssql");
const errorLogData = require("../data/errorLog");
const axios = require('axios');

let SERVER_EXCEPTION_MESSAGE = "System error. Please contact the administrator.";

 const handleMissoinByMissionCode = async (mission_code, usered, mappingKey, req, mission_step_code = null) => {

   try {
         utils.logDebug('handleMissoinByMissionCode Run.... mappingKey:'+mappingKey);
         utils.logDebug('Send to /api/campaign/mission/handleMissoinByMissionCode API data mission_code:'+mission_code+ ' mission_step_code:'+mission_step_code+' mappingKey:'+mappingKey);
         const ipAddress = req.headers['x-forwarded-for'].split(",").length > 1 ? req.headers['x-forwarded-for'].split(",")[0] : req.headers['x-forwarded-for'];
         const device = req.headers['user-agent'];
         let handleMissoinResult = await axios({
            url: `${config.MISSION_API}/api/campaign/mission/handleMissoinByMissionCode`,
            method: 'POST',
            headers: { 
               'token': req.headers.token, 
               'Content-Type': 'application/json'
            },
            data: {
               "mission_code": mission_code,
               "mission_step_code": mission_step_code,
               "ipAddress":ipAddress,
               "device":device,
            }
         })
            .then(data => {
            return data.data.data
            })
            .catch(err => {
            throw err
            })
         utils.logDebug('handleMissoinByMissionCode Complete  mappingKey:'+mappingKey);
         utils.logDebug('Send to /api/campaign/mission/handleMissoinByMissionCode API data handleMissoinResult:'+JSON.stringify(handleMissoinResult)+' mappingKey:'+mappingKey);
         return handleMissoinResult;

   } catch (error) {
      const requestErrorLog = await errorLogData.createErrorLog({
      error_from: "Patois Api",
      error_name: "Catch error",
      error_func_name: "handleMissoinByMissionCode",
      error_code: "",
      error_massage: error.message
      },usered.userId ? usered.userId : '');


      // return error.message;
      throw error;
   }


 }


module.exports = {
   handleMissoinByMissionCode,

};
