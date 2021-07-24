/*
 * @Author: your name
 * @Date: 2021-07-12 09:30:39
 * @LastEditTime: 2021-07-23 11:01:06
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /hotcatserver/src/subapp/centerapp/controller/regionRequestController.ts
 */
import koa from "koa";
import router from "koa-router";
import { auth } from "../../../manager/common/auth";
import { captchaManager } from "../../../manager/project/captchaManager";
import { categoryManager } from "../../../manager/project/categoryManager";
import { languageManager } from "../../../manager/project/languageManager";
import { userManager } from "../../../manager/project/userManager";
import { resp } from "../../../utils/resp";
import { Utils } from "../../../utils/utils";

class regionRequestController {
    public static init(Router: router) {
        let C = new regionRequestController();
        //Router.use(auth.ParseTokenMiddleware(),auth.AuthMiddleware(['admin']))
        
        //config all the get requests
        Router.post("/api/region/serverlogin",C.regionServerLogin)
        Router.post("/api/region/getuserinfo", C.regionGetUserInfo);
        Router.get("/api/region/getcategory", C.regionGetCategory);
        Router.get("/api/region/getlanguage", C.regionGetLanguage);

        //config all the post requests
        return C;
    }
    async regionServerLogin(ctx: koa.Context, next: koa.Next){
        const {email,passwd}=ctx.request.body
        
    }

    async regionGetUserInfo(ctx: koa.Context, next: koa.Next){
        //get post cookie
        const {cookie}=ctx.request.body
        console.log(cookie);
        
        const {user,errMsg}=await userManager.centerGetUserByCookie(cookie)
        if (user===null) {
            resp.send(ctx,1,null,errMsg)
            return
        }
        resp.send(ctx,0,user,null)
        return
    }

    async regionGetCategory(ctx: koa.Context, next: koa.Next) {
        const { categoryMap, errMsg } = await categoryManager.centerGetAllCategory();
        if (categoryMap === null) {
            resp.send(ctx,1,null,errMsg)
            return;
        }
        resp.send(ctx,0,categoryMap,null)
        return
    }

    async regionGetLanguage(ctx: koa.Context, next: koa.Next) {
        const { languageMap, errMsg } = await languageManager.centerGetAllLanguage();
        if (languageMap === null) {
            resp.send(ctx,1,null,errMsg)
            return;
        }
        resp.send(ctx,0,languageMap,null)
        return
    }
}

module.exports = regionRequestController;
