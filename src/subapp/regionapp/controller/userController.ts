/*
 * @Author: your name
 * @Date: 2021-07-09 10:40:53
 * @LastEditTime: 2021-07-12 09:49:31
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /hotcatserver/src/subapp/regionapp/controller/userController.ts
 */

import router from "koa-router";
import proxy from "koa-better-http-proxy";
import { config } from "../../../config/conf";

class userController {
    public static init(Router: router) {
        let C = new userController();
        //config all the get requests
        Router.post("/api/user/register", proxy(config.center_host, {}));
        Router.post("/api/user/login", proxy(config.center_host, {}));
        Router.post("/api/user/uploadavatar", proxy(config.center_host, {}));

        //config all the post requests
        return C;
    }
}

module.exports = userController;
