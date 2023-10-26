"use strict";

const fs = require("fs-extra");
const { join } = require("path");
const jwt = require("jsonwebtoken");
const config = require("../config");
var Buffer = require('buffer/').Buffer
const crypto = require('crypto');
var CryptoJS = require("crypto-js");
var winston = require("winston");
const uuid = require("uuid");
const { AzureBlobTransport } = require('winston-azure-storage-transport');
const { BlobService } = require('azure-storage');
let SERVER_EXCEPTION_MESSAGE = "System error. Please contact the administrator.";

const loadSqlQueryies = async (folderName) => {
  const filePath = join(process.cwd(), "data", folderName);
  const files = await fs.readdir(filePath);
  const sqlFiles = await files.filter((f) => f.endsWith("sql"));
  const queries = {};

  for (const sqlFile of sqlFiles) {
    const query = await fs.readFileSync(join(filePath, sqlFile), {
      encoding: "UTF-8",
    });
    queries[sqlFile.replace(".sql", "")] = query;
  }
  return queries;
};

const isValidEmail = async (email) => {
  // const re =
  //   /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  // return re.test(String(email).toLowerCase());
  const regex = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
  if (!email || regex.test(email) === false) {
      return false;
  }
  return true;
};

const isValidTel = async (tel) => {
  const re = /^((\+)33|0)[1-9](\d{2}){4}$/;
  return re.test(String(tel).toLowerCase());
};

const getUser = async (token) => {
  const authHeader = token;
  let usered = {
    email: null,
    exp: null,
    groupsid: null,
    iat: null,
    isBindMaxcard: null,
    name: null,
    patoisMaxcardId: null,
    tel: null,
    userId: null,
    error: null
  };
  try {
    if (authHeader) {
      const token = authHeader.split(" ")[1];

      await jwt.verify(token, config.token, (err, user) => {
        if (err) {
          if(err.name === "TokenExpiredError") {
            usered.error = "Token is expired!";
          } else {
            usered.error = "Token is not valid!";
          }
        } 
        usered = user ? user : usered;
      });
    } else {
      usered.error = "You are not authenticated!";
    }
  } catch (error) {
    usered.error = error.message;
  }
  return usered;
};

const getUserRefresh = async (rtoken) => {
  const authHeader = rtoken;
  let usered = null;
  try {
    if (authHeader) {
      const rtoken = authHeader.split(" ")[1];

      await jwt.verify(rtoken, config.rtoken, (err, user) => {
        if (err) usered.error = "Token is not valid!";
        usered = user;
      });
    } else {
      usered.error = "You are not authenticated!";
    }
  } catch (error) {
    usered.error = error.message;
  }
  return usered;
};

