/*
 * @Author: your name
 * @Date: 2021-07-08 13:04:26
 * @LastEditTime: 2021-07-13 15:23:30
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
        Router.post("/api/livestream/get", auth.ParseTokenMiddleware(), C.getLivestream);

        Router.post(
            "/api/livestream/uploadcover",
            auth.ParseTokenMiddleware(),
            C.handleUploadCover
        );

        //watching
        Router.get("/api/livestream/watching/:streamId", C.watching);

        //config all the post requests
        return C;
    }

    async createLivestream(ctx: koa.Context, next: koa.Next) {
        const msg: ICreateLivestreamMsg = ctx.request.body;
        console.log(msg);
        const user:IUserInfo=ctx.state.user
        console.log(user);

        //user ip
        const ip:string=Utils.getRequestIP(ctx.request)
        const ipInfo=ipRegionInfo.getIpInfo(ip)

        //liveServer
        const liveServer=await liveServerManager.GetAliveLiveServerWithUpLevelRegionBackup(ipInfo.region,ipInfo.continent,ipInfo.country)
        if (liveServer==null) {
            resp.send(ctx,1,null,"no active live server")
            return
        }

        const {livestream,errMsg}=await livestreamManager.CreateLiveStream(user.id,user.name,msg.streamName,liveServer.ip,msg.coverImgUrl)
        if (livestream==null) {
            resp.send(ctx,1,null,errMsg)
            return
        }
        
        const backData={
            rtmpUrl:"rtmp://"+livestream.liveServerAddress+"/live/"+user.id+"/"+livestream.name+"?secret="+livestream.streamKey,
            playbackUrl:"",
        }

        resp.send(ctx,0,backData)
    }

    async deleteLivestream(ctx: koa.Context, next: koa.Next) {
        const msg: IDeleteLivestreamMsg = ctx.request.body;
        console.log(msg);
        
        const success=await livestreamManager.DeleteLiveStream(msg.streamId,msg.streamKey)

        resp.send(ctx,0)
    }

    async getLivestream(ctx: koa.Context, next: koa.Next) {
        const msg: ICreateLivestreamMsg = ctx.request.body;
        console.log(msg);
        console.log(ctx.state.user);

        ctx.body = ctx.state.user;
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
