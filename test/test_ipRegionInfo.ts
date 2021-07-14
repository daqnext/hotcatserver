/*
 * @Author: your name
 * @Date: 2021-07-12 12:12:18
 * @LastEditTime: 2021-07-12 13:48:26
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /hotcatserver/test/test_ipRegionInfo.ts
 */
import { assert } from "chai";
import {ipRegionInfo} from '../src/manager/project/ipRegionInfo'

describe('ipRegionInfo test', function() {

    it('ipCountry  init', async ()=> {
        // Test implementation goes here
       await ipRegionInfo.init()
          console.log("ipRegionInfo.init");
          
        assert.equal(1,1);
      });
      
    it('ipCountry  test', async ()=> {
      // Test implementation goes here
     const info =await ipRegionInfo.getIpInfo("127.0.0.1")
        console.log(info);
        
      assert.equal(1,1);
    });
  });