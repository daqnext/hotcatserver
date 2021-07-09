/*
 * @Author: your name
 * @Date: 2021-07-08 11:39:51
 * @LastEditTime: 2021-07-08 14:48:49
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /hotcatserver/test/test_userManager.ts
 */
import { assert } from "chai";
import {userManager} from '../src/manager/project/userManager'

describe('userManager test', function() {

    it('userManager  test', async ()=> {
      // Test implementation goes here
    const {user,errMsg} = await userManager.getUserByCookie("VdRdc/TDoUSGqRuE")
    console.log(user);
    console.log(errMsg);
    
      
      assert.equal(1,1);
    });
  });
