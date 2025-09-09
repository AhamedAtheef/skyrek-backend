import express from "express"
import { CreateOrder, getallOrders, getOrders, updateOrder } from "../Controllers/ordersController.js"

const orderRouter = express.Router()

orderRouter.post("/", CreateOrder)
orderRouter.get("/data", getallOrders);
orderRouter.get("/:page/:limit",getOrders);
orderRouter.put("/:orderID",updateOrder)


export default orderRouter;