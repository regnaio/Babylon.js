# ====================================================================== base ======================================================================
FROM node:22.22.2-bookworm-slim AS root

ENV FORCE_COLOR=1

RUN echo 'root:root' | chpasswd

RUN apt-get update -y && apt-get upgrade -y
RUN apt-get install -y curl net-tools xvfb

# https://github.com/npm/cli/issues/9151
RUN npm i --location=global npm@~11.10.0
RUN npm i --location=global npm@latest
RUN npm i --location=global npm-check-updates

# Install Playwright system deps as root, browser as nonroot
RUN npx playwright install-deps chromium

# --------------------------------------------------------------------------------------------------------------------------------------------------

FROM root AS nonroot

RUN userdel -r node
RUN groupadd --gid 1000 nonroot && useradd --uid 1000 --gid nonroot --shell /bin/bash --create-home nonroot

USER nonroot

RUN npx playwright install chromium

WORKDIR /home/nonroot/app

# ====================================================================== dev =======================================================================

FROM nonroot AS nonroot-dev

EXPOSE 1337-1339 1341 8080
