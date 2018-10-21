import fetch from 'node-fetch';
import { accessTokenURL, /*ID_TO_GROUP,*/ scanningURL, secret, userIDURL, userInfoURL } from '../../lib/consts';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { database } from '../../app';

export const handleScan = (req: Request, res: Response) => {
    (async () => {
        try {
            const scanResponse = await fetch(`${scanningURL}${req.params.key}`);
            const scanResult = await scanResponse.text();
            const status = JSON.parse(scanResult.match(/{.+}/)![0]).status;
            if (status === 'QRCODE_SCAN_ING') {
                const loginResponse = await fetch(`${scanningURL}${req.params.key}&lastStatus=${status}`);
                const loginResult = await loginResponse.text();
                const loginObj = JSON.parse(loginResult.match(/{.+}/)![0]);
                if (loginObj.status === 'QRCODE_SCAN_SUCC') {
                    const auth_code = loginObj.auth_code;
                    const accessTokenResponse = await fetch(accessTokenURL);
                    const accessTokenResult = await accessTokenResponse.json();
                    const accessToken = accessTokenResult.access_token;
                    const userIDResponse = await fetch(userIDURL(accessToken, auth_code));
                    const userIDResult = await userIDResponse.json();
                    const userID = userIDResult.UserId;
                    const userInfoResponse = await fetch(userInfoURL(accessToken, userID));
                    const userInfoResult = await userInfoResponse.json();
                    const { userid, /*name, mobile, avatar, isleader*/ } = userInfoResult;
                    let { department } = userInfoResult;
                    department = department.filter((i: number) => (i > 1 && i < 9) || (i > 14 && i < 26));
                    if (!department.length) {
                        res.send({ message: '请联系管理员登记组别', type: 'info' });
                        return;
                    }
                    const user = await database.query('users', {
                        weChatID: userid
                    });
                    let uid;
                    if (!user.length) {
                        res.send({ message: '登录失败', type: 'info' });
                        return;
                        // uid = await database.insert('users', {
                        //     username: name,
                        //     phone: mobile,
                        //     weChatID: userid,
                        //     avatar,
                        //     isCaptain: Boolean(isleader),
                        //     isAdmin: false,
                        //     group: ID_TO_GROUP[department[0]]
                        // });
                    } else {
                        uid = user[0]['_id'];
                    }
                    const token = jwt.sign({ uid }, secret, {
                        expiresIn: 86400
                    });
                    res.send({ uid, token, type: 'success' });
                } else {
                    res.send({ message: '登录失败', type: 'info' });
                    return;
                }
            } else {
                res.send({ message: '登录超时，请重新登录', type: 'info' });
                return;
            }
        } catch (err) {
            res.send({ message: err.message, type: 'danger' });
        }
    })()
};