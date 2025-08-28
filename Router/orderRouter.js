import express from "express"
import { CreateOrder, getOrders, updateOrder } from "../Controllers/ordersController.js"

const orderRouter = express.Router()

orderRouter.post("/", CreateOrder)
orderRouter.get("/:page/:limit",getOrders);
orderRouter.put("/:orderID",updateOrder)


export default orderRouter;