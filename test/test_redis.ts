import { assert } from "chai";
import {redisTool} from "../src/redis/redisTool"

describe('redis test', function() {

    it('key-value', async function() {
      // Test implementation goes here
     let result= await redisTool.getSingleInstance().redis.set("testkey","value",'ex',10);
     assert.equal(result,"OK"); 
    });


    it('increase', async function() {
      // Test implementation goes here
     let result_set=redisTool.getSingleInstance().redis.set("test-increase",0,'ex',30);
     let result_inr= await redisTool.getSingleInstance().redis.incr("test-increase");
     assert.notEqual(result_inr,null);
    });


    it('hashset', async function() {
      // Test implementation goes here
     let result=await redisTool.getSingleInstance().redis.hset('testhashset',1,"dasd","xx","fasdf");
     assert.notEqual(result,null);
     redisTool.getSingleInstance().redis.expire('testhashset',50);
    });

    

 
  });
