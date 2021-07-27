/*
 * @Author: your name
 * @Date: 2021-07-09 08:50:53
 * @LastEditTime: 2021-07-26 10:29:14
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /hotcatserver/src/router/router.ts
 */
import { logger, rootDIR } from "../global";
import { config } from "../config/conf";
import fs from "fs";
import koa from "koa";
import koa_logger from "koa-logger";
import cors from "koa2-cors";
import router from "koa-router";
import moment from "moment";
import bodyParser from "koa-bodyparser";
import path from "path";
const json = require("koa-json");

const koaLogger = koa_logger((str) => {
    console.log(str);
});

class AppRouter {
    // app:koa<koa.DefaultState, koa.DefaultContext>=null
    // router:router=null

    static async preprocess(ctx: koa.Context, next: koa.Next) {
        //console.log("preprocess-start");
        await next();
        //console.log("preprocess-back");
    }

    static async postprocess(ctx: koa.Context, next: koa.Next) {
        //console.log("postprocess-start");
        await next();
        //console.log("postprocess-back");
    }

    static async afterprocess() {}

    static GenRouter(controllerPath: string,allowCors:boolean=true) {
        const App = new koa({
            proxy: true,
            proxyIpHeader: "X-Real-IP",
        });
        const Router = new router();

        //cross
        if (allowCors) {
            App.use(
                cors({
                    origin: function(ctx) {    
                        return '*';
                    },
                    credentials: true, 
                })
            );
        }
        
        App.use(koaLogger);
            //initialize the error handler
            App.use(async (ctx, next) => {
                try {
                    await next(); // execute code for descendants
                    if (ctx.body === undefined) {
                        // no resources
                        ctx.status = 404;
                        ctx.body = "not found";

                        console.warn("not found 404:", ctx.request);
                    }
                } catch (e) {
                    // If the following code reports an error, return 500
                    ctx.status = 500;
                    ctx.body = "server error";
                    console.warn("erver error:", ctx.request);
                }
            });

            App.use(
                bodyParser({
                    //multipart: true,
                    onerror: function (err, ctx) {
                        ctx.throw("body parse error", 422);
                    },
                })
            );

            //App.use(AppRouter.preprocess);
            App.use(Router.routes()).use(Router.allowedMethods());
            //App.use(AppRouter.postprocess);

        try {
            let files = fs.readdirSync(controllerPath);
            //no any controller do nothing
            if (files == null || files.length == 0) {
                console.error("no any controller file server won't start ");
                return;
            }

            //initialize all the controllers
            files.forEach((file) => {
                const filePath = path.join(controllerPath, file);
                require(filePath).init(Router);
            });
            
        } catch (error) {
            console.error("no any controller file server won't start ");
            return;
        }

        return App;
    }
}

export { AppRouter };