const getBytes = (str) => {
  var bytes = [], char;
  str = encodeURI(str);

  while (str.length) {
    char = str.slice(0, 1);
    str = str.slice(1);

    if ('%' !== char) {
      bytes.push(char.charCodeAt(0));
    } else {
      char = str.slice(0, 2);
      str = str.slice(2);

      bytes.push(parseInt(char, 16));
    }
  }

  return bytes;
}
const getString = (utftext) => {

  var result = "";

  for (var i = 0; i < utftext.length; i++) {

      result += String.fromCharCode(parseInt(utftext[i], 10));

  }

  return result;

}
const getRandomOTP = () => {
  return Math.floor(100000 + Math.random() * 900000);
}
const getRefCode = (length,isCharAndNumber) => {
    var result = '';
    var characters = isCharAndNumber ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    // var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

const decryptText = (input, key) => {
  const bytesToBeDecrypted = Buffer.from(input, 'base64'); 
  const passwordBytes = getBytes(key); 
  
  let hash   = CryptoJS.SHA256(passwordBytes);
  // let buffer = Buffer.from(hash.toString(CryptoJS.enc.Hex), 'hex');
  // let array  = new Uint8Array(buffer);

  const bytesDecrypted = CryptoJS.AES.decryptText(bytesToBeDecrypted, hash);
  const result = getString(bytesDecrypted); 
  return result;
}
const decrypt = (input, key) => {
  try {
    const bytesToBeDecrypted = Buffer.from(input, 'utf-8').toString(); 

    var bytes  = CryptoJS.AES.decrypt(bytesToBeDecrypted, key);
    var originalText = bytes.toString(CryptoJS.enc.Utf8);

    console.log(originalText);
    return originalText;
  } catch (err) {
    throw err
  }
}
const calculateFibonacciValue = (number) => {
   let s = 0;
   if(number === 0) {
     return s;
   }
   if(number === 1) {
     s += 1;
     return s;
   } else {
     return (calculateFibonacciValue(number - 1) + calculateFibonacciValue(number - 2));
   }

}
const getDateTime = () => {
  const now = new Date();
            const day =
              now.getFullYear() +
              "-" +
              ("0" + (now.getMonth() + 1)).slice(-2) +
              "-" +
              ("0" + now.getDate()).slice(-2);
            "_" +
              ("0" + now.getHours()).slice(-2) +
              "_" +
              ("0" + now.getMinutes()).slice(-2) +
              "_" +
              ("0" + now.getSeconds()).slice(-2);
  return day;
}


const getDateTimeNowFormat1 = () => {
   // output example 2022/06/29 17:37:10
   const now = new Date();
            const day =
              now.getFullYear() +
              "/" +
              ("0" + (now.getMonth() + 1)).slice(-2) +
              "/" +
              ("0" + now.getDate()).slice(-2)+
            " " +
              ("0" + now.getHours()).slice(-2) +
              ":" +
              ("0" + now.getMinutes()).slice(-2) +
              ":" +
              ("0" + now.getSeconds()).slice(-2);
              //console.log(day)
   return day;
 }
 

const getDiffTimeInMinutes  = (startDateStr, endDateStr) =>{
   // Format '2022/10/09 12:00:10'
   var startTime = new Date(startDateStr); 
   var endTime = new Date(endDateStr);
   var difference = endTime.getTime() - startTime.getTime(); // This will give difference in milliseconds
   var resultInMinutes = Math.round(difference / 60000);

   //console.log(resultInMinutes)
   return resultInMinutes;
}

const getDiffTimeInSeconds  = (startDateStr, endDateStr) =>{
   // Format '2022/10/09 12:00:10'
   var startTime = new Date(startDateStr); 
   var endTime = new Date(endDateStr);
   var difference = endTime.getTime() - startTime.getTime(); // This will give difference in milliseconds
   var resultInSeconds = difference / 1000;

   //console.log(resultInSeconds)
   return resultInSeconds;
}



const AES_encrypt_object = (dataObject) => {
   try {
     var ciphertext = CryptoJS.AES.encrypt(JSON.stringify(dataObject), config.REACT_APP_SECRET_KEY).toString();
     console.log(ciphertext);
     return ciphertext;
   } catch (err) {
     throw err
   }
 }

const AES_encrypt = (dataDecryptTextStr) => {
   try {
     var ciphertext = CryptoJS.AES.encrypt(dataDecryptTextStr, config.REACT_APP_SECRET_KEY).toString();
     console.log(ciphertext);
     return ciphertext;
   } catch (err) {
     throw err
   }
 }

 const AES_decrypt = (dataEncryptedStr) => {
    try {
      var text_  = CryptoJS.AES.decrypt(dataEncryptedStr, config.REACT_APP_SECRET_KEY);
      text_ = text_.toString(CryptoJS.enc.Utf8);
      console.log(text_);
      return text_;
    } catch (err) {
      throw err
    }
  }


  const AES_encrypt_decrypt = (dataDecryptTextStr) => {
   try {

     var ciphertext = CryptoJS.AES.encrypt(dataDecryptTextStr, config.REACT_APP_SECRET_KEY).toString();
     console.log(ciphertext);


     
     var text_  = CryptoJS.AES.decrypt(ciphertext, config.REACT_APP_SECRET_KEY);
     text_ = text_.toString(CryptoJS.enc.Utf8);
     console.log(text_);


    // var CryptoJS = require("crypto-js");
   var data = JSON.stringify({abc: 'xyz'});

   var encrypted = CryptoJS.AES.encrypt(data, "my-secret");
   console.log(encrypted.toString());

   var decrypted = CryptoJS.AES.decrypt(encrypted.toString(), "my-secret");
   var object = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
   console.log(object);
   console.log(object.abc);

     return text_;
   } catch (err) {
     throw err
   }
 }

const mappingRequestResponse = () => {
  return uuid.v4();
}

const requestMsg = (req, mappingKey) => {
  const requestMsg = getUser(req.headers.token).then((user) => {
    return {
      a_type:"REQUEST",
      c_method:req.method,
      b_url:req.url,
      ip_address: `[${ req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress }]`,
      d_token:req.headers.token,
      e_userId: user ? user.userId : '',
      f_mappingKey:mappingKey,
      data_query:req.query,
      data_body:req.body,
      lineId: user ? user.lineId : '',
    }
  })
  console.log(requestMsg);
  return requestMsg
}

const responseMsg = (res, data, req, mappingKey,) => {

  headerSet(res);

  const responseMsg = {
    a_type:"RESPONSE",
    c_method:req.method,
    b_url:req.url,
    ip_address: `[${ req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress }]`,
    d_mappingKey:mappingKey,
    e_data:data
 }   
 console.log(responseMsg);
 return responseMsg
  
}

const headerSet = (res) => {
  res.setHeader('X-Frame-Option', 'deny');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Content-Security-Policy', 'default-src \'self\'; object-src \'none\'');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Expect-CT', 'enforce, max-age=86400');
  res.setHeader('Permission-Policy', 'fullscreen=(), geolocation=()');
}

