import configs from '../configs/';
import * as mime from 'mime';
import * as _ from 'lodash';
import * as moment from 'moment';
import { thrower } from './thrower';
const fs = require('fs');
const path = require('path');
const cosCfg = configs.cos;
const COS = require('cos-nodejs-sdk-v5');

const cos = new COS({
  SecretId: cosCfg.sid,
  SecretKey: cosCfg.skey
});

class txCos {
  static async getBuckets() {
    return new Promise(function (resolve, reject) {
      cos.getService(null, (err, data) => {
        if (err) {
          console.log(err);
          resolve(null);
        } else {
          resolve(data);
        }
      });
    });
  }
  /**
   * 上传单个文件
   * @param originalPath 本地文件路径 如,C:/Users/max/Desktop/logo.png
   * @param cloudPath 云端目录 vehicle-logo/
   * @param filename 文件名 abc.png
   */
  static async uploadFile(files, cloudPath) {
    if (_.isNil(files) || files.length === 0) {
      thrower('common', 'imageRequired')
    }
    const file = files[0];
    const time = moment().format('YYYY-MM-DD-HHmmss');
    const ext = mime.getExtension(file.mimetype);
    const filepath = path.join(cloudPath, `${time}-${file.filename}.${ext}`).replace(/\\/g, '/');
    const res = await new Promise(function (resolve, reject) {
      cos.putObject({
        Bucket: `${cosCfg.bucket}-${cosCfg.appid}`,
        Region: cosCfg.region,
        Key: filepath,
        ContentLength: file.size,
        Body: fs.createReadStream(file.path)
      }, (err, data) => {
        if (err) {
          console.log(err);
          resolve(null);
        } else {
          resolve(data);
        }
      });
    });
    if (res === null) {
      thrower('common', 'uploadFail');
    }
    return res;
  }
  /**
   * 删除文件
   * @param filepath 文件路径, vehicle-logo/abc.png
   */
  static async deleteFile(filepath) {
    return new Promise(function (resolve, reject) {
      cos.deleteObject({
        Bucket: `${cosCfg.bucket}-${cosCfg.appid}`,
        Region: cosCfg.region,
        Key: filepath,
      }, (err, data) => {
        if (err) {
          console.log(err);
          resolve(null);
        } else {
          resolve(data);
        }
      });
    });
  }
}

export { txCos }