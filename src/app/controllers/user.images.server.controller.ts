import {Request, Response} from "express";
import * as images from '../models/user.images.server.model';
import Logger from "../../config/logger"
import * as users from "../models/user.server.model";
const photoFolder = __dirname + "/../../../storage/images/";
import fs from "fs";
import * as auth from "../middleware/auth.middleware";

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
        Logger.info("reached");
        // Check image path != NULL
        if (!imagePathObject[0].imageFilename) {
            res.status(404).send("Not Found - user does not have an image");
            return;
        }
        const imagePathString  = photoFolder + imagePathObject[0].imageFilename;
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
    Logger.http("Uploading user image to the server")
    try {
        const token =  req.header('X-Authorization');
        const type = req.header('Content-Type');
        const currentUser = await auth.findUserIdByToken(token);
        const imageUser = await users.read(parseInt(req.params.id, 10));
        const imagePathObject = await images.getImage(parseInt(req.params.id, 10));
        // Check the user is logged in
        if(currentUser.length === 0) {
            res.status(401).send("Unauthorized");
            return;
        }
        // Check that the correct user is making the request
        if(imageUser[0].id !== currentUser[0].id) {
            res.status(403).send("Forbidden - Can only post images to your own profile");
            return;
        }
        if (type === "image/png" || type === "image/jpeg" || type === "image/gif") {
            // Check image was attached
            if (Buffer.isBuffer(req.body)) {
                let filename = "user_" + currentUser[0].id;
                if (type ==="image/png") {
                    filename += ".png";
                }
                if (type === "image/jpeg") {
                    filename += ".jpg";
                }
                if (type === "image/gif") {
                    filename += ".gif";
                }
                const filepath = photoFolder + filename;
                await images.setImage(filename, currentUser[0].id.toString());
                fs.writeFile(filepath, req.body, err => {
                    if (err) {
                        res.status(500).send("Internal Server Error");
                    } else {
                        if (imagePathObject[0].imageFilename === null || imagePathObject[0].imageFilename === "") {
                            res.status(201).send();
                            return;
                        } else {
                            res.status(200).send();
                            return;
                        }
                    }
                });
            } else {
                res.status(400).send("Bad Request - image is not attached");
                return
            }
        } else {
            res.status(400).send("Bad Request - Must be of type png, jpeg or gif");
            return;
        }
    } catch (err) {
        res.status(500).send("Internal Server Error");
    }
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
        // Check if filename exists
        const filename = images.getImage(parseInt(req.params.id, 10));
        if (filename === null) {
            res.status(400).send("Bad Request - There is currently not stored user image");
            return;
        }
       await images.removeImage(userId)
        res.status(200).send("OK - User image deleted");
    } catch (err) {
        res.status(500).send("Internal Server Error");
    }
}

export {getImage, postImage, removeImage}