/*
 * @Author: your name
 * @Date: 2021-07-08 17:53:55
 * @LastEditTime: 2021-07-09 09:18:57
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /hotcatserver/src/subapp/regionapp/app.ts
 */
import path from "path";
import { rootDIR } from "../../global";
import { AppRouter } from "../../router/router";
import { LogHelper } from "../../utils/logHelper";

const controllerPath=path.join(rootDIR,"/subapp/regionapp/controller")
LogHelper.Init()
console.log("region app start")
new AppRouter().init(controllerPath)