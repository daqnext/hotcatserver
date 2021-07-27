import koa from 'koa';
import router from 'koa-router';

class testController {

    public static init(Router:router)
    {
        let C= new testController();
        //config all the get requests
        Router.get('/helloworld',C.helloworld);

        //config all the post requests
        return C;
    }

    async helloworld(ctx:koa.Context, next:koa.Next)
    {
        ctx.body={key:'hello world'};
        await next();
    }

}

module.exports=testController;