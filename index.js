"use strict"; // Tells the program to ensure that each variable is declared with var,let or const else an error will occur
/*
    Only replies with a echo of what you type
    you need to create environment variables for CHATTOKEN and PAGETOKEN
*/

const request = require("request");
const express = require("express");
const bodyParser = require("body-parser");
const server = express().use(bodyParser.json()); //creates an express http server
// above code could be also written as "server.use(bodyParser.json());"

// passes the value of port number in the environment variable or port 5000
const port = process.env.PORT || 5000;
const MYAPPTOKEN = process.env.CHATTOKEN1;
const token = process.env.PAGETOKEN;
const bytechef_url = "https://scontent.fktp1-1.fna.fbcdn.net/v/t1.0-9/110312313_113476020449746_3592402624772909116_n.png?_nc_cat=109&_nc_sid=09cbfe&_nc_ohc=don-tGMLOxgAX8c3pTR&_nc_ht=scontent.fktp1-1.fna&oh=081c046c3a95a155d8be9c495cc20be1&oe=5F3EE7C5";
const testRecipe_url = "https://jamaicans.com/wp-content/uploads/yellow-yam-with-callaloo-2~s800x800.jpg"
let recipeName;
let dish = [];

server.listen(port, ()=>{ console.log("Webhook is listening on port "+ port)});

/* ROUTES */
server.get('/',(request, response)=>{
    response.send("This is my webhook example;");
});
server.post("/webhook",(request, response)=>{
    let body = request.body; // post data from the request

    //checks if this is an event from a page subscription

    if (body.object === 'page'){
        
        //Iterates over the entries there may be multiple if its batched.
        body.entry.forEach(function(entry){
            // Gets the message. entry.messaging is an array but  will only ever contain one message, so we use index[0]
            let webhook_event = entry.messaging[0];

            // get the senders Page Scoped ID
            let sender_psid = webhook_event.sender.id;
            console.log("We got sender ID: "+sender_psid);

             // Check if the event is a message or postback and
             // pass the event to the appropriate handler function
            if (webhook_event.message) {
                handleMessage(sender_psid, webhook_event.message);        
            } else if (webhook_event.postback) {
                handlePostback(sender_psid, webhook_event.postback);
            }
        });
        // returns '200 OK' status code to all requests
        response.status(200).send('EVENT_RECIEVED');
    }else{
        // returns '404' if the event is not from a page subscription
        console.log('something went wrong');
        response.sendStatus(404);
    }



});

// Handles messages sent to the bot
function handleMessage(sender_psid, received_message) {

    let messageText = received_message.text;
    let messageAttachments = received_message.attachments;
    let quickReply = received_message.quick_reply;

    let response;
    if (quickReply){
        let quickReplyPayload = quickReply.payload;
        console.log("Reply for message %s was payload %s", messageText, quickReplyPayload);

        // TODO: create Func
        sendQuickReply(sender_psid, quickReplyPayload);

    }
    // Checks if the response is the greeting
    else if(messageText === "Hey" || messageText === "hey" || messageText === "hi" || messageText === "Hi" || messageText === "Hello" || messageText === "hello" || messageText === "chef" || messageText === "recipe" || messageText === "help" || messageText === "Help"){
        sendGreetMessage(sender_psid);
            case "hello":
                sendGreetMessage(sender_psid);
                break;
            default:
                sendFallbackMessage(sender_psid);
                break;
            
        }else{
            sendFallbackMessage(sender_psid);
        }

}

// Handles postbacks from templates
function handlePostback(sender_psid, received_postback) {
    let response;
    
    // Get the payload for the postback
    let payload = received_postback.payload;
  
    // Set the response based on the postback payload
    console.log("This is the payload "+payload);
    switch(payload){
        case "no":
            response = { "text": "Thank you for choosing byte-Chef, Please enjoy the rest of your day" }
            break;
        case 'yes' :
            response = { "text": "Thank you!\n"+"Please Choose the ingredient you have.",
            "quick_replies":[
                {
                "content_type":"text",
                "title":"Chicken",
                "payload":"chicken",
                },{
                "content_type":"text",
                "title":"Fish",
                "payload":"fish" 

                },{
                    "content_type":"text",
                    "title":"Beef",
                    "payload":"beef" 
        
                },{
                    "content_type":"text",
                    "title":"Meat Alternate",
                    "payload":"alternate" 
        
                }
            ]
            }
            break;
            case "next":
                recipeName = "Calaloo and Dumpling";

                response = {
                    "attachment": {
                        "type": "template",
                        "payload" : {
                            "template_type":"generic",
                            "elements":[{
                                "title": recipeName,
                                "subtitle": "Tap a button to answer.",
                                "image_url": testRecipe_url,
                                "buttons": [{
                                    "type": "web_url",
                                    "title": "Teach me",
                                    "url": "https://jamaicans.com/callaloosaltfish/",
                                },
                                {
                                    "type": "postback",
                                    "title": "Show more",
                                    "payload": "next",
                                }]
                            }]
                        }
                    }
                }
                break;


        
        }

    // Send the message to acknowledge the postback
    callSendAPI(sender_psid, response);
  }

