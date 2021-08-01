/*
 * @Author: your name
 * @Date: 2021-07-07 14:40:40
 * @LastEditTime: 2021-08-01 18:21:45
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /hotcatserver/src/manager/captchaManager.ts
 */

import captchapng from "captchapng";
import randomString from "string-random";
import { logger } from "../../global";
import { redisTool } from "../../redis/redisTool";

const CaptchaCode_id_string = "CaptchaCode_";

class captchaManager {
    static async GenRandCaptcha(): Promise<{ id: string; base64: string }> {
        const captchaStr: string = randomString(4, { letters: "123456789" });
        const id: string = randomString(15);
        console.log(captchaStr);
        console.log(id);
        try {
            const p = new captchapng(80, 30, parseInt(captchaStr));
            p.color(0, 0, 0, 0);
            p.color(80, 80, 80, 255);
            const base64 = p.getBase64();
            //set to redis
            const result = await this.setToRedis(id, captchaStr);
            console.log(result);

            if (result !== "OK") {
                return null;
            }
            return {
                id: id,
                base64: base64,
            };
        } catch (error) {
            logger.error(error);
            return null;
        }
    }

    static async Verity(id: string, captchaInput: string, clear: boolean = false): Promise<boolean> {
        const capInRedis = await this.getFromRedis(id);
        if (capInRedis.toLowerCase() === captchaInput.toLowerCase()) {
            if (clear) {
                this.clearRedisCap(id);
            }
            return true;
        }
        return false;
    }

    private static async setToRedis(id: string, captchaStr: string) {
        const key = CaptchaCode_id_string + id;
        const result = await redisTool.getSingleInstance().redis.set(key, captchaStr, "EX", 300);
        return result;
    }

    private static async getFromRedis(id: string): Promise<string> {
        const key = CaptchaCode_id_string + id;
        const result = await redisTool.getSingleInstance().redis.get(key);
        return result;
    }

    private static async clearRedisCap(id: string): Promise<number> {
        const key = CaptchaCode_id_string + id;
        const result = await redisTool.getSingleInstance().redis.del(key);
        return result;
    }
}

export { captchaManager };
