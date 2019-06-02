import qiniu from 'qiniu';

function Uploader ({ accessKey, secretKey, scope }) {
    this.accessKey = accessKey;
    this.secretKey = secretKey;
    this.scope = scope;
}

Uploader.prototype.readAndUpload = function (readStream, output) {
    const mac = new qiniu.auth.digest.Mac(this.accessKey, this.secretKey);
    const putPolicy = new qiniu.rs.PutPolicy({ scope: this.scope  });

    const uploadToken = putPolicy.uploadToken(mac);

    const qiniuConfig = new qiniu.conf.Config();

    // qiniuConfig.zone = qiniu.zone.Zone_z0;

    const formUploader = new qiniu.form_up.FormUploader(qiniuConfig);
    const putExtra = new qiniu.form_up.PutExtra();

    return new Promise((resolve, reject) => {
        formUploader.putStream(uploadToken, output, readStream, putExtra, (respErr, respBody, respInfo) => {
            if (respErr) {
                reject(respErr);
            }

            if (respInfo && respInfo.statusCode == 200) {
                resolve(respBody);
            } else {
                reject(respBody);
            }
        });
    });
};

export default Uploader;
