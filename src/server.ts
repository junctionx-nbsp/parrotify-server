import * as bodyParser from "body-parser"
import * as express from "express"
import { handleCall, unsubscribe, subscribe } from "./api"
import { ICallEventNotification, CallAction, IMediaInterationNotification, ICallEvent } from "./types"
import { createServer } from "http"
import { Server as WebSocketServer } from "ws"
import * as WebSocket from "ws"
import { parse } from "url"
import { Server } from "http"
import { textToMp3, mp3ToWav } from "./tongue"
import { IWebSocketPackage } from "./types"

export default class {
  private httpServer: Server
  private webSocketServer: WebSocketServer
  private subscriberSocketsMap = new Map<string, Set<WebSocket>>()
  private outputFileQueue: string[] = []

  constructor(
    private port = 80
  ) {
    // Configure Express App
    const app = express()
    app.use(bodyParser.json())

    // Host HTTP and WS Servers
    const server = createServer(app)
    this.webSocketServer = new WebSocketServer({ server })
    this.httpServer = server

    // Attach WS Event Handlers
    this.webSocketServer.on("connection", (socket, req) => {
      console.log(`Established WebSocket Channel with: ${req.connection.remoteAddress}`)

      const onError = (...args: {}[]) => {
        console.log(...["## Socket", ...args])
        socket.removeAllListeners()
        socket.close()
      }
      socket.on("close", (code, reason) => onError("Hangup:", code, reason))
      socket.on("error", err => onError("Error: Client Error:", err))

      // Handle Messages sent by Client
      socket.on("message", async data => {
        console.log(`Received Client Data: ${data}`)

        // convert text into polly mp3
        const mp3File = await textToMp3(data.toString())
        console.log(`Converted Text to MP3: ${mp3File}`)

        // convert mp3 to wav
        const wavFile = await mp3ToWav(mp3File)
        console.log(`Converted MP3 to WAV: ${wavFile}`)

        // #TODO play wav into chat
        this.outputFileQueue.push(wavFile)
      })

      // Parse QueryString to retrieve impuAddress passed by client (by convention)
      const { url } = req
      if (url === undefined) {
        return onError("Error: Querystring empty")
      }
      const { impuAddress } = parse(url, true).query
      if (impuAddress === undefined || typeof impuAddress !== "string") {
        return onError("Error: impuAddress not set properly in queryString")
      }

      this.subscribeToNokia(impuAddress)
      this.subscribeClient(impuAddress, socket)
    })

    // Configure Routes
    app.post("/callevent", async (req, res) => {
      const body = req.body
      console.log(`Received Server Callback:\n  Body: ${JSON.stringify(body)}`)

      const ce = body.callEventNotification as ICallEventNotification
      if (ce) this.handleCallEvent(ce, res)

      const min = body.mediaInteractionNotification as IMediaInterationNotification
      if (min) this.handleMediaEvent(min, res)
    })
  }

  private handleMediaEvent(mediaInteractionNotification: IMediaInterationNotification, res: express.Response) {
    const { callParticipant, mediaInteractionResult } = mediaInteractionNotification

    if (mediaInteractionResult) console.log(`!!! MEDIA INTERACTION RESULT: ${mediaInteractionResult}`)
    res.json(handleCall(callParticipant, CallAction.PromptInput, callParticipant, this.outputFileQueue.shift()))
    // res.json(handleCall(callParticipant, CallAction.Continue))

    this.notifySubscribers(callParticipant, mediaInteractionNotification)
  }

  private handleCallEvent(callEventNotification: ICallEventNotification, res: express.Response) {
    const { calledParticipant, callingParticipant, eventDescription } = callEventNotification

    // Answer the Nokia API and tell it to continue the call
    switch (eventDescription.callEvent) {
      case ICallEvent.CalledNumber:
        res.json(handleCall(calledParticipant, CallAction.PromptInput, callingParticipant, this.outputFileQueue.shift()))
        // res.json(handleCall(calledParticipant, CallAction.Continue))
        break
      case ICallEvent.Answer:
        res.json(handleCall(calledParticipant, CallAction.PromptInput, callingParticipant, this.outputFileQueue.shift()))
        break
      default:
        console.log(`??? Uncaught Event Type: ${eventDescription.callEvent}`)
        res.json(handleCall(calledParticipant, CallAction.Continue))
    }

    // This is a hack
    const calledSubscriber = this.subscriberSocketsMap.get(calledParticipant)
    if (calledSubscriber !== undefined) {
      console.log(`CalledSubscriber: ${calledSubscriber.size}`)
      this.subscriberSocketsMap.set(callingParticipant, calledSubscriber)
    }

    this.notifySubscribers(callingParticipant, eventDescription)
    this.notifySubscribers(calledParticipant, eventDescription)
  }

  private notifySubscribers(calledParticipant: string, data: IWebSocketPackage) {
    // Notify our subscribers for that impuAddress of the event
    const subscriberSockets = this.subscriberSocketsMap.get(calledParticipant)
    console.log(`  Notifying Subscribers, found: ${subscriberSockets && subscriberSockets.size} for impuAddress: ${calledParticipant}`)
    if (!subscriberSockets) return

    for (const s of subscriberSockets) {
      s.send(JSON.stringify(data))
    }
  }

  // Setup Subscription on Call Events through Nokia API
  private async subscribeToNokia(displayAddress: string) {
    try {
      console.log(await unsubscribe(displayAddress))
    } catch (e) {
      console.log(`Unsubscribe failed`)
      console.log(await subscribe(displayAddress))
    }
    console.log(await subscribe(displayAddress))
  }

  private subscribeClient(displayAddress: string, socket: WebSocket) {
    const { subscriberSocketsMap } = this
    console.log(`Subscribing Client to map: ${subscriberSocketsMap.size} using impuAddress: ${displayAddress}`)

    // Check if other people are also subscribing to that phone number's events
    const subscriberSockets = subscriberSocketsMap.get(displayAddress)
    if (subscriberSockets) {
      subscriberSockets.add(socket)
    } else {
      subscriberSocketsMap.set(displayAddress, new Set([socket]))
    }

    // Remove old sockets
    const removeSocket = () => subscriberSocketsMap.get(displayAddress)!.delete(socket)
    socket.on("close", (code, reason) => removeSocket())
    socket.on("error", err => removeSocket())

    console.log(`Subscribed Client to map: ${subscriberSocketsMap.size}`)
  }

  public run() {
    this.httpServer.listen(this.port)
    console.log(`Server running on port: ${this.port}`)
  }
}
