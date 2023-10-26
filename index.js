'use strict';
const express = require('express');
const config = require('./config');
const cors = require('cors');
const bodyParser = require('body-parser');
const request = require('request');
const swaggerUI = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const utils = require('./data/utils');
const routes = require('./routes');
const line = require('@line/bot-sdk');
const sql = require("mssql");
const cluster = require('cluster');
const totalCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  console.log(`Total Number of CPU Counts is ${totalCPUs}`);

  for (var i = 0; i < totalCPUs; i++) {
    cluster.fork();
  }
  cluster.on('online', (worker) => {
    console.log(`Worker Id is ${worker.id} and PID is ${worker.process.pid}`);
  });
  cluster.on('exit', (worker) => {
    console.log(
      `Worker Id ${worker.id} and PID is ${worker.process.pid} is offline`
    );
    console.log("Let's fork new worker!");
    cluster.fork();
  });
} else {
  const LineConfig = {
    channelAccessToken:
      'UZvBtd4VoBzzBpmcLws8xFvbx1NsHfm6ebHb3j89l6PyVgKlILZAyvOJDzfhh8I8hfihkGvzPh2kdtqrD5gKKNMvGm7dX2IRk9b2sP9QUahM5d8KEX9nkcj5tELv4U8I6cPJ9CcP9DVm1CUUkxJ/lwdB04t89/1O/w1cDnyilFU=',
    channelSecret: '844c42f8529b28000964415e59ab65ab',
  };

  const client = new line.Client(LineConfig);
  const app = express();

  const whitelist = [
    'https://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:3000',
    'http://localhost:4000',
    'http://localhost:5000',
    'https://uat-patois-api-asv.azurewebsites.net',
    'https://uat-patois-app-asv.azurewebsites.net',
    'https://dev-patois-app-asv.azurewebsites.net',
    'https://prd-patois-app-asv.azurewebsites.net',
    'https://prd-patois-api-asv.azurewebsites.net',
    'https://prd-front-admin-patois.azurewebsites.net',
    'https://prd-web-admin-patois.azurewebsites.net',
    'https://uat-patois-webadmin-front.azurewebsites.net',
    'https://uat-patois-webadmin-back.azurewebsites.net',
    'https://patois.pt.co.th',
    'https://ptnewcrm-qas.pt.co.th:40443',
    'https://pcp.pt.co.th:8082',
    'https://dev-patois-newweb-asv.azurewebsites.net',
    'https://uat-patois-newweb-asv.azurewebsites.net',
    'https://prd-patois-newweb-asv.azurewebsites.net',
    'https://dev-patois-new-app-asv.azurewebsites.net',
    'https://uat-patois-new-app-asv.azurewebsites.net',
    'https://patois.com',
    'https://dev-patois.pt.co.th',
    'https://uat-patois.pt.co.th',
    'https://uat-new-patois-app.azurewebsites.net',
  ];

  const corsOptions = {
    origin: function (origin, callback) {
      if (!origin || whitelist.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  };
  app.use(cors(corsOptions));
  app.use(bodyParser.json());
  
  if (process.env.NODE_ENV_SERVICE !== 'prd') {
    app.use('/api/docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument));
  }

  app.use('/api/shop', routes.shopRoutes.routes);
  app.use('/api/shop', routes.imageRoutes.routes);
  app.use('/api/shop', routes.masterBistroRoute.routes);
  app.use('/api/shop', routes.merchantRoutes.routes);
  app.use('/api/shop', routes.activityRoute.routes);
  app.use('/api/shop', routes.contentRoutes.routes);
  
  app.get('/healthCheck', async (req, res) => {
    try {
      let pool = await sql.connect(config.sql);
      const result = await pool.request().query`SELECT FORMAT (getdate(), 'dd/MM/yyyy hh:mm:ss') as dateTime`
      res.send(`start ${process.env.NODE_ENV_SERVICE}-patois-shop-api Success [${result.recordset[0].dateTime}]`);
    } catch (error) {
      res.send(`start ${process.env.NODE_ENV_SERVICE}-patois-shop-api Fail [ERROR ${error}]`);
    }
  });
  app.get('/api/fibonacci', (request, response) => {
    console.log(
      `Worker Process Id - ${cluster.worker.process.pid} has accepted the request!`
    );
    let number = utils.calculateFibonacciValue(
      Number.parseInt(request.query.number)
    );
    response.send(`<h1>${number}</h1>`);
  });
  app.use('/images', express.static(__dirname + '/assets/images/'));
  app.use('/store/:fileName', (req, res) => {
    var fs = require('fs'),
      http = require('http'),
      https = require('https');

    var Stream = require('stream').Transform;
    const config = require('./config');
    var azure = require('azure-storage');
    const { fileName } = req.params;
    var connString = config.AZURE_STORAGE_CONNECTION_STRING;
    var container = config.AZURE_STORAGE_CONTAINER;
    //var blobName = `wongnok_/wn/PATOIS_2021-10-01 10:26:20_d80cb6d0-24c2-11ec-bc96-25c738a5a0cd_f1.png`;
    var blobName = `wongnok_/wn/${fileName}`;
    var blobService = azure.createBlobService(connString);

    // Create a SAS token that expires in an hour
    // Set start time to five minutes ago to avoid clock skew.
    var startDate = new Date();
    startDate.setMinutes(startDate.getMinutes() - 5);
    var expiryDate = new Date(startDate);
    expiryDate.setMinutes(startDate.getMinutes() + 60);

    var sharedAccessPolicy = {
      AccessPolicy: {
        Permissions: [azure.BlobUtilities.SharedAccessPermissions.READ], //grent read permission only
        Start: startDate,
        Expiry: expiryDate,
      },
    };

    var sasToken = blobService.generateSharedAccessSignature(
      container,
      blobName,
      sharedAccessPolicy
    );

    var response = {};

    response.image = blobService.getUrl(container, blobName, sasToken);
    var client = https;

    client
      .request(response.image, function (response) {
        var data = new Stream();

        response.on('data', function (chunk) {
          data.push(chunk);
        });

        response.on('end', function () {
          res.write(data.read());
          return res.end();
        });
      })
      .end();
  });
  app.post('/webhook', (req, res) => {
    let reply_token = req.body.events[0].replyToken;
    reply(reply_token);
    res.sendStatus(200);
  });
  app.post('/callback', (req, res) => {
    let get = req;

    pushMessage('Ud038b772d585aafca32c7d4a660c24cf');
    res.sendStatus(200);
  });
  // event handler
  function handleEvent(event) {
    if (event.type !== 'message' || event.message.type !== 'text') {
      // ignore non-text-message event
      return Promise.resolve(null);
    }

    // create a echoing text message
    const echo = { type: 'text', text: event.message.text };

    // use reply API
    return client.replyMessage(event.replyToken, echo);
  }
  function reply(reply_token) {
    let headers = {
      'Content-Type': 'application/json',
      Authorization:
        'Bearer k+n+stw//gr98ZxKgkVHW/vBgGwdNaiGA4D7DB1+OSX9FbDwD09KafACpnhjc2YjrDW/R5CsVTd+NaV+ghwrA3pVirmtxxNzhOvJCLpnIAOxcD/UZsyVdf2mOwLy6mfqlAb/vP2A1JCtgQjeURqJ8QdB04t89/1O/w1cDnyilFU=',
    };
    let body = JSON.stringify({
      replyToken: reply_token,
      messages: [
        {
          type: 'text',
          text: 'Hello',
        },
        {
          type: 'text',
          text: 'How are you?',
        },
      ],
    });
    request.post(
      {
        url: 'https://api.line.me/v2/bot/message/reply',
        headers: headers,
        body: body,
      },
      (err, res, body) => {
        console.log('status = ' + res.statusCode);
      }
    );
  }

  function pushMessage(id) {
    let headers = {
      'Content-Type': 'application/json',
      Authorization:
        'Bearer t3DmfsANBccWaEPaBnbYPuC08pqt5E0x/0Yfcu81UeeqiEfbxDuMqoAOG6MMouw3YyJNlJtFknF4s8gD8Ll25xqIcH/GMMmPkkQ6ca6iWTMxLIum4W9GWx1wzo/6eLg72eBKwasFrcUc/3WwiEGLVwdB04t89/1O/w1cDnyilFU=',
    };
    let body = JSON.stringify({
      to: id,
      messages: [
        {
          type: 'text',
          text: 'Push Text Test',
        },
        {
          type: 'text',
          text: 'สวัสดี',
        },
      ],
    });
    request.post(
      {
        url: 'https://api.line.me/v2/bot/message/push',
        headers: headers,
        body: body,
      },
      (err, res, body) => {
        console.log('status = ' + res.statusCode);
      }
    );
  }
  app.listen(config.port, () => {
    console.log('v1');
    console.log(`Server is Listing on ${process.env.HOST_URL}`);
  });
}
