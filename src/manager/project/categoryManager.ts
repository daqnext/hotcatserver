/*
 * @Author: your name
 * @Date: 2021-07-09 12:05:59
 * @LastEditTime: 2021-07-12 09:32:01
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
        if (this.categoryMap == null) {
            await this.regionRefreshCategory()
        }
        return { categoryMap: this.categoryMap, errMsg: "" };
    }

    static async centerGetAllCategory() {
        if (this.categoryMap == null) {
            await this.centerRefreshCategory();
        }
        return { categoryMap: this.categoryMap, errMsg: "" };
    }

    static async centerRefreshCategory() {
        try {
            const category = await categoryModel.findAll();
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
        let url=config.center_host + "/api/region/getcategory"
        let data = await requestTool.get(url);
        if (data.status == 0) {
            this.categoryMap = data.data;
        }
    }
}

export { categoryManager };
