import { NextFunction, Request, Response } from "express"

export function handleAsync(
    middleware: (req: Request, res: Response, next: NextFunction) => Promise<any>,
    type:"api"|"user" = "api"
){
    return (req: Request, res: Response, next: NextFunction) => {
        middleware(req, res, next)
        ?.catch?.(err => {
            if(type === "api"){
                res.status(500).json({
                    error: err.message
                })
            }else{
                res.status(500).render("error", {
                    error: err.message,
                    title: "Error",

                    service: {
                        name: process.env.SERVICE_NAME,
                        description: process.env.SERVICE_DESCRIPTION,
                        url: process.env.PUBLIC_URL
                    }
                })
            }
        })
    }
}
