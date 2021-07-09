/*
 * @Author: your name
 * @Date: 2021-07-08 13:58:13
 * @LastEditTime: 2021-07-08 14:03:12
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /hotcatserver/src/controller/srsNotifyController.ts
 */
import koa from "koa";
import router from "koa-router";

class srsNotifyController {
    public static init(Router: router) {
        let C = new srsNotifyController();
        //config all the get requests
        Router.get("/api/srsnotify/", C.helloworld);

        //on_publish

        //on_unpublish

        //watching
        Router.get("/api/livestream/watching/:streamId", C.helloworld);

        //config all the post requests
        return C;
    }

    async helloworld(ctx: koa.Context, next: koa.Next) {
        ctx.body = { key: "hello world" };
        await next();
    }
}

module.exports = srsNotifyController;
