import "./utils/envs"
import Server from "./server"

// tslint:disable-next-line:no-magic-numbers
const s = new Server(80)
s.run()
