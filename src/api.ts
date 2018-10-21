import { CallAction } from "./types"
import { SUBSCRIPTION_ID, NOKIA_BASE_URL, NOKIA_API_KEY, FALLBACK_AUDIO_URL } from "./utils/envs"
import { post, del } from "improved/dist/ajax"

let lastKnownAudioFile = FALLBACK_AUDIO_URL

export async function unsubscribe(displayAddress: string) {
  return del(`${NOKIA_BASE_URL}/subscriptions/callDirection/subs?Id=${encodeURIComponent(SUBSCRIPTION_ID)}&addr=${encodeURIComponent(displayAddress)}`, { authorization: NOKIA_API_KEY })
}

export async function subscribe(displayAddress: string) {
  const body = {
    callDirectionSubscription: {
      callbackReference: {
        notifyURL: `${process.env.PUBLIC_IP}/callevent`
      },
      filter: {
        address: [
          displayAddress
        ],
        criteria: [
          "CalledNumber",
          // "Busy",
          // "Disconnected"
          "Answer",
        ],
        addressDirection: "Called"
      },
      clientCorrelator: SUBSCRIPTION_ID
    }
  }
  return post(`${NOKIA_BASE_URL}/subscriptions/callDirection/subs?Id=${encodeURIComponent(SUBSCRIPTION_ID)}&addr=${encodeURIComponent(displayAddress)}`, body, false, { authorization: NOKIA_API_KEY })
}

export function handleCall(displayAddress: string, actionToPerform: CallAction.PromptInput, secondAddress: string, audioFileUrl?: string): {}
export function handleCall(displayAddress: string, actionToPerform: CallAction.Continue | CallAction.EndCall): {}
export function handleCall(displayAddress: string, actionToPerform: CallAction.PlayAudio, secondAddress: undefined, audioFileUrl: string): {}
export function handleCall(displayAddress: string, actionToPerform: CallAction.Route, secondAddress: string): {}
export function handleCall(displayAddress: string, actionToPerform: CallAction, secondAddress?: string, audioFileUrl?: string): {} {
  if (audioFileUrl) lastKnownAudioFile = audioFileUrl
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
          secondAddress,
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
              playFileLocation: audioFileUrl || lastKnownAudioFile
            },
            callParticipant: [
              displayAddress
            ]
          }
        }
      }
    case CallAction.PromptInput:
      return {
        action: {
          actionToPerform: "Continue",
          displayAddress,
          digitCapture: {
            digitConfiguration: {
              maxDigits: 100,
              minDigits: 1,
              endChar: "#"
            },
            playingConfiguration: {
              playFileLocation: audioFileUrl || lastKnownAudioFile
            },
            callParticipant: [
              secondAddress
            ]
          },
          playAndCollectInteractionSubscription: {
            callbackReference: {
              notifyURL: `${process.env.PUBLIC_IP}/callevent`
            }
          }
        }
      }
  }
}
