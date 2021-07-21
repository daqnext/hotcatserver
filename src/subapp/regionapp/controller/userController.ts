/*
 * @Author: your name
 * @Date: 2021-07-09 10:40:53
 * @LastEditTime: 2021-07-21 14:43:39
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /hotcatserver/src/subapp/regionapp/controller/userController.ts
 */

import koa from "koa";
import router from "koa-router";
import proxy from "koa-better-http-proxy";
import { config } from "../../../config/conf";
import request from 'request';
import { auth } from "../../../manager/common/auth";
import { IUserInfo } from "../../../interface/interface";
import { resp } from "../../../utils/resp";

class userController {
    public static init(Router: router) {
        let C = new userController();
        //config all the get requests
        Router.post("/api/user/register", proxy(config.center_host, {}));
        Router.post("/api/user/login", proxy(config.center_host, {}));
        Router.post("/api/user/getemailvcode",proxy(config.center_host, {}))
        Router.post("/api/user/uploadavatar", async(ctx)=>{
            const res = await ctx.req.pipe(request.post(config.center_host+"/api/user/uploadavatar"))
            ctx.body = res
        });

        Router.get("/api/user/userinfo",auth.ParseTokenMiddleware(),C.userGetUserInfo)

        //config all the post requests
        return C;
    }

    async userGetUserInfo(ctx: koa.Context, next: koa.Next){
        const user: IUserInfo = ctx.state.user;
        resp.send(ctx,0,user,null)
    }
}

module.exports = userController;
