import "reflect-metadata";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test_secret";
process.env.ADJUTOR_API_KEY = "test_key";
process.env.BASE_URL = "http://localhost:3001";
