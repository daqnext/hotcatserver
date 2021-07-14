/*
 * @Author: your name
 * @Date: 2021-07-08 17:54:00
 * @LastEditTime: 2021-07-13 11:19:51
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /hotcatserver/src/subapp/centerapp/app.ts
 */

import path from "path";
import koaStatic from "koa-static";
import mount from "koa-mount";
import { config } from "../../config/conf";
import { rootDIR } from "../../global";
import { AppRouter } from "../../router/router";
import { LogHelper } from "../../utils/logHelper";
import { ipRegionInfo } from "../../manager/project/ipRegionInfo";
import { StartScheduleJob } from "./job/job";

LogHelper.Init();
console.log("center app start");

ipRegionInfo.init()

const controllerPath = path.join(rootDIR, "/subapp/centerapp/controller");
const appRouter = AppRouter.GenRouter(controllerPath);

// /public/* request as staticFile
appRouter.use(mount("/public", koaStatic(path.join(rootDIR, "../public"),{defer:true})));

appRouter.listen(config.port,"0.0.0.0", () => {
    console.info("The application is listening on port : ", config.port);
});

StartScheduleJob()
