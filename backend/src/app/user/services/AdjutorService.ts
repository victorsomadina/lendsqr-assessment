import axios from "axios";
import { Service } from "typedi";
import * as dotenv from "dotenv";
import * as path from "path";

const envPath = path.join(__dirname, "../../.env");
dotenv.config({ path: envPath });

export interface KarmaCheckResponse {
    status: string;
    message: string;
    data: {
        karma_identity: string;
        amount_due: number;
        reason: string;
        reporter: {
            label: string;
        };
    } | null;
}

@Service()
export class AdjutorService {
    private readonly baseUrl = process.env.BASE_URL;
    private readonly apiKey: string;

    constructor() {
        this.apiKey = process.env.ADJUTOR_API_KEY || "";
    }

    async isBlacklisted(email: string): Promise<boolean> {
        try {
            if (!this.apiKey) {
                return false;
            }

            const response = await axios.get<KarmaCheckResponse>(
                `${this.baseUrl}/verification/karma/${email}`,
                {
                    headers: {
                        Authorization: `Bearer ${this.apiKey}`,
                    },
                }
            );

            return !!response.data.data;
        } catch (error: any) {
            if (error.response && error.response.status === 404) {
                return false;
            }

            console.error("[AdjutorService] Blacklist check failed:", error.message);
            return false;
        }
    }
}
