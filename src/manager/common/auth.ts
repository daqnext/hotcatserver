/*
 * @Author: your name
 * @Date: 2021-07-08 15:19:51
 * @LastEditTime: 2021-07-08 17:11:42
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /hotcatserver/src/manager/common/auth.ts
 */
import koa from "koa";
import { IUserInfo } from "../../interface/interface";
import { userManager } from "../project/userManager";

class auth{
    static ParseTokenMiddleware(passthrough:boolean=false){
        return async function(ctx: koa.Context, next: koa.Next){
            const token=ctx.request.header["authorization"]
            if (!token&&passthrough==false) {
                ctx.body={
                    status:0,
                    msg:"no auth"
                }
                return
            }
            
            if (token) {
                let userToken=token.split(" ")[1]
                const {user}=await userManager.getUserByCookie(userToken)
                if (user===null&&passthrough==false) {
                ctx.body={
                    status:0,
                    msg:"no auth"
                }
                return
            }
            
            ctx.state.user=user
            }
            
            await next()
        }
    }

    static AuthMiddleware(needOneOfAuths:string[]){
        return async function(ctx: koa.Context, next: koa.Next){
            const user:IUserInfo=ctx.state.user
            if (!user) {
                ctx.body={
                    status:0,
                    msg:"user not exist"
                }
                return
            }
            
            let userAuth=user.permission
            let havePermission=false
            for (let index = 0; index < userAuth.length; index++) {
                const auth = userAuth[index];
                if(needOneOfAuths.includes(auth)){
                    havePermission=true
                    break
                }
            }
            if (!havePermission) {
                ctx.body={
                    status:0,
                    msg:"no auth"
                }
                return
            }
            await next()
        }
    }
    
}
export {auth}