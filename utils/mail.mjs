import nodemailer from 'nodemailer';

function mailTo (mailOptions, msgOptions) {
    return new Promise ((resolve, reject) => {
        const transporter = nodemailer.createTransport({
            auth: {
                user: mailOptions.authUser,
                pass: mailOptions.authPass
            },
            host: mailOptions.host,
            port: mailOptions.port
        });

        transporter.sendMail(msgOptions, (error, info) => {
            if (error) {
                console.log('发送失败', error);
                reject(error);
            } else {
                resolve();
            }
        });
    });
}

export default mailTo;