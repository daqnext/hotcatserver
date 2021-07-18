/*
 * @Author: your name
 * @Date: 2021-07-08 13:04:26
 * @LastEditTime: 2021-07-18 21:02:19
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /hotcatserver/src/controller/livestreamController.ts
 */

import koa from "koa";
import router from "koa-router";
import moment from "moment";
import { ICreateLivestreamMsg, IDeleteLivestreamMsg } from "../../../interface/msg";
import { auth } from "../../../manager/common/auth";
import multer from "@koa/multer";
import fs from "fs";
import path from "path";
import { rootDIR } from "../../../global";
import randomString from "string-random";
import { resp } from "../../../utils/resp";
import { Utils } from "../../../utils/utils";
import { livestreamManager } from "../../../manager/project/livestreamManager";
import { IUserInfo } from "../../../interface/interface";
import { ipRegionInfo } from "../../../manager/project/ipRegionInfo";
import { liveServerManager } from "../../../manager/project/liveserverManager";
import { config } from "../../../config/conf";
import { requestTool } from "../../../utils/request";

const upload = multer({
    limits: {
        fields: 10,
        files: 1,
        fileSize: 5 * 1024 * 1024, // 5MB
    },
    fileFilter: (ctx, file, cb) => {
        let extName = path.extname(file.originalname);
        if (!Utils.filterFileExt(extName, [".png", ".jpg", ".jpeg", ".bmp", ".svg"])) {
            cb(null, false);
            cb(new Error("format error"));
        } else {
            cb(null, true);
        }
    },
});
class livestreamController {
    public static init(Router: router) {
        let C = new livestreamController();
        //config all the get requests
        Router.post("/api/livestream/create", auth.ParseTokenMiddleware(), C.createLivestream);
        Router.post("/api/livestream/delete", auth.ParseTokenMiddleware(), C.deleteLivestream);
        Router.post("/api/livestream/get", C.getLivestream);
        Router.post("/api/livestream/query",auth.ParseTokenMiddleware(), C.queryLivestream)
        
        //uploadcover
        Router.post("/api/livestream/uploadcover",auth.ParseTokenMiddleware(),C.handleUploadCover);

        //watching
        Router.get("/api/livestream/watching/:streamId", C.watching);

        //config all the post requests
        return C;
    }

    async createLivestream(ctx: koa.Context, next: koa.Next) {
        const msg: ICreateLivestreamMsg = ctx.request.body;
        console.log(msg);
        const user: IUserInfo = ctx.state.user;
        console.log(user);

        //user ip
        const ip: string = Utils.getRequestIP(ctx.request);
        const ipInfo = ipRegionInfo.getIpInfo(ip);

        //liveServer
        const liveServer = await liveServerManager.GetAliveLiveServerWithUpLevelRegionBackup(
            ipInfo.region,
            ipInfo.continent,
            ipInfo.country
        );
        if (liveServer == null) {
            resp.send(ctx, 1, null, "no active live server");
            return;
        }

        const { livestream, errMsg } = await livestreamManager.CreateLiveStream(
            user.id,
            user.name,
            msg.streamName,
            msg.subTitle,
            msg.description,
            msg.category,
            liveServer.deviceId,
            msg.coverImgUrl
        );
        if (livestream == null) {
            resp.send(ctx, 1, null, errMsg);
            return;
        }
        const streamUrl = await livestreamManager.GetLiveStreamUrl(
            livestream.liveServerId,
            livestream.userId,
            livestream.id,
            livestream.streamKey
        );
        if (streamUrl === null) {
            await livestreamManager.DeleteLiveStream(livestream.id, livestream.streamKey);
            resp.send(ctx, 1, null, "no active live server");
            return;
        }

        //create bindDomain in cdn
        const requestUrl = config.cdn_host + "/api/v1/admin/hotcat/createlivebinddomain";
        const sendData = {
            userName: user.name,
            id: user.id,
            bindName: livestream.id + "",
            originUrl: streamUrl.originM3u8Link,
        };

        const cdnBindDomain = await requestTool.post(requestUrl, sendData, {
            headers: {
                Accept: "application/json",
                Authorization: "Basic " + config.cdn_requestToken,
            },
        });
        console.log(cdnBindDomain);
        if (cdnBindDomain.status !== 0) {
            //delete created livestream
            await livestreamManager.DeleteLiveStream(livestream.id, livestream.streamKey);
            resp.send(ctx, 1, null, "create cdn bindDomain error");
            return;
        }

        const streamInfo = {
            id: livestream.id,
            name: livestream.name,
            subTitle: livestream.subTitle,
            description: livestream.description,
            userId: livestream.userId,
            userName: livestream.userName,
            streamKey: livestream.streamKey,
            status: livestream.status,
            duration: livestream.duration,
            createTimeStamp: livestream.createTimeStamp,
            startTimeStamp: livestream.startTimeStamp,
            endTimeStamp: livestream.endTimeStamp,
            rtmpLink: streamUrl.rtmpLink,
            originM3u8Link: streamUrl.originM3u8Link,
            cdnM3u8Link: streamUrl.cdnM3u8Link,
            coverImgUrl: livestream.coverImgUrl,
        };

        resp.send(ctx, 0, streamInfo);
    }

