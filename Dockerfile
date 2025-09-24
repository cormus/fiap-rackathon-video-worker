FROM node:18

WORKDIR /app

COPY . .

RUN apt update && apt install -y ffmpeg
RUN npm install && npm run build 

EXPOSE 4000

# Command to run the application
CMD ["npm", "run", "start"]