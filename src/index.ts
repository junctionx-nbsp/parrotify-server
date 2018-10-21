import "./utils/envs"
import Server from "./server"
import { v4 } from "public-ip"

async function run() {
  process.env.PUBLIC_IP = process.env.PUBLIC_IP || await v4()

  const s = new Server(80)
  s.run()
}

run()
