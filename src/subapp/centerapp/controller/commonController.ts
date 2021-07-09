/*
 * @Author: your name
 * @Date: 2021-07-07 14:42:16
 * @LastEditTime: 2021-07-09 10:55:35
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /hotcatserver/src/controller/commonController.ts
 */
import koa from "koa";
import router from "koa-router";
import { captchaManager } from "../../../manager/project/captchaManager";
import { Utils } from "../../../utils/utils";

class commonController {
    public static init(Router: router) {
        let C = new commonController();
        //config all the get requests
        Router.get("/api/getcaptcha", C.getCaptcha);

        //config all the post requests
        return C;
    }

    async getCaptcha(ctx: koa.Context, next: koa.Next) {
        console.log("aaa");
        const ip: string = Utils.getRequestIP(ctx.req);
        //const ip=ctx.ip
        console.log(ctx.host);
        console.log(ctx.protocol);
        console.log(ip);
        const result: { id: string; base64: string } = await captchaManager.GenRandCaptcha();
        if (result === null) {
            console.error("Gen captcha error");
            ctx.body = {
                status: 1,
            };
            return;
        }
        console.log(result.id);
        console.log(result.base64);

        ctx.body = {
            status: 0,
            data: {
                id: result.id,
                base64: result.base64,
            },
        };
    }
}

module.exports = commonController;
