FROM node:20.10

WORKDIR /app

COPY dist .

RUN npm install --production=true

RUN chmod +x docker-entry.sh
CMD ["bash", "docker-entry.sh"]

EXPOSE 5000
