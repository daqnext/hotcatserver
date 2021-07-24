/*
 * @Author: your name
 * @Date: 2021-07-09 10:02:31
 * @LastEditTime: 2021-07-23 11:01:14
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /hotcatserver/src/subapp/regionapp/controller/commonController.ts
 */
import koa from "koa";
import router from "koa-router";
import proxy from "koa-better-http-proxy";
import { config } from "../../../config/conf";
import { categoryManager } from "../../../manager/project/categoryManager";
import { resp } from "../../../utils/resp";
import { languageManager } from "../../../manager/project/languageManager";

class commonController {
    public static init(Router: router) {
        let C = new commonController();
        //config all the get requests
        Router.get("/api/getcaptcha", proxy(config.center_host, {}));
        Router.get("/api/getcategory", C.getCategory);
        Router.get("/api/getlanguage", C.getLanguage);

        //config all the post requests
        return C;
    }

    async getCategory(ctx: koa.Context, next: koa.Next) {
        let{categoryMap, errMsg}=await categoryManager.regionGetAllCategory()
        if (categoryMap === null) {
            resp.send(ctx,1,null,errMsg)
            return;
        }
        resp.send(ctx,0,categoryMap)
    }

    async getLanguage(ctx: koa.Context, next: koa.Next) {
        let{languageMap, errMsg}=await languageManager.regionGetAllLanguage()
        if (languageMap === null) {
            resp.send(ctx,1,null,errMsg)
            return;
        }
        resp.send(ctx,0,languageMap)
    }
}

module.exports = commonController;
