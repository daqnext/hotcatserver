/*
 * @Author: your name
 * @Date: 2021-07-07 10:47:59
 * @LastEditTime: 2021-07-09 10:52:35
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /hotcatserver/src/controller/testController.ts
 */
import koa from "koa";
import router from "koa-router";
import moment from "moment";
import { Utils } from "../../../utils/utils";

class testController {
    public static init(Router: router) {
        let C = new testController();
        //config all the get requests
        Router.get("/api/helloworld", C.helloworld);
        Router.get("/api/health", C.health);
        Router.get("/api/test", C.test);

        //config all the post requests
        return C;
    }

    async helloworld(ctx: koa.Context, next: koa.Next) {
        ctx.body = { key: "hello world" };
    }

    async health(ctx: koa.Context, next: koa.Next) {
        ctx.body = {
            status: 0,
            data: moment(),
        };
    }

    async test(ctx: koa.Context, next: koa.Next) {
        const ip: string = Utils.getRequestIP(ctx.request);

        ctx.body = {
            status: 0,
            data: moment().format("YYYY-MM-DD HH:mm:ss.SSS"),
            test: 2,
        };
    }
}

module.exports = testController;
