/*
 * @Author: your name
 * @Date: 2021-07-08 17:54:00
 * @LastEditTime: 2021-07-09 09:09:01
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /hotcatserver/src/subapp/centerapp/app.ts
 */

import path from "path";
import { rootDIR } from "../../global";
import { AppRouter } from "../../router/router";
import { LogHelper } from "../../utils/logHelper";

const controllerPath=path.join(rootDIR,"/subapp/centerapp/controller")
LogHelper.Init()
console.log("center app start")
new AppRouter().init(controllerPath)

