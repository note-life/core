const configurationModel = require('../model/configuration');
const { mailTo } = require('../utils');

/**
 * 验证码
 * @param ctx
 * @param next
 */
async function sendCode (ctx, next) {
    const { email } = ctx.query;
    const verificationCode = Math.random().toString(36).slice(2);
    const mailConfig = await configurationModel.findOne({ key: 'EMAIL' });

    if (mailConfig && mailConfig.enabled) {
        const mailOption = mailConfig.options;
        const msgOptions = {
            from: `Note.Life 👻 <${mailOption.authUser}>`,
            to: email,
            subject: 'recover password',
            text: '密码找回',
            html: `<p>验证码: ${verificationCode}</p><p>5分钟后失效</p>`
        };

        mailTo(mailOption, msgOptions);
    }

    ctx.verificationCodes.push({ [email]: verificationCode });
    setTimeout(() => {
        let index;

        ctx.verificationCodes.find((v, i) => {
            if (Object.keys(v)[0] !== email) {
                index = i;
                return true;
            }

            return false;
        });
        ctx.verificationCodes.splice(index, 1);
        console.log('clear....', ctx.verificationCodes);
    }, 1000 * 60 * 5);
    ctx.body = { success: true };
}

module.exports = {
    sendCode
};
