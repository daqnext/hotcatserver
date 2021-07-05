import {config} from '../config/conf';
import {redisTool} from "../redis/redisTool"
import {Time} from "../global"
import {logger} from "../global"


class cacheTool{

    // hold 5 seconds in local cache
    public  static local_cache_hold= 5; 
    public  static local_fast_map={};
    private static prefix=config.cache_prefix;

    public static postkey(prekey){
        return cacheTool.prefix+prekey;
    }

    private static fast_return(postkey){
        if( postkey in cacheTool.local_fast_map && 
            (cacheTool.local_fast_map[postkey].time+cacheTool.local_cache_hold)>Time.now()){
            logger.debug("local fast cache hit, postkey:",postkey,", value:",cacheTool.local_fast_map[postkey].value);    
            return {localcached:true,result:cacheTool.local_fast_map[postkey].value};
        }
        logger.debug("local fast cache miss, postkey:",postkey);  
        return  {localcached:false,result:null};
    }

    private static fast_cache(postkey,result){
        if(result!==null){
            cacheTool.local_fast_map[postkey]={time:Time.now(),value:result};
            logger.debug("local cache save, postkey:",postkey); 
        }
    }


    ///////////////// key-value /////////////////
    public static async fast_get(postkey){
        let fast_cached=cacheTool.fast_return(postkey+"_get"); 
        if(fast_cached.localcached) {
            return fast_cached.result;
        }

        let result=await redisTool.getSingleInstance().redis.get(postkey);
        cacheTool.fast_cache(postkey+"_get",result); 

        return result;
    }


    public static async fast_mget(...postkeys){
        let postkey=[...postkeys].reduce((acc,next)=>acc+next,'')+"_mget";

        let fast_cached=cacheTool.fast_return(postkey); 
        if(fast_cached.localcached) {
            return fast_cached.result;
        }

        let result=await redisTool.getSingleInstance().redis.mget(postkeys);
        cacheTool.fast_cache(postkey,result);

        return result;
    }



    ///////////////// hash /////////////////
    public static async fast_hget(postkey,field){
        let fast_cached=cacheTool.fast_return(postkey+field+"_hget"); 
        if(fast_cached.localcached) {
            return fast_cached.result;
        }

        let result=await redisTool.getSingleInstance().redis.hget(postkey,field);
        cacheTool.fast_cache(postkey+field+"_hget",result);

        return result;
    }

    public static async fast_hgetall(postkey){
        let fast_cached=cacheTool.fast_return(postkey+"_hgetall"); 
        if(fast_cached.localcached) {
            return fast_cached.result;
        }

        let result=await redisTool.getSingleInstance().redis.hgetall(postkey);
        cacheTool.fast_cache(postkey+"_hgetall",result);

        return result;
    }


    ///////////////// set /////////////////
    public static async fast_smembers(postkey){
        let fast_cached=cacheTool.fast_return(postkey+"_smembers"); 
        if(fast_cached.localcached) {
            return fast_cached.result;
        }

        let result=await redisTool.getSingleInstance().redis.smembers(postkey);
        cacheTool.fast_cache(postkey+"_smembers",result);
        
        return result;
    }

    public static async fast_scard(postkey){
        let fast_cached=cacheTool.fast_return(postkey+"_scard"); 
        if(fast_cached.localcached) {
            return fast_cached.result;
        }

        let result=await redisTool.getSingleInstance().redis.scard(postkey);
        cacheTool.fast_cache(postkey+"_scard",result);
        
        return result;
    }


    ///////////////// sorted set /////////////////
    public static async fast_zcard(postkey){
        let fast_cached=cacheTool.fast_return(postkey+"_zcard"); 
        if(fast_cached.localcached) {
            return fast_cached.result;
        }

        let result=await redisTool.getSingleInstance().redis.zcard(postkey);
        cacheTool.fast_cache(postkey+"_zcard",result);
        
        return result;
    }

    public static async fast_zcount(postkey,min,max){
        let fast_cached=cacheTool.fast_return(postkey+min+max+"_zcount"); 
        if(fast_cached.localcached) {
            return fast_cached.result;
        }

        let result=await redisTool.getSingleInstance().redis.zcount(postkey,min,max);
        cacheTool.fast_cache(postkey+min+max+"_zcount",result);
        
        return result;
    }

    public static async fast_zrang(postkey,start,stop){
        let fast_cached=cacheTool.fast_return(postkey+start+stop+"_zrang"); 
        if(fast_cached.localcached) {
            return fast_cached.result;
        }

        let result=await redisTool.getSingleInstance().redis.zrange(postkey,start,stop);
        cacheTool.fast_cache(postkey+start+stop+"_zrang",result);
        
        return result;
    }

}

export{
    cacheTool
}