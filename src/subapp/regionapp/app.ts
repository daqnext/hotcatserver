/*
 * @Author: your name
 * @Date: 2021-07-08 17:53:55
 * @LastEditTime: 2021-07-13 11:20:00
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /hotcatserver/src/subapp/regionapp/app.ts
 */
import path from "path";
import mount from "koa-mount";
import proxy from "koa-better-http-proxy";
import { config } from "../../config/conf";
import { rootDIR } from "../../global";
import { AppRouter } from "../../router/router";
import { LogHelper } from "../../utils/logHelper";
import { ipRegionInfo } from "../../manager/project/ipRegionInfo";
import { StartScheduleJob } from "./job/job";

LogHelper.Init();
console.log("region app start");

ipRegionInfo.init()

const controllerPath = path.join(rootDIR, "/subapp/regionapp/controller");
const appRouter = AppRouter.GenRouter(controllerPath);

//proxy /public/* request to center
appRouter.use(
    mount(
        "/public",
        proxy(config.center_host, {
            proxyReqPathResolver: function (ctx) {
                console.log(ctx.path);
                return "/public" + ctx.path;
            },
        })
    )
);

appRouter.listen(config.port,"0.0.0.0", () => {
    console.info("The application is listening on port : ", config.port);
});

StartScheduleJob()