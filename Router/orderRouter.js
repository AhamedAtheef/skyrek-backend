import express from "express"
import { CreateOrder, getallOrders, getOrder, getOrders, updateOrder } from "../Controllers/ordersController.js"

const orderRouter = express.Router()

orderRouter.post("/", CreateOrder)
orderRouter.get("/data", getallOrders);
orderRouter.get("/:page/:limit",getOrders);
orderRouter.get("/myorders",getOrder);
orderRouter.put("/:orderID",updateOrder)


export default orderRouter;