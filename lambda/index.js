/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core');
const myDocument = require('main.json');
const languageStrings = require('languageStrings.js');
const persistenceAdapter = require('ask-sdk-s3-persistence-adapter');
//const i18n = require('i18next');

const GetNewFactHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'LaunchRequest'
      || (request.type === 'IntentRequest'
        && request.intent.name === 'GetNewFactIntent');
  },
  handle(handlerInput) {
     const arr = getLocalizedData(handlerInput.requestEnvelope.request.locale);
        let dt = new Date();
        let beg = new Date(dt.getFullYear(), 0, 0);
        let difference = dt - beg;
        let oneDay = 1000 * 60 * 60 * 24;
        let day = Math.floor(difference / oneDay);
        let date = dt.toDateString();
        console.log(date);
        const speechOutput = (arr["GET_FACT_MESSAGE"]+day + '<break time="2s"/>');
        
    const responseBuilder = handlerInput.responseBuilder;
    const temp=arr["data"][day];
    const quote=arr["quotes"][day];
    const images=arr["images"][day];
   
    
   if(supportsAPL(handlerInput))
    {
         {
             handlerInput.responseBuilder
                .addDirective({
                    "type": "Alexa.Presentation.APL.RenderDocument",
                    "token": "token",
                    "document": myDocument,
                    "datasources": {
                        "response": {
                            
                            "text" : quote,
                            
                            "title" : "Today's Quote: ",
                            "subtitle":date,
                            "url":images

                            }
                    }
                })
         }
         
         
         return handlerInput.responseBuilder
      .speak(speechOutput)
      .addDirective({
        "type": "Alexa.Presentation.APLA.RenderDocument",
        "token": "developer-provided-string",
        "document": {
            "version": "0.8",
            "type": "APLA",
            "mainTemplate": {
                "item": {
                "type": "Mixer",
            "items": [
            {
                "type": "Audio",
                "source": temp,
            },
            {
                "type": "Audio",
                "source": "https://quote-skill.s3.us-east-2.amazonaws.com/Intro+Theme+Music+06+(Version+2)+20+Seconds.mp3",
                "filters": [
                {
                    "type": "Volume",
                    "amount": "20%"
                }
            ]
        }
    ]
          
      }
    }
  },
  "datasources": {}
})
      .getResponse();
    }
    else
    {
        return handlerInput.responseBuilder.withSimpleCard(arr["SKILL_NAME"].day).speak(speechOutput).getResponse();
    }
   
  },
};
function getLocalizedData(locale){
    return languageStrings[locale];
}
function supportsAPL(handlerInput) {
  const supportedInterfaces = handlerInput.requestEnvelope.context
    .System.device.supportedInterfaces;
  const aplInterface = supportedInterfaces['Alexa.Presentation.APL'];
  return aplInterface !== null && aplInterface !== undefined;
}
const HelpHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak("You can say tell me a monkey fact, or, you can say exit... What can I help you with?")
      .reprompt("What can I help you with?")
      .getResponse();
  },
};




const ExitHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && (request.intent.name === 'AMAZON.CancelIntent'
        || request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak("")
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};
const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, I can\'t understand the command. Please say again.')
      .reprompt('Sorry, I can\'t understand the command. Please say again.')
      .getResponse();
  },
};

 exports.handler = Alexa.SkillBuilders.custom()
    .withPersistenceAdapter(
        new persistenceAdapter.S3PersistenceAdapter({bucketName: process.env.S3_PERSISTENCE_BUCKET})
    )
  .addRequestHandlers(
    GetNewFactHandler,
    HelpHandler,
    //FallbackHandler,
    ExitHandler,
    SessionEndedRequestHandler,
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
