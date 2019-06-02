const ips = new Map();

const blackList = async function (ctx, next) {
    const ip = ctx.request.ip;
    const ipRecord = ips.get(ip);

    if (ipRecord && /notes/.test(ctx.url)) {
        const intervalTime = (Date.now() - ipRecord.time) < 1000 * 60;

        // 前后俩次请求在一分钟内 请求次数不能超过 20 次
        if (intervalTime) {
            if (ipRecord.count > 30) {
                ips.set(ip, {
                    ...ipRecord,
                    count: ipRecord.count + 1,
                    time: Date.now()
                });
                ctx.throw(403, '请求过于频繁');
            } else {
                ips.set(ip, {
                    ...ipRecord,
                    count: ipRecord.count + 1
                });
            }
        } else {
            ips.set(ip, {
                count: 1,
                time: Date.now()
            });
        }
    } else {
        ips.set(ip, {
            count: 1,
            time: Date.now()
        });
    }

    await next();
}

export default blackList;