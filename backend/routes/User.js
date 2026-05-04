import express from "express"
import * as userController from "../controllers/user.js"
import { isAuth } from "../middleware/is-Auth.js"
const router = express.Router()

router.get("/profile",isAuth,userController.getUser)
router.post("/change-password", isAuth, userController.postChangePassword)

export default router;