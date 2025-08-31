FROM node:14

WORKDIR /app

COPY app app

RUN cd app && npm install

EXPOSE 4000

# Command to run the application
CMD ["node", "./index.js"]