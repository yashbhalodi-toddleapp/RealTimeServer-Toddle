FROM node:16.15.1

WORKDIR /usr/src/toddlerealtime

COPY ./ ./

RUN npm install

CMD ["/bin/bash"]