import { OAuthApp, Octokit } from "octokit";

export default new OAuthApp({
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    defaultScopes: [
        "read:user",
        "user:email"
    ]
})

export function fromGitHubToken(token:string){
    return new Octokit({
        auth: token
    })
}