function callSendAPI(sender_psid, response, ) {
    // Construct the message body
    let request_body = {
      "recipient": {
        "id": sender_psid
      },
      "message": response
    }

    // Send the HTTP request to the Messenger Platform
    request({
        "uri": "https://graph.facebook.com/v2.6/me/messages",
        "qs": { "access_token": token },
        "method": "POST",
        "json": request_body
    }, (err, response, body) => {
        if (!err) {
        console.log('message sent!')
        } else {
        console.error("Unable to send message:" + err);
        }
    }); 
}
  

// Adds support for GET requests to our webhook

server.get('/webhook',(request, response)=>{

    // Your verify token. Should be a random String.
    let VERIFY_TOKEN = MYAPPTOKEN;

    // Parse the query params
    
    let mode = request.query['hub.mode'];
    let token = request.query['hub.verify_token'];
    let challenge = request.query['hub.challenge'];
    console.log();
    // Checks if a token and mode is in the query string of the request
    if(mode && token){
        // Checks the mode and the token sent is correct
        if (mode === 'subscribe' && token === VERIFY_TOKEN){
            // Responds witb the challenge token from the request
            console.log('WEBHOOK_VERIFIED');
            response.status(200).send(challenge);

        }else{
            // 403 Forbidden if tokens do not match
            response.sendStatus(403);
        }
    }

});


function sendGreetMessage(sender_psid){
    let response = {
        "attachment": {
            "type": "template",
            "payload" : {
                "template_type":"generic",
                "elements":[{
                    "title": "Hello and Welcome to Byte Chef",
                    "subtitle": "Tap a button to answer.",
                    "image_url": bytechef_url,
                    "buttons": [{
                        "type": "postback",
                        "title": "Let's Begin",
                        "payload": "yes",
                    },
                    {
                        "type": "postback",
                        "title": "Already a chef",
                        "payload": "no",
                    }]
                }]
            }
        }
        }
        callSendAPI(sender_psid,response);
    }
    function sendFallbackMessage(sender_psid){
        let response = {
            "text": "This is not one of the commands. please Try again"
            
        }
        callSendAPI(sender_psid,response);
    }
function sendQuickReply(sender_psid, payload){
    dish.push(payload);
    console.log(dish);
    let response;
    console.log("In sendQuickReply func and payload is "+payload)
    if (payload === "no"){
            response={
                text : "Thank you for using our service. Good bye"
            }
        }else if(payload === "alternate"){
            response = { "text": `What meat alternate do you have?`,
                    "quick_replies":[
                        {
                        "content_type":"text",
                        "title":"Ackee",
                        "payload":"ackee",
                        },{
                        "content_type":"text",
                        "title":"PakChoy",
                        "payload":"pakchoy" 
        
                        },{
                            "content_type":"text",
                            "title":"Calaloo",
                            "payload":"calaloo" 
                
                        },{
                            "content_type":"text",
                            "title":"Already have Takeout",
                            "payload":"no" 
                
                        }
                    ]
            }
        }else if(payload === "chicken" || payload === "fish"|| payload === "beef" || payload === "ackee" || payload === "calaloo" || payload === "pakchoy"){
        response = { "text": `What are the staples you have in the kitchen?`,
            "quick_replies":[
                {
                "content_type":"text",
                "title":"Rice",
                "payload":"rice",
                },{
                "content_type":"text",
                "title":"Flour",
                "payload":"flour" 

                },{
                    "content_type":"text",
                    "title":"Cornmeal",
                    "payload":"cornmeal" 
        
                },{
                    "content_type":"text",
                    "title":"Already have Takeout",
                    "payload":"no" 
        
                }
            ]
        }
    }else if(payload === "cornmeal" || payload === "flour"){
        response = { "text": `Any ground provisions?`,
            "quick_replies":[
                {
                "content_type":"text",
                "title":"Yam",
                "payload":"yam",
                },{
                "content_type":"text",
                "title":"Pumpkin",
                "payload":"pumpkin" 

                },{
                    "content_type":"text",
                    "title":"none",
                    "payload":"none" 
        
                }
            ]
        } 
    }else if(payload === "none" || payload === "rice" || payload === "pumpkin" || payload === "yam"){
        console.log(dish);
        response = {
            "attachment": {
                "type": "template",
                "payload" : {
                    "template_type":"generic",
                    "elements":[{
                        "title": "Calaloo Soup",
                        "subtitle": "Tap a button to answer.",
                        "image_url": "https://imagesvc.meredithcorp.io/v3/mm/image?url=https%3A%2F%2Fimages.media-allrecipes.com%2Fuserphotos%2F344324.jpg&w=915&h=915&c=sc&poi=face&q=85",
                        "buttons": [{
                            "type": "web_url",
                            "title": "Teach me",
                            "url": "https://www.allrecipes.com/recipe/182784/traci-bs-callaloo-soup/",
                        },
                        {
                            "type": "postback",
                            "title": "Show more",
                            "payload": "next",
                        }]
                    }]
                }
            }
        }
    }
        

        
            
        callSendAPI(sender_psid,response);
    }