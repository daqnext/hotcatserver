import { assert } from "chai";
import {redisTool} from "../src/redis/redisTool"
import {cacheTool} from "../src/cache/cacheTool"
import {Time} from "../src/global"
const redis= redisTool.getSingleInstance().redis;

describe('cache test', function() {

    it('key-value cache fastget', async function() {
      // Test implementation goes here
     await redis.set(cacheTool.postkey("testkey"),"value",'ex',30);
     let result_remote=await cacheTool.fast_get(cacheTool.postkey("testkey"));
     let result_local=await cacheTool.fast_get(cacheTool.postkey("testkey"));
     assert.equal(result_remote,result_local); 
     let result_local2=await cacheTool.fast_get(cacheTool.postkey("testkey"));
     assert.equal(result_remote,result_local2); 
     await Time.sleep(5000);//sleep 5 second
     let result_local3=await cacheTool.fast_get(cacheTool.postkey("testkey"));
     assert.equal(result_remote,result_local3);   

    });

     
    it('fast_mget test', async function() {
      // Test implementation goes here
     await redis.set(cacheTool.postkey("testkey1"),"value1",'ex',30);
     await redis.set(cacheTool.postkey("testkey2"),"value2",'ex',30);
     await redis.set(cacheTool.postkey("testkey3"),"value3",'ex',30);
     await redis.set(cacheTool.postkey("testkey4"),"value4",'ex',30);

     let result1 = await cacheTool.fast_mget(cacheTool.postkey("testkeyx"),"testkey2","testkey3","testkey4");
     let result2 = await cacheTool.fast_mget(cacheTool.postkey("testkeyx"),"testkey2","testkey3","testkey4");
     assert.equal(result1,result2);

    });

    

    it('fast_hget&fast_hgetall test', async function() {
      // Test implementation goes here
       
     let notexist = await cacheTool.fast_hget(cacheTool.postkey("noexistkey"),"noexitfield");
     assert.equal(notexist,null);
     await redis.hset(cacheTool.postkey("testhash_xyz"),"k1","v1","k2","v2").then( async ()=>{
         await redis.expire(cacheTool.postkey("testhash_xyz"),50);
     });

     let result =await cacheTool.fast_hget(cacheTool.postkey("testhash_xyz"),"k2");
     let result2=await cacheTool.fast_hget(cacheTool.postkey("testhash_xyz"),"k2");
     assert.equal(result,result2);


     let all1 =await cacheTool.fast_hgetall(cacheTool.postkey("testhash_xyz"));
     let all2 =await cacheTool.fast_hgetall(cacheTool.postkey("testhash_xyz"));
     assert.equal(all1,all2);

    });


    it('set related test', async function() {
      // Test implementation goes here
       
     let notexist:Array<any> = await cacheTool.fast_smembers(cacheTool.postkey("noexistkey_set"));
     assert.equal(notexist.length,0);

     await redis.sadd(cacheTool.postkey("testset"),1,2,3,4,"end").then( async ()=>{
          await redis.expire(cacheTool.postkey("testset"),50);
     });;

     let result:Array<any>= await cacheTool.fast_smembers(cacheTool.postkey("testset")); 
     let num:number= await cacheTool.fast_scard(cacheTool.postkey("testset")); 
     assert.equal(result.length,num);
    });


    it('sortedset test', async function() {
      // Test implementation goes here
       
      let notexist:Array<any> = await cacheTool.fast_zrang(cacheTool.postkey("noexistkey_set"),0,-1);
      assert.equal(notexist.length,0);

      await redis.zadd(cacheTool.postkey("testsortedset"),10,"t10",0,"t0",5,"t5").then( async ()=>{
        await redis.expire(cacheTool.postkey("testsortedset"),50);
      });;;

      let count= await cacheTool.fast_zcard(cacheTool.postkey("testsortedset"));
      let result=await cacheTool.fast_zrang(cacheTool.postkey("testsortedset"),0,-1);
      assert.equal(result.length,count);

      let rangecount=await cacheTool.fast_zcount(cacheTool.postkey("testsortedset"),0,5);
      assert.equal(rangecount,2);

     
    });


     


     



});
