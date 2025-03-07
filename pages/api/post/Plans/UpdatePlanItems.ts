import { NextApiRequest, NextApiResponse } from "next";
import authorizationHandler from "pages/api/authorizationHandler";
import {connection} from "pages/api/mysql";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const authorized = await authorizationHandler(req, res, "POST");
  if (!authorized) {
    return false;
  }
  const { item_id, item_quantity, objective_item_detail } = req.body;
  try {
    const data = await UpdateCage(
      item_id,
      item_quantity,
      objective_item_detail
    );
    if (data.affectedRows != 0) {
      return res
        .status(200)
        .json({ code: 200, message: "Objective item updated successfully" });
    } else {
      return res
        .status(404)
        .json({ code: 404, message: "No Data found realated to :" });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ code: 500, message: "500 Server Error.Something went wrong." });
  }
}

async function UpdateCage(
  item_id: any,
  item_quantity: any,
  objective_item_detail: any
) {
  const conn = await connection.getConnection();
  try {
    const sql =
      "update tbl_objective_item_detail set item_id=?,item_quantity=? where is_exist='true' and objective_item_detail=?";
    const [sqlResult]: any = await conn.query(sql, [
      item_id,
      item_quantity,
      objective_item_detail,
    ]);
    return sqlResult;
  } catch (error) {
    console.log(error);
    return error;
  } finally {
    conn.release();
  }
}
