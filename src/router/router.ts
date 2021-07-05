import {logger,rootDIR} from '../global';
import {config} from '../config/conf';
import fs from 'fs';
import koa from 'koa';
import router from 'koa-router';
const json = require('koa-json')


class AppRouter{


    static async preprocess(ctx:koa.Context,next:koa.Next){
        //console.log("preprocess-start");
        await next();
        //console.log("preprocess-back");
    }

    static async postprocess(ctx:koa.Context,next:koa.Next){
        //console.log("postprocess-start");
        await next();
        //console.log("postprocess-back");
    }

 

    static async afterprocess(){

    }

    static init() 
    {
            const App = new koa();
            const Router = new router();

            fs.readdir(rootDIR+'/controller', (err, files) => {

                //no any controller do nothing
                if(files==null||files.length==0){
                    logger.error("no any controller file server won't start ");
                    return;
                }

                //initialize all the controllers
                files.forEach(file => {
                    require('../controller/'+file).init(Router);
                });

                //pretty-json
                App.use(json());

                //initialize the error handler
                App.use(async (ctx, next)=>{
                    try{
                        await next();   // execute code for descendants
                        if(!ctx.body){  // no resources
                            ctx.status = 404;
                            ctx.body = "not found"

                            logger.warn("not found 404:",ctx.request);
                        }
                    }catch(e){
                        // If the following code reports an error, return 500
                        ctx.status = 500;
                        ctx.body = "server error"
                        logger.warn("erver error:",ctx.request);
                    }
                })

                
                App.use(AppRouter.preprocess);
                App.use(Router.routes()).use(Router.allowedMethods());
                App.use(AppRouter.postprocess);
            
                //start the server
                App.listen(config.port, () => {
                    //console.log('asdfasf');
                    logger.info('The application is listening on port : ',config.port);
                })

            });            
    }
}

export {
    AppRouter
};