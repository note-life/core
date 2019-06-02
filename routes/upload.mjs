import fs from 'fs';
import Router from 'koa-router';
import sharp from 'sharp';
import MD5 from '../utils/md5';
import configurationModel from '../model/configuration';
import QiniuUploader from '../utils/qiniu-uploader';
import CONFIG from '../config';

const router = new Router();

const filterDirName = (type) => {
    if (/^image/.test(type)) return 'images';

    if (/^video/.test(type)) return 'videos';

    if (/^audio/.test(type)) return 'audios';

    if (/^font/.test(type)) return 'fonts';

    return 'files';
};

/**
 * 本地储存
 * @param input
 * @param output
 */
const compressAndConvertImages = async (input, output) => {
    const resizeOptions = { width: 1024, withoutEnlargement: true };

    const p1 = sharp(input).resize(resizeOptions).webp({ quality: 75 }).toFile(output + '.webp');
    const p2 = sharp(input).resize(resizeOptions).jpeg({ quality: 75, progressive: true }).toFile(output + '.jpeg');

    return Promise.all([p1, p2]);
};

/**
 * 上传到七牛云
 * @param input
 * @param output
 * @param fileType
 * @param options
 */
const saveToQiniu = async (input, output, fileType, options) => {
    const qiniuUploader = new QiniuUploader(options);

    if (/image/.test(fileType)) {
        const resizeOptions = { width: 1024, withoutEnlargement: true };

        const p1 = qiniuUploader.readAndUpload(sharp(input).resize(resizeOptions).webp({ quality: 75 }), `${output}.webp`);
        const p2 = qiniuUploader.readAndUpload(sharp(input).resize(resizeOptions).jpeg({ quality: 75, progressive: true }), `${output}.jpeg`);

        return Promise.all([p1, p2]);
    } else {
        qiniuUploader.readAndUpload(fs.createReadStream(input, output + '.' + fileType.split('/')[1]));
    }
};

router.post('/', async (ctx) => {
    const { files = {} } = ctx.request;
    const publicPaths = [];
    const filesArr = Object.values(files);
    const qiniuOSSConfiguration = await configurationModel.findOne({ key: 'QINIU_OSS' }) || {};
    const OSS_DOMAIN = qiniuOSSConfiguration.enabled && qiniuOSSConfiguration.options && qiniuOSSConfiguration.options.domain;
    const validQiniu = qiniuOSSConfiguration.enabled && qiniuOSSConfiguration.options && qiniuOSSConfiguration.options.accessKey && qiniuOSSConfiguration.options.secretKey && qiniuOSSConfiguration.options.scope;

    // 批量上传
    for (let i = 0; i < filesArr.length; i++) {
        const fileSize = filesArr[i].size;
        const fileType = filesArr[i].type;
        const filePath = filesArr[i].path;

        const dirName = filterDirName(fileType);
        const baseFilePath = `${dirName}/${MD5.random(12)}`;
        const output = `${CONFIG.public_path}/${baseFilePath}`;

        if (validQiniu) {
            await saveToQiniu(filePath, baseFilePath, fileType, qiniuOSSConfiguration.options);
        } else {
            // gif 或 非图片直接保存 否则压缩处理
            // webp 也是支持动态的 这个吗慢慢研究 偷个懒先
            if (!/image/.test(fileType) || /(gif|ico)/.test(fileType)) {
                const readStream = fs.createReadStream(filePath);
                const writeStream = fs.createWriteStream(output + '.' + fileType.split('/')[1]);

                readStream.pipe(writeStream);
            } else {
                await compressAndConvertImages(filePath, output);
            }
        }

        publicPaths.push(baseFilePath);
    }

    ctx.body = {
        host: OSS_DOMAIN ? OSS_DOMAIN : CONFIG.bind_domain,
        paths: publicPaths
    };
});

export default router;