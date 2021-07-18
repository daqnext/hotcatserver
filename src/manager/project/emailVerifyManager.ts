/*
 * @Author: your name
 * @Date: 2021-07-16 22:42:40
 * @LastEditTime: 2021-07-18 13:00:33
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /hotcatserver/src/manager/project/emailVerify.ts
 */

import nodemailer from "nodemailer";
import { config } from "../../config/conf";
import { redisTool } from "../../redis/redisTool";
import randomString from "string-random";

const EmailVCode_email_string = "EmailVCode_";
const EmailVCodeCoolDown_email_string = "EmailVCodeCoolDown_";

class emailVerifyManager {
    private static async SendEmailVCode(
        targetEmail: string,
        vCode: string
    ): Promise<{ success: boolean; err: any }> {
        const smtpTransport = nodemailer.createTransport({
            host: config.email_host,
            secureConnection: false, // use SSL
            secure: false,
            port: config.email_port,
            auth: {
                user: config.email_username,
                pass: config.email_password,
            },
        });

        return new Promise((resolve, reject) => {
            smtpTransport.sendMail(
                {
                    //from    : 'alias Name<foobar@latelee.org>',
                    from: "contact" + " " + "<" + "contact@hotcat.live" + ">",
                    //'li@latelee.org, latelee@163.com',
                    to: targetEmail,
                    subject: "Verification code from hotcat.live", //邮件主题
                    //text    : msg,
                    html:
                        "Welcome to hotcat.live!\n Your verification code is [" +
                        vCode +
                        "], it will expire in 24 hours",
                },
                function (err, res) {
                    if (err) {
                        console.error("error: ", err);
                        reject({ success: false, err: err });
                        return;
                    }
                    resolve({ success: true, err: null });
                }
            );
        });
    }

    static async GenEmailVCode(email: string): Promise<{ success: boolean; err: string }> {
        const coolDownKey = EmailVCodeCoolDown_email_string + email;
        const result = await redisTool.getSingleInstance().redis.get(coolDownKey);
        if (result !== null) {
            //not coolDown
            return { success: false, err: "wait at least 60s before resend" };
        }

        const vCodeKey = EmailVCode_email_string + email;
        let vcode = await redisTool.getSingleInstance().redis.get(vCodeKey);
        let exist = true;
        if (vcode === null) {
            vcode = randomString(4, {
                letters: "0123456789",
            });
            exist = false;
        }

        const setResult = await redisTool.getSingleInstance().redis.set(vCodeKey, vcode, "KEEPTTL");
        if (setResult !== "OK") {
            return { success: false, err: "set vcode error" };
        }
        if (exist === false) {
            await redisTool.getSingleInstance().redis.expire(vCodeKey, 24 * 60 * 60);
        }

        //send email
        const { success, err } = await this.SendEmailVCode(email, vcode);
        if (!success) {
            return { success: false, err: "fail to send email" };
        }
        //start cooldown
        await redisTool.getSingleInstance().redis.set(coolDownKey, "1", "EX", 55);
        return { success: true, err: null };
    }

    static async ValidateEmailVCode(email: string, code: string): Promise<boolean> {
        const vCodeKey = EmailVCode_email_string + email;
        let vcode = await redisTool.getSingleInstance().redis.get(vCodeKey);
        if (vcode === null) {
            return false;
        }

        if (vcode === code) {
            redisTool.getSingleInstance().redis.del(vCodeKey);
            return true;
        }
        return false;
    }
}

export { emailVerifyManager };