    async deleteLivestream(ctx: koa.Context, next: koa.Next) {
        const msg: IDeleteLivestreamMsg = ctx.request.body;
        console.log(msg);

        const success = await livestreamManager.DeleteLiveStream(msg.streamId, msg.streamKey);
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

    async getLivestream(ctx: koa.Context, next: koa.Next) {
        const {id}:{id:number} = ctx.request.body;
        if (id===null) {
            resp.send(ctx,1,null,"no program info")
            return
        }

        const {livestream,errMsg}=await livestreamManager.GetLiveStreamById(id)
        if (livestream===null) {
            resp.send(ctx,1,null,"no program info")
            return
        }
        resp.send(ctx,0,livestream,null)
    }

    async queryLivestream(ctx: koa.Context, next: koa.Next){
        
    }

    async watching(ctx: koa.Context, next: koa.Next) {
        console.log(ctx.params);
        ctx.body = ctx.params;
    }

    async handleUploadCover(ctx: koa.Context, next: koa.Next) {
        try {
            await upload.single("cover")(ctx, next);

            let originName = path.normalize(ctx.file.originalname);
            let extName = path.extname(originName);
            if (!Utils.filterFileExt(extName, [".png", ".jpg", ".jpeg", ".bmp", ".svg"])) {
                resp.send(ctx, 1, null, "unsupported image file");
                return;
            }

            const imgInfo = Utils.sizeOfImg(ctx.file.buffer);
            if (imgInfo == null) {
                resp.send(ctx, 1, null, "unsupported file");
                return;
            }
            if (
                imgInfo.width < 100 ||
                imgInfo.width > 200 ||
                imgInfo.height < 100 ||
                imgInfo.height > 200
            ) {
                resp.send(ctx, 1, null, "image size error");
                return;
            }

            let fileName = originName.substring(0, originName.lastIndexOf("."));
            let randStr = randomString(10);
            let uploadFileUrl = path.join(
                "/public",
                "livestreamCover",
                fileName + "_" + randStr + extName
            );
            let saveFilePath = path.join(rootDIR, "../", uploadFileUrl);
            let dirName = path.dirname(saveFilePath);
            if (!fs.existsSync(dirName)) {
                fs.mkdirSync(path.dirname(saveFilePath));
            }
            fs.writeFileSync(saveFilePath, ctx.file.buffer);

            resp.send(ctx, 0, { url: uploadFileUrl });
        } catch (error) {
            console.log(error);

            if (error.message && error.message === "format error") {
                resp.send(ctx, 1, null, "file format error");
                return;
            }

            switch (error.code) {
                case "LIMIT_FILE_SIZE":
                    resp.send(ctx, 1, null, "File too large");
                    return;
                case "LIMIT_UNEXPECTED_FILE":
                    resp.send(ctx, 1, null, "unexpected field,upload error");
                    return;
                default:
            }
            resp.send(ctx, 1, null, "upload error");
            return;
        }
    }
}

module.exports = livestreamController;
