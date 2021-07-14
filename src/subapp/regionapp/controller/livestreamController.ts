/*
 * @Author: your name
 * @Date: 2021-07-13 12:03:55
 * @LastEditTime: 2021-07-13 12:06:21
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /hotcatserver/src/subapp/regionapp/controller/livestreamController.ts
 */
import koa from "koa";
import router from "koa-router";
import moment from "moment";
import { ICreateLivestreamMsg, IDeleteLivestreamMsg } from "../../../interface/msg";
import { auth } from "../../../manager/common/auth";
import proxy from "koa-better-http-proxy";
import { config } from "../../../config/conf";
import multer from "@koa/multer";
import fs from "fs";
import path from "path";
import { rootDIR } from "../../../global";
import randomString from "string-random";
import { resp } from "../../../utils/resp";
import { Utils } from "../../../utils/utils";

class livestreamController {
    public static init(Router: router) {
        let C = new livestreamController();
        //config all the get requests
        Router.post("/api/livestream/create", proxy(config.center_host, {}));
        Router.post("/api/livestream/delete", proxy(config.center_host, {}));
        Router.post("/api/livestream/get", proxy(config.center_host, {}));

        Router.post("/api/livestream/uploadcover", proxy(config.center_host, {}));

        //watching
        Router.get("/api/livestream/watching/:streamId", C.watching);

        //config all the post requests
        return C;
    }

    async watching(ctx: koa.Context, next: koa.Next) {
        console.log(ctx.params);
        ctx.body = ctx.params;
    }
}

module.exports = livestreamController;
