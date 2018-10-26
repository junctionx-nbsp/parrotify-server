export interface ICallEventNotification {
  callingParticipant: string
  calledParticipant: string
  callSessionIdentifier: string
  timestamp: number
  notificationType: "CallDirection"
  eventDescription: {
    callEvent: ICallEvent
  }
}

export interface IMediaInterationNotification {
  notificationType: "PlayAndCollect"
  callParticipant: string
  mediaInteractionResult: string
}

export interface IWebSocketPackage {
  callEvent?: ICallEvent
  mediaInteractionResult?: string
}

export const enum ICallEvent {
  CalledNumber = "CalledNumber",
  NoAnswer = "NoAnswer",
  Busy = "Busy",
  Disconnected = "Disconnected",
  NotReachable = "NotReachable",
  Answer = "Answer"
}

export interface ICallActionResponse {
  action: {
    actionToPerform: string
    displayAddress: string
  }
}

export const enum CallAction {
  EndCall = "EndCall",
  Continue = "Continue",
  Route = "Route",
  PlayAudio = "PlayAudio",
  PromptInput = "PromptInput"
}
