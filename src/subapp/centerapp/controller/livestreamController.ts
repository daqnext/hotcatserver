/*
 * @Author: your name
 * @Date: 2021-07-08 13:04:26
 * @LastEditTime: 2021-07-09 11:17:25
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /hotcatserver/src/controller/livestreamController.ts
 */

import koa from "koa";
import router from "koa-router";
import moment from "moment";
import { ICreateLivestreamMsg, IDeleteLivestreamMsg } from "../../../interface/msg";
import { auth } from "../../../manager/common/auth";


class livestreamController {
  public static init(Router: router) {
    let C = new livestreamController();
    //config all the get requests
    Router.post("/api/livestream/create", auth.ParseTokenMiddleware(), C.createLivestream);
    Router.post("/api/livestream/delete", auth.ParseTokenMiddleware(), C.deleteLivestream);
    Router.post("/api/livestream/get", auth.ParseTokenMiddleware(), C.getLivestream);

    //watching
    Router.get("/api/livestream/watching/:streamId", C.watching);

    //config all the post requests
    return C;
  }

  async createLivestream(ctx: koa.Context, next: koa.Next) {
    const msg: ICreateLivestreamMsg = ctx.request.body;
    console.log(msg);
    console.log(ctx.state.user);
    
    ctx.body=ctx.state.user
  }

  async deleteLivestream(ctx: koa.Context, next: koa.Next) {
    const msg: IDeleteLivestreamMsg = ctx.request.body;
    console.log(msg);
    console.log(ctx.state.user);
    
    ctx.body=ctx.state.user
  }

  async getLivestream(ctx: koa.Context, next: koa.Next) {
    const msg: ICreateLivestreamMsg = ctx.request.body;
    console.log(msg);
    console.log(ctx.state.user);
    
    ctx.body=ctx.state.user
  }

  async watching(ctx: koa.Context, next: koa.Next){
        console.log(ctx.params);
        ctx.body=ctx.params
  }
}

module.exports = livestreamController;
