import { get } from "improved/dist/ajax"
import { TONGUE_BASE_URL } from "./utils/envs"

export async function textToMp3(text: string): Promise<string> {
  const { url } = await get(`${TONGUE_BASE_URL}/textToMp3?text=${text}`)
  return url
}

export async function mp3ToWav(inputUrl: string): Promise<string> {
  const { url } = await get(`${TONGUE_BASE_URL}/mp3ToWav?inputUrl=${inputUrl}`)
  return url
}
