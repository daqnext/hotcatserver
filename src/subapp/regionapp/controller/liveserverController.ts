/*
 * @Author: your name
 * @Date: 2021-07-12 11:12:47
 * @LastEditTime: 2021-07-13 11:53:48
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /hotcatserver/src/subapp/regionapp/controller/liveserverController.ts
 */
import koa from "koa";
import router from "koa-router";
import proxy from "koa-better-http-proxy";
import { config } from "../../../config/conf";
import { categoryManager } from "../../../manager/project/categoryManager";
import { resp } from "../../../utils/resp";

class liveserverController {
    public static init(Router: router) {
        let C = new liveserverController();
        //config all the get requests
        Router.post("/api/liveserver/heartbeat", proxy(config.center_host,{}));

        //config all the post requests
        return C;
    }
}

module.exports = liveserverController;
