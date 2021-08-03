/*
 * @Author: your name
 * @Date: 2021-07-08 13:04:26
 * @LastEditTime: 2021-08-03 14:17:43
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /hotcatserver/src/controller/livestreamController.ts
 */

import koa from "koa";
import router from "koa-router";
import moment from "moment";
import {
    ICreateLivestreamMsg,
    IDeleteCoverMsg,
    IDeleteLivestreamMsg,
    IFinishLivestreamMsg,
    IFinishUploadMsg,
    IGetVideoListMsg,
    IQueryLivestreamMsg,
    IUpdateLivestreamMsg,
} from "../../../interface/msg";
import { auth } from "../../../manager/common/auth";
import multer from "@koa/multer";
import asyncBusboy from 'async-busboy';
import fs from "fs";
import path from "path";
import { rootDIR } from "../../../global";
import randomString from "string-random";
import { resp } from "../../../utils/resp";
import { Utils } from "../../../utils/utils";
import { livestreamManager } from "../../../manager/project/livestreamManager";
import { ELiveStreamStatus, ILiveStream, IRemoteServerInfo, IUserInfo } from "../../../interface/interface";
import { ipRegionInfo } from "../../../manager/project/ipRegionInfo";
import { liveServerManager } from "../../../manager/project/liveserverManager";
import { config } from "../../../config/conf";
import { requestTool } from "../../../utils/request";
import { remoteUploader } from "../../../manager/project/remoteUploader";
import { sftpManager } from "../../../manager/project/sftpManager";

