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
