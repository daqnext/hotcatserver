import Redis from "ioredis";
import {config} from '../config/conf';


class redisTool {

    
    public static redistool:redisTool=null;
    public redis:Redis.Redis=null;

    constructor(){
        this.redis=new Redis({
            port:config.redis_port,
            host:config.redis_host,
            family:config.redis_family,
            password:config.redis_password,
            db:config.redis_db
         });
         
    }

    public  static getSingleInstance():redisTool{
        if(!redisTool.redistool){
            redisTool.redistool=new redisTool();
        }
        return redisTool.redistool;
    }

    public  auth(){
        console.info("redisu status",this.redis.status)
        return this.redis.status;
    }
}



export{
    redisTool
}