import express from "express"
import oauth from "./oauth.js"

export const app = express()
.disable("x-powered-by")
.set("view engine", "ejs")
.use("/oauth", oauth)