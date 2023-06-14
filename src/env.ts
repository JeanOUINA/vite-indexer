import * as dotenv from "dotenv"
import { join } from "path"
import __dirname from "./__dirname.js"

console.log(join(__dirname, "..", ".env"))
dotenv.config({
    path: join(__dirname, "..", ".env")
})