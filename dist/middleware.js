import jwt from "jsonwebtoken";
import { User } from "./model.js";
export const isAuth = async (req, res, next) => {
    try {
        const token = req.headers.token;
        if (!token) {
            res.status(403).json({
                message: "Please login",
            });
            return;
        }
        const decodedValue = jwt.verify(token, process.env.JWT_SEC);
        if (!decodedValue || !decodedValue.id) {
            res.status(403).json({
                message: "invalid token",
            });
            return;
        }
        const userid = decodedValue.id;
        const user = await User.findById(userid).select("-password");
        if (!user) {
            res.status(403).json({
                message: "user not found"
            });
            return;
        }
        req.user = user;
        next();
    }
    catch (error) {
        res.status(403).json({
            message: "Please login",
        });
    }
};
