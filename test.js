'use strict';

// Imports dependencies and set up http server
const
  express = require('express'),
  bodyParser = require('body-parser'),
  app = express().use(bodyParser.json()); // creates express http server

// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log('webhook is listening'));
// Creates the endpoint for our webhook
app.post('/webhook', (req, res) => {

  let body = req.body;

  // Checks this is an event from a page subscription
  if (body.object === 'page') {

    // Iterates over each entry - there may be multiple if batched
    body.entry.forEach(function(entry) {

      // Gets the message. entry.messaging is an array, but
      // will only ever contain one message, so we get index 0
      let webhook_event = entry.messaging[0];
      console.log(webhook_event);
    });

    // Returns a '200 OK' response to all requests
    res.status(200).send('EVENT_RECEIVED');
  } else {
    // Returns a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }

});
// Adds support for GET requests to our webhook
app.get('/webhook', (req, res) => {

  // Your verify token. Should be a random string.
  let VERIFY_TOKEN = "<YOUR_VERIFY_TOKEN>"

  // Parse the query params
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];

  // Checks if a token and mode is in the query string of the request
  if (mode && token) {

    // Checks the mode and token sent is correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {

      // Responds with the challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);

    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
});

const PAGE_ACCESS_TOKEN= process.env.access_token
// Handles messages events
function handleMessage(sender_psid, received_message) {
  let response;
  //check if the message contains text
  if(received_message.text){
    //create the payload for a basic text message
    response={
      "text": 'message sent by you: "${received_message.text}". Now send an image!'
    }
  }else if (received_message.attachments) {
    //gets the URL of the message attachment
    let attachment_url = received_message.attachments[0].payload.url;
    response={
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "generic",
          "elements": [{
            "title": "Is this the right picture?",
            "subtitle": "Tap a button to answer.",
            "image_url": attachment_url,
            "buttons": [
              {
                "type": "postback",
                "title": "Yes!",
                "payload": "yes",
              },
              {
                "type": "postback",
                "title": "No!",
                "payload": "no",
              },
              {
                "type": "postback",
                "title": "Who are you?",
                "payload": "whoareyou",
              }
            ],
          }]
        }
      }
    }
  }
  //sends the response message
  callSendAPI(sender_psid, response);
}

// Handles messaging_postbacks events
function handlePostback(sender_psid, received_postback) {
  let response;
  //gets the payload for the postback
  let payload=received_postback.payload;
  //set tje response based on the postback payload

  if (payload==='yes') {
    response= {"text": "Thank you!"}
  }else if (payload=== 'no') {
    response = {"text": "Please try sending another image."}
  }else if (payload === 'whoareyou') {
    response = {"text": "I am your personal clinic, I can help do a lot of stuffs for you."}
  }
  //send the message to acknowledge the postback
  callSendAPI(sender_psid, response);
}

// Sends response messages via the Send API
function callSendAPI(sender_psid, response) {
  //now constructing the message body
  let message={
    "recipient":{
      "id": sender_psid
    },
    "message": response
  }
  //send the HTTP request to the messenger platform
  request({
    "uri": "https://graph.facebook.com/v2.6/me/messages",
    "qs": {"access_token": PAGE_ACCESS_TOKEN},
    "method": "POST",
    "json": request_body
  },
  (err, res, body)=>{
    if (!err) {
      console.log('message sent!');
    }else {
      console.log("Unable to send message:" +err);
    }
  });
}