const uploadCover = multer({
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

const uploadVideo = multer({
    limits: {
        fields: 10,
        files: 1,
        fileSize: 500 * 1024 * 1024, // 500MB
    },
    fileFilter: (ctx, file, cb) => {
        let extName = path.extname(file.originalname);
        if (!Utils.filterFileExt(extName, [".mp4"])) {
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
        Router.post("/api/livestream/update", auth.ParseTokenMiddleware(), C.updateLivestream);
        Router.post("/api/livestream/finish", auth.ParseTokenMiddleware(), C.finishLivestream);
        Router.post("/api/livestream/managelist", auth.ParseTokenMiddleware(), C.manageListLivestream);

        Router.post("/api/livestream/finishupload", auth.ParseTokenMiddleware(),auth.AuthMiddleware(["admin"]), C.finishUploadLivestream);

        Router.post("/api/livestream/get", C.getLivestream);
        Router.post("/api/livestream/query", auth.ParseTokenMiddleware(), C.queryLivestream);

        Router.post("/api/livestream/getvideolist", C.handleGetVideoList);

        //uploadvideo
        Router.post("/api/livestream/uploadvideo", auth.ParseTokenMiddleware(),auth.AuthMiddleware(["admin"]), C.handleUploadVideo);

        //uploadcover
        Router.post("/api/livestream/uploadcover", auth.ParseTokenMiddleware(), C.handleUploadCover);
        //deleteCover
        Router.post("/api/livestream/deletecover", auth.ParseTokenMiddleware(), C.handleDeleteCover);

        //watching
        Router.get("/api/livestream/watching/:streamId/:category", C.watching);
        //watch
        Router.get("/api/livestream/watch/:streamId/:category", C.watch);

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
        //console.info(ip)
        //console.info(ipInfo)

        const region=ipRegionInfo.getRegionByArea(msg.area)
        console.log(region);
        
        //liveServer
        const liveServer = await liveServerManager.GetLiveServerByRegion(region);
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
            msg.language,
            region,
            msg.coverImgUrl
        );
        if (livestream == null) {
            resp.send(ctx, 1, null, errMsg);
            return;
        }
        const streamUrl = await livestreamManager.GetLiveStreamUrl(livestream.region, livestream.id, livestream.secret);
        if (streamUrl === null) {
            await livestreamManager.DeleteLiveStream(livestream.id, livestream.secret);
            resp.send(ctx, 1, null, "no active live server");
            return;
        }

        //create bindDomain in cdn
        const requestUrl = config.cdn_host + "/api/v1/admin/hotcat/createlivebinddomain";
        const sendData = {
            userName: user.name,
            id: user.id,
            bindName: livestream.id + "",
            originLiveUrl: streamUrl.originLiveM3u8Link,
            originRecordUrl: streamUrl.originRecordM3u8Link,
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
            await livestreamManager.DeleteLiveStream(livestream.id, livestream.secret);
            resp.send(ctx, 1, null, "create cdn bindDomain error");
            return;
        }

        const streamInfo: ILiveStream = {
            id: livestream.id,
            name: livestream.name,
            subTitle: livestream.subTitle,
            category: livestream.category,
            language: livestream.language,
            description: livestream.description,
            userId: livestream.userId,
            userName: livestream.userName,
            region: livestream.region,
            secret: livestream.secret,
            status: livestream.status,
            duration: livestream.duration,
            createTimeStamp: livestream.createTimeStamp,
            startTimeStamp: livestream.startTimeStamp,
            endTimeStamp: livestream.endTimeStamp,
            coverImgUrl: livestream.coverImgUrl,
            watched: livestream.watched,
            rtmpLink: streamUrl.rtmpLink,
            originLiveM3u8Link: streamUrl.originLiveM3u8Link,
            cdnLiveM3u8Link: streamUrl.cdnLiveM3u8Link,
            originRecordM3u8Link: streamUrl.originRecordM3u8Link,
            cdnRecordM3u8Link: streamUrl.cdnRecordM3u8Link,
        };

        resp.send(ctx, 0, streamInfo);
    }

    async deleteLivestream(ctx: koa.Context, next: koa.Next) {
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

    async getLivestream(ctx: koa.Context, next: koa.Next) {
        const { id }: { id: number } = ctx.request.body;
        if (id === null) {
            resp.send(ctx, 1, null, "no program info");
            return;
        }

        const livestream = await livestreamManager.GetLiveStreamById(id);
        if (livestream === null) {
            resp.send(ctx, 1, null, "no program info");
            return;
        }
        resp.send(ctx, 0, livestream, null);
    }

    async updateLivestream(ctx: koa.Context, next: koa.Next) {
        const msg: IUpdateLivestreamMsg = ctx.request.body;
        if (msg === null) {
            resp.send(ctx, 1, null, "no program info");
            return;
        }

        const user: IUserInfo = ctx.state.user;
        console.log(user);

        const success = await livestreamManager.UpdateLiveStream(
            msg.streamId,
            msg.secret,
            msg.streamName,
            msg.subTitle,
            msg.description,
            msg.category,
            msg.language,
            msg.coverImgUrl
        );
        if (success === false) {
            resp.send(ctx, 1, null, "no program info");
            return;
        }

        resp.send(ctx, 0, null, null);
    }

    async finishLivestream(ctx: koa.Context, next: koa.Next) {
        const msg: IFinishLivestreamMsg = ctx.request.body;
        if (msg === null) {
            resp.send(ctx, 1, null, "no program info");
            return;
        }

        const user: IUserInfo = ctx.state.user;
        console.log(user);

        const success = await livestreamManager.ModifyStreamStatus(msg.streamId, msg.secret, ELiveStreamStatus.END);
        if (success === false) {
            resp.send(ctx, 1, null, "no program info");
            return;
        }

        resp.send(ctx, 0);
    }

    async manageListLivestream(ctx: koa.Context, next: koa.Next) {
        const msg: IQueryLivestreamMsg = ctx.request.body;
        console.log(msg);
        const user: IUserInfo = ctx.state.user;
        console.log(user);

        const queryCondition: any = {};
        if (msg.category) {
            queryCondition.category = msg.category;
        }
        if (msg.region) {
            queryCondition.region = msg.region;
        }
        if (msg.status) {
            queryCondition.status = msg.status;
        }

        queryCondition.userId = user.id;

        const order = [["id", "DESC"]];

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

        //console.log(streams);

        const responseData = {
            data: streams,
            count: count,
        };
        resp.send(ctx, 0, responseData);
    }

    async queryLivestream(ctx: koa.Context, next: koa.Next) {
        const msg: IQueryLivestreamMsg = ctx.request.body;
        if (msg === null) {
            resp.send(ctx, 1, null, "no program info");
            return;
        }

        // const queryCondition:any ={}
        // if (msg.category) {
        //     queryCondition.category=msg.category
        // }
        // if (msg.region) {
        //     queryCondition.region=msg.region
        // }
        // if (msg.status) {
        //     queryCondition.status=msg.status
        // }
        // if (msg.userId) {
        //     queryCondition.userId=msg.userId
        // }
        // if (msg.userName) {
        //     queryCondition.userName=msg.userName
        // }

        // const {rows,count}=await livestreamManager.GetLiveStreams(queryCondition,msg.limit,msg.offset)

        // const responseData={
        //     data:rows,
        //     count:count
        // }
        // resp.send(ctx,0,responseData)
    }

    async handleGetVideoList(ctx: koa.Context, next: koa.Next) {
        const msg: IGetVideoListMsg = ctx.request.body;
        if (msg === null) {
            resp.send(ctx, 1, null, "no program info");
            return;
        }
        //console.log(msg);
        
        if (msg.isOnlyOnLive) {
            const result=await livestreamManager.GetOnLiveStreamList(msg.lastIndexMap,msg.count)
            //console.log(result);
            resp.send(ctx,0,result)
        }else{
            const result=await livestreamManager.GetLiveStreamList(msg.category,msg.lastIndexMap,msg.count)
            //console.log(result);
            resp.send(ctx,0,result)
        }
        
    }

    async watching(ctx: koa.Context, next: koa.Next) {
        console.log(ctx.params);
        ctx.body = ctx.params;
    }

    async watch(ctx: koa.Context, next: koa.Next) {
        console.log(ctx.params);
        const id = ctx.params.streamId;
        const category = ctx.params.category;
        livestreamManager.AddWatched(id,category);

        resp.send(ctx, 0);
    }
    async handleUploadCover(ctx: koa.Context, next: koa.Next) {
        try {
            await uploadCover.single("cover")(ctx, next);

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
            // if (
            //     imgInfo.width < 160 ||
            //     imgInfo.width > 640 ||
            //     imgInfo.height < 90 ||
            //     imgInfo.height > 360
            // ) {
            //     resp.send(ctx, 1, null, "image size error");
            //     return;
            // }

            const user: IUserInfo = ctx.state.user;
            let fileName = originName.substring(0, originName.lastIndexOf("."));
            let randStr = randomString(10);

            //save to local 
            //let uploadFileUrl = path.join("/public", "livestreamCover", user.id + "", fileName + "_" + randStr + extName);
            // let saveFilePath = path.join(rootDIR, "../", uploadFileUrl);
            // let dirName = path.dirname(saveFilePath);
            // if (!fs.existsSync(dirName)) {
            //     fs.mkdirSync(path.dirname(saveFilePath), { recursive: true });
            // }
            // fs.writeFileSync(saveFilePath, ctx.file.buffer);

            //upload to usa rtmp
            const {storageSeverAddress}=await liveServerManager.GetLiveServerByRegion(config.coverSeverRegion)
            const remoteServerInfo=await remoteUploader.GetRemoteServerInfo(storageSeverAddress)

            let fileUrl=path.join("/livestreamCover", user.id + "", fileName + "_" + randStr + extName)
            let remoteFilePath=path.join("/srv/www", fileUrl);
            const result =await sftpManager.UploadBufferToRemoteServer(ctx.file.buffer,remoteFilePath,remoteServerInfo)
            if (result==false) {
                resp.send(ctx, 1, null,"upload error");
                return 
            }
            resp.send(ctx, 0, { url: storageSeverAddress+fileUrl });
            
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

    async handleDeleteCover(ctx: koa.Context, next: koa.Next) {
        const msg: IDeleteCoverMsg = ctx.request.body;
        console.log(msg);
        const user: IUserInfo = ctx.state.user;
        console.log(user);

        let name = msg.imgName;

        //delete local
        //handle name for safe
        // name = name.replace("..", "");
        // name = path.basename(name);
        // console.log(name);

        // let fileName = path.join("/public", "livestreamCover", user.id + "", name);
        // let saveFilePath = path.join(rootDIR, "../", fileName);
        // console.log(saveFilePath);

        // if (fs.existsSync(saveFilePath)) {
        //     fs.unlinkSync(saveFilePath);
        // }

        //delete remote
        //handle name for safe
        name = name.replace("..", "");
        console.log(name);
        //http://us_west_1c_s.hotcat.live/livestreamCover/4/WX20210410-102428@2x_1gmgMr0PBt.png

        const urlInfo = new URL(name);
        urlInfo.origin

        const filePath=urlInfo.pathname
        const id=filePath.split("/")[2]
        console.log(id);
        // resp.send(ctx, 1,null,"no auth");
        // return
            
        if (user.id+""!==id) {
            resp.send(ctx, 1,null,"no auth");
            return
        }


        const {storageSeverAddress}=await liveServerManager.GetLiveServerByRegion(urlInfo.origin)
            const remoteServerInfo=await remoteUploader.GetRemoteServerInfo(storageSeverAddress)

            
            let remoteFilePath=path.join("/srv/www", urlInfo.pathname);
            const result =await sftpManager.DeleteRemoteServerFile(remoteFilePath,remoteServerInfo)
            if (result==false) {
                
                resp.send(ctx, 1, null,"delete error");
                return 
            }

        resp.send(ctx, 0);
        return;
    }

    async finishUploadLivestream(ctx: koa.Context, next: koa.Next){
        const msg: IFinishUploadMsg = ctx.request.body;
        console.log(msg);

        const result=await livestreamManager.FinishUpload(msg.id)
        if (result===false) {
            resp.send(ctx, 1);
        }

        resp.send(ctx,0);
    }

    async handleUploadVideo(ctx: koa.Context, next: koa.Next){
        try {
            await uploadVideo.single("video")(ctx, next);

            //streamId
            const { streamId }=ctx.request.body
            const id=parseInt(streamId)
            //streamInfo
            const streamInfo=await livestreamManager.GetLiveStreamById(id)
            //console.log(streamInfo);
            if (streamInfo.status !== "ready") {
                //not a empty stream
                resp.send(ctx,1,null,"not a empty stream");
                return
            }
            
            //userInfo
            const user: IUserInfo = ctx.state.user;
            
            //fileInfo
            let originName = path.normalize(ctx.file.originalname);

            //save file to temp dir
            let uploadFileUrl = path.join("/temp", "video", user.id + "", originName);
            let saveFilePath = path.join(rootDIR, "../", uploadFileUrl);
            let dirName = path.dirname(saveFilePath);
            if (!fs.existsSync(dirName)) {
                fs.mkdirSync(path.dirname(saveFilePath), { recursive: true });
            }
            fs.writeFileSync(saveFilePath, ctx.file.buffer);

            //remoteServerInfo
            const remoteServerInfo=await remoteUploader.GetRemoteServerInfo(streamInfo.originRecordM3u8Link)
            
            //transcode
            const outputDir=path.join(rootDIR, "../", "temp","hls",streamInfo.id+"");
            let result =await remoteUploader.transcodeVideo(saveFilePath,remoteServerInfo.host,streamInfo.id,outputDir)
            if (!result) {
                resp.send(ctx,1,null,"Transcode error");
                return
            }
            //upload
            const remoteDir="/srv/www/record/"+streamId
            result=await remoteUploader.uploadFolderToRemote(outputDir,remoteDir,remoteServerInfo)
            if (!result) {
                resp.send(ctx,1,null,"Upload to rtmp server error");
                return
            }

            //modify state
            livestreamManager.FinishUpload(streamInfo.id)

            //delete local
            Utils.delFile(outputDir,"")
            Utils.delFile(saveFilePath,"")
        
            resp.send(ctx,0);
        } catch (error) {
            console.log(error);
            resp.send(ctx,1,null,error);
        }
    }
}

module.exports = livestreamController;
