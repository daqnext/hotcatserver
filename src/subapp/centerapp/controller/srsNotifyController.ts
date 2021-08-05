/*
 * @Author: your name
 * @Date: 2021-07-08 13:58:13
 * @LastEditTime: 2021-08-04 22:41:13
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /hotcatserver/src/controller/srsNotifyController.ts
 */
import koa from "koa";
import router from "koa-router";
import queryString from "query-string";
import { ELiveStreamStatus } from "../../../interface/interface";
import { IStreamOnPublishMsg, IStreamOnUnPublishMsg } from "../../../interface/msg";
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

        //on_update
        Router.post("/api/srsnotify/onupdate", C.onUpdate);

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
        const msg: IStreamOnPublishMsg = ctx.request.body;
        console.log(msg);
        //   app: 'live',
        //   flashver: 'FMLE/3.0 (compatible; FMSc/1.0)',
        //   swfurl: 'rtmp://192.168.56.101/live?secret=asdiwef',
        //   tcurl: 'rtmp://192.168.56.101/live?secret=asdiwef',
        //   pageurl: '',
        //   addr: '192.168.56.1',
        //   clientid: '1',
        //   call: 'publish',
        //   name: '12',
        //   type: 'live'

        // //for test
        // ctx.status = 200;
        // ctx.body = 0;
        // return

        //check id and secret
        const paramStr=msg.swfurl.split("?")[1]
        const param = queryString.parse(paramStr);
        const secret = param.secret as string
        
        if (!secret) {
            ctx.status = 500;
            ctx.body = 1;
            return
        }
        const streamId=parseInt(msg.name)
        if (streamId===null) {
            ctx.status = 500;
            ctx.body = 1;
            return
        }

        const {livestream}=await livestreamManager.GetLiveStreamBySecret(secret)
        if (!livestream) {
            ctx.status = 500;
            ctx.body = 1;
            return
        }

        if (streamId!==livestream.id) {
            ctx.status = 500;
            ctx.body = 1;
            return
        }

        //check status
        if (livestream.status===ELiveStreamStatus.END) {
            ctx.status = 500;
            ctx.body = 1;
            return
        }

        //modify status
        livestreamManager.ModifyStreamStatus(streamId,secret,ELiveStreamStatus.ONLIVE)

        ctx.status = 200;
        ctx.body = 0;
    }

    async onUpdate(ctx: koa.Context, next: koa.Next){
        const msg = ctx.request.body;
        console.log(msg);

        if (msg.call!=='update_publish') {
            ctx.status = 200;
            ctx.body = 0;
            return
        }

        // {
        //     app: 'live',
        //     flashver: 'LNX 9,0,124,2',
        //     swfurl: '',
        //     tcurl: 'rtmp://localhost:1935/live',
        //     pageurl: '',
        //     addr: '127.0.0.1',
        //     clientid: '223',
        //     call: 'update_play',
        //     time: '15',
        //     timestamp: '13949',
        //     name: '31'
        //   }

        // {
        //     app: 'live',
        //     flashver: 'FMLE/3.0 (compatible; FMSc/1.0)',
        //     swfurl: 'rtmp://us_west_1c_r.hotcat.live/live?secret=62fovpw9t7',
        //     tcurl: 'rtmp://us_west_1c_r.hotcat.live/live?secret=62fovpw9t7',
        //     pageurl: '',
        //     addr: '192.168.56.1',
        //     clientid: '221',
        //     call: 'update_publish',
        //     time: '15',
        //     timestamp: '13821',
        //     name: '31'
        //   }

        // const paramStr=msg.swfurl.split("?")[1]
        // const param = queryString.parse(paramStr);
        // const secret = param.secret as string
        
        // if (!secret) {
        //     ctx.status = 500;
        //     ctx.body = 1;
        //     return
        // }

        const streamId=parseInt(msg.name)
        if (streamId===null) {
            ctx.status = 500;
            ctx.body = 1;
            return
        }

        const stream = await livestreamManager.GetLiveStreamById(streamId)
        if (stream.status===ELiveStreamStatus.END) {
            ctx.status = 500;
            ctx.body = 1;
            return
        }

        const result=await livestreamManager.StreamKeepPush(streamId)
        if (result==false) {
            ctx.status = 500;
            ctx.body = 1;
            return
        }
        
        ctx.status = 200;
        ctx.body = 0;
    }

    async onUnPublish(ctx: koa.Context, next: koa.Next) {
        const msg: IStreamOnUnPublishMsg = ctx.request.body;
        console.log(msg);

        //check id and secret
        const paramStr=msg.swfurl.split("?")[1]
        const param = queryString.parse(paramStr);
        const secret = param.secret as string
        if (!secret) {
            ctx.status = 500;
            ctx.body = 1;
            return
        }
        const streamId=parseInt(msg.name)
        if (streamId===null) {
            ctx.status = 500;
            ctx.body = 1;
            return
        }

        const stream = await livestreamManager.GetLiveStreamById(streamId)
        if (stream.status===ELiveStreamStatus.END) {
            ctx.status = 200;
            ctx.body = 0;
            return
        }

        //modify status
        livestreamManager.ModifyStreamStatus(streamId,secret,ELiveStreamStatus.PAUSE)

        ctx.status = 200;
        ctx.body = 0;
    }
}

module.exports = srsNotifyController;
