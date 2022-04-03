import {Request, Response} from "express";
import * as images from '../models/user.images.server.model';
import Logger from "../../config/logger"
import * as users from "../models/user.server.model";
const photoDir = __dirname + "/../../../storage/images/";
import fs from "fs";

const getImage = async(req: Request, res: Response): Promise<any> => {
    Logger.http("Getting user image from the server")
    try {
        // Check user exists
        const user = await users.read(parseInt(req.params.id, 10));
        if (user.length === 0) {
            res.status(404).send("Not Found - User does not exist");
            return;
        }
        const imagePathObject = await images.getImage(parseInt(req.params.id, 10));
        // Check image path != NULL
        if (!imagePathObject[0].imageFilename) {
            res.status(404).send("Not Found - user does not have an image");
            return;
        }
        const imagePathString  = photoDir + imagePathObject[0].imageFilename;
        fs.readFile(imagePathString, (err, data) => {
            if (err) {
                res.status(500).send("Internal Server Error");
            } else {
                let type = ""
                if(imagePathObject[0].imageFilename.split(".")[1] === "jpg" || imagePathObject[0].imageFilename.split(".")[1] === "JPG") {
                    type = "jpeg"
                }
                if(imagePathObject[0].imageFilename.split(".")[1] === "png" || imagePathObject[0].imageFilename.split(".")[1] === "PNG") {
                    type = "png"
                }
                if (imagePathObject[0].imageFilename.split(".")[1] === "gif" || imagePathObject[0].imageFilename.split(".")[1] === "GIF") {
                    type = "gif"
                }
                res.setHeader("Content-Type", "image/" + type);
                res.status(200).send(data);
            }
        });
    } catch (err) {
        res.status(500).send("Internal Server Error");
    }
}

const postImage = async(req: Request, res: Response): Promise<any> => {
    return null;
}

const removeImage = async(req: Request, res: Response): Promise<any> => {
    Logger.http("Deleting user image from the server");
    try {
        const userId = parseInt(req.params.id, 10);
        // Check user exists
        const user = await users.read(userId);
        if (user.length === 0) {
            res.status(404).send("Not Found - User does not exist");
            return;
        }
        // Check if the correct user
        if (req.body.authenticatedUser.id.toString() !== userId.toString()) {
            res.status(403).send("Forbidden - You can not delete another users image");
            return;
        }
       await images.removeImage(userId)
        res.status(200).send("OK - User image deleted");
    } catch (err) {
        res.status(500).send("Internal Server Error");
    }
}

export {getImage, postImage, removeImage}