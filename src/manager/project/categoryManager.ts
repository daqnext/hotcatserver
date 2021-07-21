/*
 * @Author: your name
 * @Date: 2021-07-09 12:05:59
 * @LastEditTime: 2021-07-20 11:19:24
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /hotcatserver/src/manager/project/categoryManager.ts
 */

import { config } from "../../config/conf";
import { categoryModel } from "../../model/categoryModel";
import { requestTool } from "../../utils/request";

class categoryManager {
    static categoryMap: { [key: string]: string[] } = null;
    static async regionGetAllCategory() {
        if (this.categoryMap === null) {
            await this.regionRefreshCategory()
        }
        return { categoryMap: this.categoryMap, errMsg: "" };
    }

    static async centerGetAllCategory() {
        if (this.categoryMap === null) {
            await this.centerRefreshCategory();
        }
        return { categoryMap: this.categoryMap, errMsg: "" };
    }

    static async centerRefreshCategory() {
        try {
            console.log("get category");
            
            const category = await categoryModel.findAll();
            console.log(category);
            
            let tempCategoryMap: { [key: string]: string[] } = {};
            for (let i = 0; i < category.length; i++) {
                let cate = category[i].category;
                if (tempCategoryMap[cate]) {
                    tempCategoryMap[cate].push(category[i].subCategory);
                } else {
                    tempCategoryMap[cate] = [];
                }
            }
            this.categoryMap = tempCategoryMap;
        } catch (error) {
            console.error("query category error", error);
        }
    }

    static async regionRefreshCategory() {
        console.log("get category");
        let url=config.center_host + "/api/region/getcategory"
        let data = await requestTool.get(url);
        console.log(data);
        
        if (data.status == 0) {
            this.categoryMap = data.data;
        }
    }
}

export { categoryManager };
