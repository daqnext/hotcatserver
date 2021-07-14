/*
 * @Author: your name
 * @Date: 2021-07-07 14:42:16
 * @LastEditTime: 2021-07-09 13:45:45
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /hotcatserver/src/controller/commonController.ts
 */
import koa from "koa";
import router from "koa-router";
import { captchaManager } from "../../../manager/project/captchaManager";
import { categoryManager } from "../../../manager/project/categoryManager";
import { Utils } from "../../../utils/utils";

class commonController {
    public static init(Router: router) {
        let C = new commonController();
        //config all the get requests
        Router.get("/api/getcaptcha", C.getCaptcha);
        Router.get("/api/getcategory", C.getCategory);

        //config all the post requests
        return C;
    }

    async getCaptcha(ctx: koa.Context, next: koa.Next) {
        const ip: string = Utils.getRequestIP(ctx.req);
        console.log(ip);
        const result: { id: string; base64: string } = await captchaManager.GenRandCaptcha();
        if (result === null) {
            console.error("Gen captcha error");
            ctx.body = {
                status: 1,
            };
            return;
        }

        ctx.body = {
            status: 0,
            data: {
                id: result.id,
                base64: result.base64,
            },
        };
    }

    async getCategory(ctx: koa.Context, next: koa.Next) {
        const { categoryMap, errMsg } = await categoryManager.centerGetAllCategory();
        if (categoryMap == null) {
            ctx.body = {
                status: 1,
                errMsg: errMsg,
            };
            return;
        }
        ctx.body = {
            status: 0,
            data: categoryMap,
        };
    }
}

module.exports = commonController;
