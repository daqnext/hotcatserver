/*
 * @Author: your name
 * @Date: 2021-07-13 12:03:55
 * @LastEditTime: 2021-07-21 16:57:48
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
import request from "request";

class livestreamController {
    public static init(Router: router) {
        let C = new livestreamController();
        //config all the get requests
        Router.post("/api/livestream/create", proxy(config.center_host, {}));
        Router.post("/api/livestream/delete", proxy(config.center_host, {}));
        Router.post("/api/livestream/update", proxy(config.center_host, {}));
        Router.post("/api/livestream/finish", proxy(config.center_host, {}));
        Router.post("/api/livestream/list", proxy(config.center_host, {}));

        Router.post("/api/livestream/get", proxy(config.center_host, {}));
        Router.post("/api/livestream/query", proxy(config.center_host, {}));

        // Router.post("/api/livestream/uploadcover", proxy(config.center_host, {}));
        Router.post("/api/livestream/uploadcover", async (ctx) => {
            const res = await ctx.req.pipe(request.post(config.center_host + "/api/livestream/uploadcover"));
            ctx.body = res;
        });
        //deleteCover
        Router.post("/api/livestream/deletecover", proxy(config.center_host, {}));

        //watching
        Router.get("/api/livestream/watching/:streamId", proxy(config.center_host, {}));
        //watch
        Router.get("/api/livestream/watch/:streamId", proxy(config.center_host, {}));

        //config all the post requests
        return C;
    }
}

module.exports = livestreamController;
