import { Router } from "express"
import github, { fromGitHubToken } from "./github"
import { handleAsync } from "./utils"
import UserAuth from "./models/UserAuth"
import User from "./models/User"
import UserSession, { UserSessionSource } from "./models/UserSession"

export enum OAuthProvider {
    GITHUB = "github",
    GOOGLE = "google"
}
export const enabled_oauth_providers = new Set<OAuthProvider>()

for(const provider of process.env.ENABLED_OAUTH_PROVIDERS?.split(",") || []){
    enabled_oauth_providers.add(provider as OAuthProvider)
}

export default Router()
.get("/github/login", (req, res) => {
    if(!enabled_oauth_providers.has(OAuthProvider.GITHUB)){
        throw new Error("Github OAuth is not enabled")
    }
    res.redirect(github.getWebFlowAuthorizationUrl({
        redirectUrl: `${process.env.PUBLIC_URL}/oauth/github/callback`
    }).url)
}).get("/github/callback", handleAsync(async (req, res) => {
    const code = req.query.code
    if(!code || typeof code !== "string"){
        throw new Error("No code provided")
    }
    const state = req.query.state
    if(!state || typeof state !== "string"){
        throw new Error("No state provided")
    }

    const auth = await github.createToken({
        code,
        state
    })
    const octokit = fromGitHubToken(auth.authentication.token)
    const {data: user_data} = await octokit.request("GET /user")
    const {data: emails} = await octokit.request("GET /user/emails")
    let email = emails.find(email => email.primary)
    if(!email){
        email = emails.find(email => email.verified)
    }
    if(!email || !email.verified){
        throw new Error("No verified email found")
    }

    let userauth = await UserAuth.findOne({
        provider: "github",
        provider_id: String(user_data.id)
    }).populate("user")
    if(!userauth){
        const user = await User.create({
            name: user_data.name || user_data.login,
            email: email.email,
            avatar: user_data.avatar_url
        })
        userauth = await UserAuth.create({
            provider: "github",
            provider_id: String(user_data.id),
            user: user
        })
        await UserSession.create({
            user: user,
            source: UserSessionSource.API
        })
    }
    const session = await UserSession.create({
        user: userauth.user,
        source: UserSessionSource.WEB
    })
    
    res.cookie("session", session.token, {
        httpOnly: true,
        secure: true,
        sameSite: "strict"
    }).redirect("/")
}, "user"))