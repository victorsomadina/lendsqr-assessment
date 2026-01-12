import { NextFunction, Request, Response } from "express";
import jwt from "jwt-simple";

export interface AuthRequest extends Request {
    user?: {
        userId: string;
        email: string;
    };
}

export const AuthMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            status: "error",
            message: "Authorization token required",
        });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.decode(token, process.env.JWT_SECRET || "default_secret");

        if (!decoded.userId) {
            return res.status(401).json({
                status: "error",
                message: "Invalid token structure",
            });
        }

        req.user = {
            userId: decoded.userId,
            email: decoded.email,
        };

        return next();
    } catch (error) {
        return res.status(401).json({
            status: "error",
            message: "Invalid or expired token",
        });
    }
};
