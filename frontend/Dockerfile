FROM node:16

ADD https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh /wait-for-it.sh

ADD ./wait_for_backend.sh /wait_for_backend.sh

RUN chmod +x /wait_for_backend.sh /wait-for-it.sh
