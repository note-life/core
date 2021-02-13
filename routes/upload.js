const fs = require('fs');
const Router = require('koa-router');
const sharp = require('sharp');
const sizeOf = require('image-size');
const ALiOSS = require('ali-oss');
const MD5 = require('../utils/md5');
const configurationModel = require('../model/configuration');
const QiniuUploader = require('../utils/qiniu-uploader');
const CONFIG = require('../config');

const router = new Router();

/**
 * 路径检测 不存在则创建一个
 * @param {String} dirpath 
 */
const dirPathCheck = (dirpath) => {
    let targetPath = CONFIG.public_path;

    dirpath.split('/').forEach(v => {
        targetPath += `/${v}`;

        if (!fs.existsSync(targetPath)) {
            fs.mkdirSync(targetPath);
        }
    });

    return targetPath;
};

const filterDirName = (type) => {
    if (/^image/.test(type)) return 'images';

    if (/^video/.test(type)) return 'videos';

    if (/^audio/.test(type)) return 'audios';

    if (/^font/.test(type)) return 'fonts';

    return 'files';
};


/**
 * 上传到阿里云对象储存
 * @param {Stream} inputFileStream 
 * @param {String} ossFilePath 
 */
const saveToAliOSS = async (data, config) => {
    const ossClient = new ALiOSS({
        region: config.region,
        accessKeyId: config.accessKeyId,
        accessKeySecret: config.accessKeySecret,
        bucket: config.bucket
    });

    const p = [];

    data.forEach(([inputFileStream, ossFilePath]) => {
        const result = ossClient.putStream(ossFilePath, inputFileStream, {
            headers: {
                'Cache-Control': 2592000
            }
        });

        p.push(result);
    });

    return Promise.all(p);
};

/**
 * 上传到七牛云
 */
const saveToQiniu = async (data, config) => {
    const qiniuUploader = new QiniuUploader(config);
    const p = [];

    data.forEach(([inputFileStream, ossFilePath]) => {
        const result = qiniuUploader.readAndUpload(inputFileStream, ossFilePath);

        p.push(result);
    });

    return Promise.all(p);
};

const handleFile = async ({ type, path, name }, ossConfig, dateDirName) => {
    const relativePath = `${filterDirName(type)}/${dateDirName}`;
    const baseOutputPath = dirPathCheck(relativePath);
    const fileExt = name.split('.').pop();
    const isWebAvariableImage = /image\/(gif|jpg|jpeg|apng|png|webp|avif|svg)/.test(type);
    const imgSize = {};

    let fileName;
    let originFileName;

    // 名称二次处理
    if (isWebAvariableImage) {
        const { width, height } = sizeOf(path);
        const typeEnum = {
            gif: 'z1',
            jpg: 'z2',
            jpeg: 'z3',
            apng: 'z4',
            png: 'z5',
            webp: 'z6',
            avif: 'z7',
            svg: 'z8'
        };

        const randomstr = MD5.random(8);

        fileName = `${randomstr}${typeEnum[fileExt]}_w${width}h${height}`;
        originFileName = `${randomstr}_w${width}h${height}`;
        imgSize.width = width;
        imgSize.height = height;
    } else {
        originFileName = fileName = `${name.slice(0, -fileExt.length - 1).replace(/(\s|\/)/g, '_')}_${Date.now()}`
    }

    const originOutputPath = `${baseOutputPath}/${originFileName}.${fileExt}`;

    const ossActionEnum = {
        'ali-oss': saveToAliOSS,
        'qiniu-oss': saveToQiniu
    };
    const ossAction = ossConfig ? ossActionEnum[ossConfig.type] : null;

    // 存入对象储存
    if (ossConfig && ossAction) {
        if (isWebAvariableImage) {
            const resizeOptions = { width: Math.min(imgSize.width, 1024), withoutEnlargement: true };
            const data = [
                [fs.createReadStream(path), `images/${dateDirName}/${originFileName}.${fileExt}`],
                [sharp(path).resize(20).png(), `thumbnails/${dateDirName}/${fileName}.png`],
                [sharp(path).resize(20).webp(), `thumbnails/${dateDirName}/${fileName}.webp`],
                [sharp(path).resize(resizeOptions).png({ adaptiveFiltering: true, pallete: true, quality: 8, dither: 1 }), `images/${dateDirName}/${fileName}.png`],
                [sharp(path).resize(resizeOptions).webp(), `images/${dateDirName}/${fileName}.webp`]
            ];

            await ossAction(data, ossConfig);
        } else {
            const data = [
                [fs.createReadStream(path), `${relativePath}/${fileName}.${fileExt}`]
            ];

            await ossAction(data, ossConfig);
        }
    } else {
        const readStream = fs.createReadStream(path);
        const writeStream = fs.createWriteStream(originOutputPath);

        if (isWebAvariableImage) {
            const thumbnailDirPath = dirPathCheck(`/thumbnails/${dateDirName}`);
            const resizeOptions = { width: Math.min(imgSize.width, 1024), withoutEnlargement: true };

            sharp(path).resize(20).toFormat('png').toFile(`${thumbnailDirPath}/${fileName}.png`);
            sharp(path).resize(resizeOptions).png({ adaptiveFiltering: true, pallete: true, quality: 8, dither: 1 }).toFile(`${baseOutputPath}/${fileName}.png`);
            sharp(path).resize(resizeOptions).webp().toFile(`${baseOutputPath}/${fileName}.webp`);
        }

        readStream.pipe(writeStream);
    }

    return `${relativePath}/${fileName}.${isWebAvariableImage ? 'png' : fileExt}`;
};

router.post('/', async (ctx) => {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, 0);
    const { files = {} } = ctx.request;
    const filesArr = Object.values(files);
    const OSSConfiguration = await configurationModel.findOne({ key: 'OSS' });
    const activeOss = (OSSConfiguration.enabled && OSSConfiguration.options) ? OSSConfiguration.options.list.find(v => v.type === OSSConfiguration.options.active) : null;
    const dateDirName = `${year}${month}`;
    const p = [];

    // 批量上传
    for (let i = 0; i < filesArr.length; i++) {
        p.push(handleFile(filesArr[i], activeOss, dateDirName));
    }

    const publicPaths = await Promise.all(p);

    ctx.body = {
        host: (activeOss && activeOss.domain) ? activeOss.domain : CONFIG.bind_domain,
        paths: publicPaths
    };
});

module.exports = router;
