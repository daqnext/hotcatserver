/*
 * @Author: your name
 * @Date: 2021-07-12 11:44:38
 * @LastEditTime: 2021-07-13 13:35:38
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /hotcatserver/src/subapp/centerapp/controller/liveserverController.ts
 */
import koa from "koa";
import router from "koa-router";
import proxy from "koa-better-http-proxy";
import { config } from "../../../config/conf";
import { categoryManager } from "../../../manager/project/categoryManager";
import { resp } from "../../../utils/resp";
import { Utils } from "../../../utils/utils";
import { ipRegionInfo } from "../../../manager/project/ipRegionInfo";
import { liveServerManager } from "../../../manager/project/liveserverManager";
import { ILiveServerInfo } from "../../../interface/interface";
import moment from "moment";

class liveserverController {
    public static init(Router: router) {
        let C = new liveserverController();
        //config all the get requests
        Router.post("/api/liveserver/heartbeat", C.liveserverHeartBeat);

        //config all the post requests
        return C;
    }

    async liveserverHeartBeat(ctx: koa.Context, next: koa.Next) {
        // console.log(ctx.ip);
        // console.log(ctx.ips);
        // console.log(ctx.request.ip);
        // console.log(ctx.request.ips);
        // console.log(ctx.headers['x-real-ip']);
        // console.log(ctx.headers['x-forwarded-for']);
       

        let remoteIp: string = Utils.getRequestIP(ctx.request);
        //remoteIp='192.168.1.102'
        const ipInfo=ipRegionInfo.getIpInfo(remoteIp)
        console.log(ipInfo);

        const {device_id,ip}=ctx.request.body
        const serverInfo:ILiveServerInfo={
            ip:remoteIp,
            ipInfo:ipInfo,
            heartBeatTimeStamp:moment.now(),
            deviceId:device_id,
            spaceTotal:0,
            spaceFree:0
        }
        liveServerManager.UpdateLiveServerInfo(serverInfo)
        
        ctx.body=0
    }
}

module.exports = liveserverController;