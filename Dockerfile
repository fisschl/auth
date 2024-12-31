FROM registry.cn-shanghai.aliyuncs.com/fisschl/node:22
WORKDIR /root
RUN npm config set registry https://registry.npmmirror.com && npm install -g pnpm
COPY pnpm-lock.yaml .
COPY package.json .
RUN pnpm install --prod
COPY . .
CMD pnpm start
