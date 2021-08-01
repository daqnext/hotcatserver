/*
 * @Author: your name
 * @Date: 2021-08-01 14:42:48
 * @LastEditTime: 2021-08-01 17:18:02
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /hotcatserver/src/subapp/regionapp/controller/adminController.ts
 */

import koa from "koa";
import router from "koa-router";
import proxy from "koa-better-http-proxy";
import { config } from "../../../config/conf";
import { categoryManager } from "../../../manager/project/categoryManager";
import { resp } from "../../../utils/resp";
import { auth } from "../../../manager/common/auth";
import { livestreamManager } from "../../../manager/project/livestreamManager";
import { ILiveStream } from "../../../interface/interface";
import { Op } from "sequelize";
import { IDeleteLivestreamMsg } from "../../../interface/msg";
import { requestTool } from "../../../utils/request";

class adminController {
    public static init(Router: router) {
        let C = new adminController();
        //config all the get requests
        Router.post("/api/admin/managelist", auth.ParseTokenMiddleware(),auth.AuthMiddleware(["admin"]),C.adminManageListHandler);
        Router.post("/api/admin/deletestream", auth.ParseTokenMiddleware(),auth.AuthMiddleware(["admin"]),C.adminDeleteStreamHandler);

        //config all the post requests
        return C;
    }


    async adminManageListHandler(ctx: koa.Context, next: koa.Next){
        const msg = ctx.request.body;
        console.log(msg);

        const queryCondition: any = {};
        
        if (msg.streamId) {
            queryCondition.id = msg.streamId;
        }
        if (msg.streamName) {
            queryCondition.name = {
                [Op.like]:`%${msg.streamName}%`
            };
        }
        if (msg.userId) {
            queryCondition.userId = msg.userId;
        }
        if (msg.category) {
            queryCondition.category = msg.category;
        }
        if (msg.language) {
            queryCondition.language = msg.language;
        }
        // if (msg.region) {
        //     queryCondition.region = msg.region;
        // }
        if (msg.status) {
            queryCondition.status = msg.status;
        }


        const order = [["id", "ASC"]];

        const { rows, count } = await livestreamManager.DirectQueryLiveStreams(queryCondition, msg.limit, msg.offset, order);

        const streams: ILiveStream[] = [];
        for (let i = 0; i < rows.length; i++) {
            const liveStreamInfo: ILiveStream = {
                id: rows[i].id,
                name: rows[i].name,
                subTitle: rows[i].subTitle,
                category: rows[i].category,
                language: rows[i].language,
                description: rows[i].description,
                userId: rows[i].userId,
                userName: rows[i].userName,
                region: rows[i].region,
                secret: rows[i].secret,
                status: rows[i].status,
                duration: rows[i].duration,
                createTimeStamp: rows[i].createTimeStamp,
                startTimeStamp: rows[i].startTimeStamp,
                endTimeStamp: rows[i].endTimeStamp,
                coverImgUrl: rows[i].coverImgUrl,
                watched: rows[i].watched,
                // rtmpLink: streamUrl.rtmpLink,
                // originLiveM3u8Link: streamUrl.originLiveM3u8Link,
                // cdnLiveM3u8Link: streamUrl.cdnLiveM3u8Link,
                // originRecordM3u8Link: streamUrl.originRecordM3u8Link,
                // cdnRecordM3u8Link: streamUrl.cdnRecordM3u8Link,
            };
            streams.push(liveStreamInfo);

            const streamUrl = await livestreamManager.GetLiveStreamUrl(rows[i].region, rows[i].id, rows[i].secret);
            if (streamUrl === null) {
                continue;
            }

            liveStreamInfo.rtmpLink = streamUrl.rtmpLink;
            liveStreamInfo.originLiveM3u8Link = streamUrl.originLiveM3u8Link;
            liveStreamInfo.cdnLiveM3u8Link = streamUrl.cdnLiveM3u8Link;
            liveStreamInfo.originRecordM3u8Link = streamUrl.originRecordM3u8Link;
            liveStreamInfo.cdnRecordM3u8Link = streamUrl.cdnRecordM3u8Link;
        }

        console.log(streams);

        const responseData = {
            data: streams,
            count: count,
        };
        resp.send(ctx, 0, responseData);
    }

    async adminDeleteStreamHandler(ctx: koa.Context, next: koa.Next){
        const msg: IDeleteLivestreamMsg = ctx.request.body;
        console.log(msg);

        const success = await livestreamManager.DeleteLiveStream(msg.streamId, msg.secret);
        if (success == false) {
            resp.send(ctx, 1, null, "delete failed");
        }
        //delete bindDomain in cdn
        const requestUrl = config.cdn_host + "/api/v1/admin/hotcat/deletelivebinddomain";
        const sendData = {
            bindName: msg.streamId + "",
        };

        const cdnBindDomain = await requestTool.post(requestUrl, sendData, {
            headers: {
                Accept: "application/json",
                Authorization: "Basic " + config.cdn_requestToken,
            },
        });

        resp.send(ctx, 0);
    }
    
}

module.exports = adminController;