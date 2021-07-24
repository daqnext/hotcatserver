/*
 * @Author: your name
 * @Date: 2021-07-07 10:47:59
 * @LastEditTime: 2021-07-22 10:05:27
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /hotcatserver/test/test_sqldatabase.ts
 */
import { assert } from "chai";
import { QueryTypes } from "sequelize/types";
import { SqlTool } from "../src/db/SqlTool";
import { logger } from "../src/global";

describe("database tests", function () {
    it("connect db result", async () => {
        let result: Boolean = await SqlTool.getSingleInstance().auth();
        assert.equal(result, true);
    });

    it("batch update", async () => {
        const batch = [
            { id: 1, watched: 2 },
            { id: 2, watched: 4 },
            { id: 3, watched: 6 },
        ];
        let sqlStr = "UPDATE livestreams SET watched = watched + CASE id ";
        const ids: number[] = []; //ids := []uint{}
        for (let j = 0; j < batch.length; j++) {
            ids.push(batch[j].id);
            let tempStr = `WHEN ${batch[j].id} THEN ${batch[j].watched} `;
            sqlStr += tempStr;
        }
        sqlStr += "END WHERE id IN(:ids)";
        await SqlTool.getSingleInstance().sequelize.query(sqlStr, {
            replacements: { ids: ids },
            //type: QueryTypes.UPDATE,
        });

        assert.equal(true, true);
    });
});
