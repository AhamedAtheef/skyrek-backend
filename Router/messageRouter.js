import express from "express";
import { Createmessage } from "../Controllers/messagecontroller.js";

const messagerouter = express.Router();

messagerouter.post("/", Createmessage);

export default messagerouter;