/*
 * @Author: your name
 * @Date: 2021-07-09 10:02:31
 * @LastEditTime: 2021-07-09 10:52:42
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /hotcatserver/src/subapp/regionapp/controller/commonController.ts
 */
import router from "koa-router";
import proxy from "koa-better-http-proxy";
import { config } from "../../../config/conf";

class commonController {
    public static init(Router: router) {
        let C = new commonController();
        //config all the get requests
        Router.get("/api/getcaptcha", proxy(config.center_host, {}));

        //config all the post requests
        return C;
    }
}

module.exports = commonController;
