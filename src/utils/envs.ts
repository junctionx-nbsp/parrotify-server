import { config } from "dotenv"
config()

const {
  TONGUE_BASE_URL = "",
  SUBSCRIPTION_ID = "",
  NOKIA_BASE_URL = "",
  NOKIA_API_KEY = "",
  FALLBACK_AUDIO_URL = ""
} = process.env

if (
  [
    TONGUE_BASE_URL,
    SUBSCRIPTION_ID,
    NOKIA_BASE_URL,
    NOKIA_API_KEY,
    FALLBACK_AUDIO_URL
  ].some(a => a === "")
) {
  throw new Error(`Envs not set properly: ${JSON.stringify(process.env)}`)
}

export {
  TONGUE_BASE_URL,
  SUBSCRIPTION_ID,
  NOKIA_BASE_URL,
  NOKIA_API_KEY,
  FALLBACK_AUDIO_URL
}
