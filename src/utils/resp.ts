/*
 * @Author: your name
 * @Date: 2021-07-09 15:05:13
 * @LastEditTime: 2021-07-09 15:09:10
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /hotcatserver/src/utils/resp.ts
 */

import koa from 'koa'

class resp{
    static send(ctx:koa.Context,status:number=0,data:any=null,msg:string=null){
        ctx.body={
            status:status,
            data:data,
            msg:msg,
        }
    }
}

export{resp}