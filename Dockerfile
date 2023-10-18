FROM node:18.18.2-bullseye-slim AS dev-stage

RUN echo 'root:root' | chpasswd

RUN apt-get update -y && apt-get upgrade -y
RUN apt-get install -y curl net-tools tree

RUN npm i --location=global npm@latest
RUN npm i --location=global npm-check-updates

RUN userdel -r node
RUN groupadd --gid 1000 nonroot && useradd --uid 1000 --gid nonroot --shell /bin/bash --create-home nonroot

USER nonroot
WORKDIR /home/nonroot/app

EXPOSE 1337-1339 1341
