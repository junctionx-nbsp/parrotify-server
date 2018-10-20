import { CallAction } from "./types"

export function handleCall(displayAddress: string, actionToPerform: CallAction.Continue | CallAction.EndCall): {}
export function handleCall(displayAddress: string, actionToPerform: CallAction.PlayAudio, routingAddress: undefined, audioFileUrl: string): {}
export function handleCall(displayAddress: string, actionToPerform: CallAction.Route, routingAddress: string): {}
export function handleCall(displayAddress: string, actionToPerform: CallAction, routingAddress?: string, audioFileUrl?: string): {} {
  switch (actionToPerform) {
    case CallAction.Continue:
    case CallAction.EndCall:
      return {
        action: {
          actionToPerform,
          displayAddress
        }
      }
    case CallAction.Route:
      return {
        action: {
          actionToPerform: "Route",
          routingAddress,
          displayAddress
        }
      }
    case CallAction.PlayAudio:
      return {
        action: {
          actionToPerform: "Continue",
          displayAddress,
          digitCapture: {
            playingConfiguration: {
              playFileLocation: audioFileUrl
            },
            callParticipant: [
              displayAddress
            ]
          }
        }
      }
  }
}

/*
const DIGIT_CAPTURED = (displayAddress: string, audioFileUrl: string, playAndCollectCallbackUrl: string) => ({
  action: {
    actionToPerform: "Continue",
    displayAddress,
    digitCapture: {
      digitConfiguration: {
        maxDigits: 10,
        minDigits: 3,
        endChar: "#"
      },
      playingConfiguration: {
        playFileLocation: audioFileUrl
      },
      callParticipant: [
        displayAddress
      ]
    },
    playAndCollectInteractionSubscription: {
      callbackReference: {
        notifyURL: playAndCollectCallbackUrl
      }
    }
  }
})
*/
