FROM node:14

WORKDIR /app

COPY ./package.json /app/package.json

RUN npm i  --registry=https://registry.npm.taobao.org

COPY . /app

EXPOSE 4533

CMD [ "npm", "run", "start-no-daemon" ]