const errorMsg = (error, mappingKey) => {
  return {
     message:SERVER_EXCEPTION_MESSAGE+' '+new Date().toLocaleString('en-US', {
        timeZone: 'Asia/Bangkok'
    }) + ' '+mappingKey,
     stack:error.stack,
     errorCode:'E_EXCEPTION'
  }   
}

 const blobTransport = new AzureBlobTransport({
  blobs: new BlobService("patiosapplicationlog","pASr6EShtij7amC6S4545Q/BhMEEnUxGrdF9/9GfT/21+RhSzd6m9d4B9Y2l/FTqDBICmq9wXtrF+AStap6RqA=="),
  containerName: config.LOG_CONTAINER_NAME,
  blobName: () => {
    const nowLocal = new Date().toLocaleString('en-US', {timeZone: 'Asia/Bangkok',hour12: false}).split(", ");
    const date = nowLocal[0].split("/");
    const time = nowLocal[1].split(":");
    const folderName = date[2] + "-" + ("0" + (date[0])).slice(-2) + "-" + ("0" + date[1]).slice(-2);
    const fileName = `api_patois.${date[2] + "-" + ("0" + (date[0])).slice(-2) + "-" + ("0" + date[1]).slice(-2) + "-" + ("0" + (time[0])).slice(-2)}.log`
    return [`${folderName}`,`${fileName}`].join('/');
  },
});

const timezoned = () => {
  return new Date().toLocaleString('en-US', {
      timeZone: 'Asia/Bangkok'
  });
}

const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.combine(
    winston.format.errors({ stack: true }),
    winston.format.timestamp({ format: timezoned }),
    winston.format.splat(),
    winston.format.json()
  ),
  transports: [ blobTransport ],
});

//  var logger = winston.createLogger({
//    format: winston.format.combine(
//       winston.format.errors({ stack: true }),
//        winston.format.timestamp({ format: timezoned }),
//        winston.format.splat(),
//        winston.format.json()
//    ),
//    transports: [
//      new (azureBlobTransport)({
//        account: {
//          name: "patiosapplicationlog",
//          key: "pASr6EShtij7amC6S4545Q/BhMEEnUxGrdF9/9GfT/21+RhSzd6m9d4B9Y2l/FTqDBICmq9wXtrF+AStap6RqA=="
//        },
//        containerName: config.LOG_CONTAINER_NAME,
//        blobName: "api_patois",
//        level: "debug",
//        bufferLogSize : 1,
//        syncTimeout : 0,
//        rotatePeriod : "YYYY-MM-DD-HH",
//        eol : "\n"
  
//      })
//    ]
//  });



const logDebug = (text) => {
   logger.debug(text);
   console.log(text);
 }


 const validNationalID = (id) => {
  let sum = 0
  if (id.length != 13) return false;
  // STEP 1 - get only first 12 digits
  for (let i = 0; i < 12; i++) {
    // STEP 2 - multiply each digit with each index (reverse)
    // STEP 3 - sum multiply value together
    sum += parseInt(id.charAt(i)) * (13 - i);
  }
  // STEP 4 - mod sum with 11
  let mod = sum % 11;
  // STEP 5 - subtract 11 with mod, then mod 10 to get unit
  let check = (11 - mod) % 10;
  // STEP 6 - if check is match the digit 13th is correct
  if (check == parseInt(id.charAt(12))) {
    return true;
  }
  return false;
}

module.exports = {
  loadSqlQueryies,
  isValidEmail,
  isValidTel,
  getUser,
  getUserRefresh,
  getBytes,
  getRandomOTP,
  getRefCode,
  decryptText,
  decrypt,
  getString,
  calculateFibonacciValue,
  getDateTime,
  getDateTimeNowFormat1,
  getDiffTimeInMinutes,
  getDiffTimeInSeconds,
  AES_encrypt_object,
  AES_encrypt,
  AES_decrypt,
  AES_encrypt_decrypt,
  mappingRequestResponse,
  requestMsg,
  responseMsg,
  errorMsg,
  logger,
  logDebug,
  validNationalID,
};
