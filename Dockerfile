FROM node:18

WORKDIR /app

COPY . .

RUN sudo apt update && sudo apt install ffmpeg
RUN npm install && npm run build 

EXPOSE 4000

# Command to run the application
CMD ["npm", "run", "start"]