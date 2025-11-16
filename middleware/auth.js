import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
    var token = req.headers.authorization;
    if (!token) {
        console.log("token",token);
        return res.json({ success: false, message: "not authorized" });
    }
    if (token.startsWith("Bearer ")) {
            token = token.split(" ")[1];
        }
    try {
        const userId = jwt.decode(token,process.env.JWT_SECRET);
         console.log("userId",userId)
         
        if (!userId) {
            return res.json({ success: false,message:"User not found please login" });
        }

        req.user = await User.findById(userId).select("-password");
        next();
    } catch (error) {
        console.log(error.message);
        return res.json({ success: false, message: "not authorized" });
    }
}