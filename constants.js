var CONTINUE = {
   "action": {
      "actionToPerform": "Continue",
      "displayAddress": "[phone number]"
   }
}

var END_CALL = {
   "action": {
      "actionToPerform": "EndCall",
      "displayAddress": "[phone number]"
   }
}

var ROUTE_CALL = {
   "action": {
      "actionToPerform": "Route",
      "routingAddress": "[phone number]",
      "displayAddress": "[phone number]"
   }
}

var PLAY_ANNOUNCEMENT = {
   "action": {
      "actionToPerform": "Continue",
      "displayAddress": "[phone number]",
      "digitCapture": {
         "playingConfiguration": {
            "playFileLocation": "http://example.com:8080/files/example.wav"
         },
         "callParticipant": [
            "[phone number]"
         ]
      }
   }
}

var DIGIT_CAPTURED = {
   "action": {
      "actionToPerform": "Continue",
      "displayAddress": "[phone number]",
      "digitCapture": {
         "digitConfiguration": {
            "maxDigits": 10,
            "minDigits": 3,
            "endChar": "#"
         },
         "playingConfiguration": {
            "playFileLocation": "http://example.com:8080/files/example.wav"
         },
         "callParticipant": [
            "[phone number]"
         ]
      },
      "playAndCollectInteractionSubscription": {
         "callbackReference": {
            "notifyURL": "https://www.example.com/notifyURL"
         }
      }
   }
}

module.exports = {
   continue: CONTINUE,
   endCall: END_CALL,
   route: ROUTE_CALL,
   playA: PLAY_ANNOUNCEMENT,
   digit: DIGIT_CAPTURED
}