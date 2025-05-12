import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { IUser, User } from "./model.js";


export interface AuthenticatedRequest extends Request{
    user?: IUser | null
}

export const isAuth = async(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> =>{
    try {
        const token = req.headers.token as string;

        if(!token){
            res.status(403).json({
                message: "Please login",
            })
            return;
        }
        
        const decodedValue= jwt.verify(token, process.env.JWT_SEC as string) as JwtPayload;

        if(!decodedValue || !decodedValue.id){
            res.status(403).json({
                message: "invalid token",
            })
            return;
        }
        const userid = decodedValue.id
        const user= await User.findById(userid).select("-password");

        if(!user){
            res.status(403).json({
                message: "user not found"
            })
            return;
        }

        req.user= user;
        next();

    } catch (error) {
        res.status(403).json({
            message: "Please login",
        })
    }
}