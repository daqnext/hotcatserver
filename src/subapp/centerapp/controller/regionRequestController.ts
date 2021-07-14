/*
 * @Author: your name
 * @Date: 2021-07-12 09:30:39
 * @LastEditTime: 2021-07-12 10:19:54
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /hotcatserver/src/subapp/centerapp/controller/regionRequestController.ts
 */
import koa from "koa";
import router from "koa-router";
import { auth } from "../../../manager/common/auth";
import { captchaManager } from "../../../manager/project/captchaManager";
import { categoryManager } from "../../../manager/project/categoryManager";
import { userManager } from "../../../manager/project/userManager";
import { resp } from "../../../utils/resp";
import { Utils } from "../../../utils/utils";

class regionRequestController {
    public static init(Router: router) {
        let C = new regionRequestController();
        //Router.use(auth.ParseTokenMiddleware(),auth.AuthMiddleware(['admin']))
        
        //config all the get requests
        Router.post("/api/region/serverlogin",C.regionServerLogin)
        Router.get("/api/region/getuserinfo",auth.ParseTokenMiddleware(),auth.AuthMiddleware(['admin']), C.regionGetUserInfo);
        Router.get("/api/region/getcategory",auth.ParseTokenMiddleware(),auth.AuthMiddleware(['admin']), C.regionGetCategory);

        //config all the post requests
        return C;
    }
    async regionServerLogin(ctx: koa.Context, next: koa.Next){
        const {email,passwd}=ctx.request.body
        
    }

    async regionGetUserInfo(ctx: koa.Context, next: koa.Next){
        //get post cookie
        const {cookie}=ctx.request.body
        const {user,errMsg}=await userManager.centerGetUserByCookie(cookie)
        if (user===null) {
            resp.send(ctx,1,null,errMsg)
            return
        }
        resp.send(ctx,1,user,null)
        return
    }

    async regionGetCategory(ctx: koa.Context, next: koa.Next) {
        const { categoryMap, errMsg } = await categoryManager.centerGetAllCategory();
        if (categoryMap == null) {
            resp.send(ctx,1,null,errMsg)
            return;
        }
        resp.send(ctx,1,categoryMap,null)
        return
    }
}

module.exports = regionRequestController;
