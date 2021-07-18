/*
 * @Author: your name
 * @Date: 2021-07-08 13:58:13
 * @LastEditTime: 2021-07-17 16:09:57
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /hotcatserver/src/controller/srsNotifyController.ts
 */
import koa from "koa";
import router from "koa-router";
import queryString from 'query-string'
import { IStreamOnPublishMsg } from "../../../interface/msg";
import { livestreamManager } from "../../../manager/project/livestreamManager";

class srsNotifyController {
    public static init(Router: router) {
        let C = new srsNotifyController();
        //config all the get requests
        Router.get("/api/srsnotify/1", C.helloworld);

        //on_publish
        Router.post("/api/srsnotify/onpublish", C.onPublish);

        //on_unpublish
        Router.post("/api/srsnotify/onunpublish", C.onUnPublish);

        //watching
        Router.get("/api/livestream/watching/:streamId", C.helloworld);

        //config all the post requests
        return C;
    }

    async helloworld(ctx: koa.Context, next: koa.Next) {
        ctx.body = { key: "hello world" };
        await next();
    }

    async onPublish(ctx: koa.Context, next: koa.Next) {
        const msg:IStreamOnPublishMsg=ctx.request.body
        console.log(msg);

        // const param = queryString.parse(msg.param);
        // const secret = param.secret as string
        // if (!secret) {
        //     ctx.body = 1;
        //     return
        // }

        // const {livestream}=await livestreamManager.GetLiveStreamByKey(secret)
        // if (!livestream) {
        //     ctx.body = 1;
        //     return
        // }

        ctx.status=200
        ctx.body=0
    }

    async onUnPublish(ctx: koa.Context, next: koa.Next) {
        const msg:IStreamOnPublishMsg=ctx.request.body
        console.log(msg);
        ctx.status=200
        ctx.body = 0;
    }
}

module.exports = srsNotifyController;
