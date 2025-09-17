import express from 'express';
import multer from 'multer';
import ffmpeg from 'fluent-ffmpeg';
import archiver from 'archiver';
import fs from 'fs';
import path from 'path';
import { SQSMessageQueue } from './src/infra/SQSMessageQueue';
import { FFMPEGVideoProcessor } from './src/infra/FFMPEGVideoProcessor';
import { STREAMCompressorFile } from './src/infra/STREAMCompressorFile';
import { ProccessVideoImage } from './src/application/usercases/ProccessVideoImage';
import SQSClient from "./src/infra/sqsClient";
import { S3FileStorage } from './src/infra/S3FileStorage';
import cuid from "cuid";
import { Status } from './src/domain/enumeration/Status';
import { FolderUtil } from './src/infra/util/FolderUtil';
import { QueueMessageMovieBody } from './src/domain/entities/QueueMessageMovieBody';
import dotenv from "dotenv";

dotenv.config();

const app = express();
const upload = multer({ dest: 'temp/' });
app.use(express.json());

app.post('/upload', upload.single('video'), async (req, res) => {
  const videoPath = (req && req.file)? req.file.path: "";
  const outputDir = `frames_${Date.now()}`;
  fs.mkdirSync(outputDir);

  // Extrai 3 frames do vídeo
  await new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .on('end', resolve)
      .on('error', reject)
      .screenshots({
        count: 3,
        folder: outputDir,
        filename: 'frame-%i.png'
      });
  });

  // Cria o ZIP
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', 'attachment; filename=frames.zip');
  const archive = archiver('zip');
  archive.pipe(res);

  fs.readdirSync(outputDir).forEach(file => {
    archive.file(path.join(outputDir, file), { name: file });
  });

  archive.finalize();

  // Limpeza dos arquivos temporários após o envio
  archive.on('end', () => {
    fs.rmSync(videoPath);
    fs.rmSync(outputDir, { recursive: true, force: true });
  });
});

// app.post('/upload2', upload.single('video'), async (req, res) => {
//   const videoPath = (req && req.file)? req.file.path: "";

//   const tempDir = 'temp';
  
//   if (!fs.existsSync(tempDir)){
//       fs.mkdirSync(tempDir);
//   }
//   const outputDir = `${tempDir}/frames_${Date.now()}`;
//   fs.mkdirSync(outputDir);

//   const folderUtil = new FolderUtil();
//   const sqsVideoQueue = new SQSMessageQueue(SQSClient, QUEUE_VIDEO);
//   const sqsImagemQueue = new SQSMessageQueue(SQSClient, QUEUE_IMAGE);
//   const s3FileStorage = new S3FileStorage("bucket-video-processing-fiap", "us-east-2");
//   const ffmpegVideoProcessor = new FFMPEGVideoProcessor();
//   const streamCompressorFile = new STREAMCompressorFile();

//   const proccessVideoImage = new ProccessVideoImage(folderUtil, s3FileStorage, sqsVideoQueue, sqsImagemQueue, ffmpegVideoProcessor, streamCompressorFile);
//   const zipBuffer = await proccessVideoImage.execute(videoPath, outputDir);

//   const outputPath = `${tempDir}/arquivo.zip`;
//   fs.writeFileSync(outputPath, zipBuffer);

//   res.json(true);
// });

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

const BUKET_NAME = process.env.BUKET_NAME || "";
const REGION = process.env.AWS_REGION || "";
const QUEUE_VIDEO = process.env.QUEUE_VIDEO || ""; // Substitua pelo URL da sua fila
const QUEUE_IMAGE = process.env.QUEUE_IMAGE || ""; // Substitua pelo URL da sua fila

//================= Video Fila =================

// Create (Enviar mensagem para a fila)
app.post("/queue", async (req, res) => {
  const { messageBody } = req.body;

  try {
    
    const messageVideoBody = {
      id: "",
      videoPath: messageBody.videoPath,
      status: messageBody.status
    };

    const sQSMessageQueue = new SQSMessageQueue(SQSClient, QUEUE_VIDEO);
    const data = await sQSMessageQueue.sendMessage(messageVideoBody);

    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao enviar mensagem para a fila" });
  }
});

// Read (Receber mensagens da fila)
app.get("/queue", async (req, res) => {
  try {

    const sQSMessageQueue = new SQSMessageQueue(SQSClient, QUEUE_VIDEO);
    const lista = await sQSMessageQueue.receiveMessages();

    res.status(200).json(lista);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao receber mensagens da fila" });
  }
});

// Delete (Excluir mensagem da fila)
app.delete("/queue", async (req, res) => {
  const { receiptHandle } = req.body;

  try {
    const sQSMessageQueue = new SQSMessageQueue(SQSClient, QUEUE_VIDEO);
    sQSMessageQueue.deleteMessage(receiptHandle);
    res.status(200).json({ message: "Mensagem excluída com sucesso" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao excluir mensagem da fila" });
  }
});



//================= Image zip Fila =================

// Create (Enviar mensagem para a fila)
app.post("/zip-queue", async (req, res) => {
  const { messageBody } = req.body;

  try {
    
    const messageVideoBody = {
      id: "",
      videoPath: messageBody.videoPath,
      status: messageBody.status
    };

    const sQSMessageQueue = new SQSMessageQueue(SQSClient, QUEUE_IMAGE);
    const data = await sQSMessageQueue.sendMessage(messageVideoBody);

    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao enviar mensagem para a fila" });
  }
});

// Read (Receber mensagens da fila)
app.get("/zip-queue", async (req, res) => {
  try {

    const sQSMessageQueue = new SQSMessageQueue(SQSClient, QUEUE_IMAGE);
    const lista = await sQSMessageQueue.receiveMessages();

    res.status(200).json(lista);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao receber mensagens da fila" });
  }
});

// Delete (Excluir mensagem da fila)
app.delete("/zip-queue", async (req, res) => {
  const { receiptHandle } = req.body;

  try {
    const sQSMessageQueue = new SQSMessageQueue(SQSClient, QUEUE_IMAGE);
    sQSMessageQueue.deleteMessage(receiptHandle);
    res.status(200).json({ message: "Mensagem excluída com sucesso" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao excluir mensagem da fila" });
  }
});

// =================== Teste S3 ===================

const s3Storage = new S3FileStorage("bucket-video-processing-fiap", "us-east-2");



// Fazer upload de um arquivo
app.post("/s3/upload", upload.single("file"), async (req, res) => {
  const { folderName } = req.body;

  if (!req.file) {
    return res.status(400).json({ error: "Nenhum arquivo foi enviado." });
  }

  const PASTA_ARQUIVOS = "videos";
  const FILE_NAME = cuid();
  const VIDEO_PATH = `${PASTA_ARQUIVOS}/${FILE_NAME}`;

  try {
    const fileBuffer = fs.readFileSync(req.file.path);
    await s3Storage.uploadFile(VIDEO_PATH, fileBuffer, req.file.mimetype);
    res.status(200).json({ message: `Arquivo '${req.file.originalname}' enviado com sucesso.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao fazer upload do arquivo." });
  }
});

// Ler um arquivo do bucket
app.get("/s3/file", async (req, res) => {
  const { key } = req.query;

  if (!key || typeof key !== "string") {
    return res.status(400).json({ error: "O parâmetro 'key' é obrigatório." });
  }

  try {
    const fileBuffer = await s3Storage.getFile(key);

    const outputPath = `temp/video3.mkv`;
    fs.writeFileSync(outputPath, fileBuffer);

    res.status(200).send(fileBuffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao ler o arquivo." });
  }
});

// Excluir um arquivo do bucket
app.delete("/s3/file", async (req, res) => {
  const { key } = req.query;

  if (!key || typeof key !== "string") {
    return res.status(400).json({ error: "O parâmetro 'key' é obrigatório." });
  }

  try {
    await s3Storage.deleteFile(key);
    res.status(200).json({ message: `Arquivo '${key}' excluído com sucesso.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao excluir o arquivo." });
  }
});

// ======================== Teste Video Fila ========================

//POST para realizar o upload do vídeo, enviar a mensagem para a fila e processar o vídeo
app.post("/video-fila", upload.single("video"), async (req, res) => {

  if (!req.file) {
    return res.status(400).json({ error: "Nenhum arquivo foi enviado." });
  }

  const folderUtil = new FolderUtil();

  const PASTA_ARQUIVOS = "videos";
  const FILE_NAME = cuid();
  const FILE_EXTENSION = folderUtil.getFileExtension(req.file.originalname);
  const VIDEO_PATH = `${PASTA_ARQUIVOS}/${FILE_NAME}.${FILE_EXTENSION}`;

  try {
    const fileBuffer = fs.readFileSync(req.file.path);

    await s3Storage.uploadFile(VIDEO_PATH, fileBuffer, req.file.mimetype);

    const messageVideoBody = new QueueMessageMovieBody(
      "",
      VIDEO_PATH,
      Status.PENDING
    );

    const sQSMessageQueue = new SQSMessageQueue(SQSClient, QUEUE_VIDEO);
    await sQSMessageQueue.sendMessage(messageVideoBody);

    fs.unlinkSync(req.file.path);

    res.status(200).json({ message: `Arquivo '${VIDEO_PATH}' enviado com sucesso para a vila de processamento.` });
  } catch (error) {

    s3Storage.deleteFile(VIDEO_PATH);

    console.error(error);
    res.status(500).json({ error: "Erro ao fazer upload do arquivo." });
  }

});

//POST para realizar processamento do vídeo
// app.post("/video-processar", async (req, res) => {

//   try {
//     const sQSMessageQueue = new SQSMessageQueue(SQSClient, QUEUE_VIDEO);
//     const lista = await sQSMessageQueue.receiveMessages();

//     const folderUtil = new FolderUtil();

//     lista.forEach(async (data) => {
//           const message = data as QueueMessageMovieBody;

//           message.videoPath
//           const fileBuffer = await s3Storage.getFile(message.videoPath);

//           const ZIP_TEMP_ID = cuid();
//           const ZIP_TEMP_NAME = `${ZIP_TEMP_ID}.zip`;
//           const ZIP_TEMP_DIR = `temp/${ZIP_TEMP_ID}`;
//           const ZIP_TEMP_PATH = `temp/${ZIP_TEMP_ID}/${ZIP_TEMP_NAME}`;
//           const IMAGE_TEMP_DIR = `${ZIP_TEMP_DIR}/images`;
//           const VIDEO_TEMP_DIR = `${ZIP_TEMP_DIR}/videos`;
//           const VIDEO_TEMP_PATH = `${ZIP_TEMP_DIR}/${message.videoPath}`;
//           const ZIP_MIME_TYPE = "application/zip";

//           folderUtil.createFolder(IMAGE_TEMP_DIR);
//           folderUtil.createFolder(VIDEO_TEMP_DIR);

//           await folderUtil.writeFile(VIDEO_TEMP_PATH, fileBuffer);

//           const s3FileStorage = new S3FileStorage("bucket-video-processing-fiap", "us-east-2");
//           const sqsVideoQueue = new SQSMessageQueue(SQSClient, QUEUE_VIDEO);
//           const sqsImagemQueue = new SQSMessageQueue(SQSClient, QUEUE_IMAGE);
//           const ffmpegVideoProcessor = new FFMPEGVideoProcessor();
//           const streamCompressorFile = new STREAMCompressorFile();
        
//           const proccessVideoImage = new ProccessVideoImage(folderUtil, s3FileStorage, sqsVideoQueue, sqsImagemQueue, ffmpegVideoProcessor, streamCompressorFile);
//           const zipBuffer = await proccessVideoImage.execute(VIDEO_TEMP_PATH, IMAGE_TEMP_DIR);
        
//           await s3FileStorage.uploadFile(`imagens/${ZIP_TEMP_NAME}`, zipBuffer, ZIP_MIME_TYPE);

//           await folderUtil.deleteFolder(ZIP_TEMP_DIR);
//     });

//     res.status(200).json({ message: `Arquivo  enviado com sucesso para a vila de processamento.` });
//   } catch (error) {

//     console.error(error);
//     res.status(500).json({ error: "Erro ao fazer upload do arquivo." });
//   }

// });

app.post("/video-processar-execute", async (req, res) => {
  const folderUtil = new FolderUtil();
  const s3FileStorage = new S3FileStorage(BUKET_NAME, REGION);
  const sqsVideoQueue = new SQSMessageQueue(SQSClient, QUEUE_VIDEO);
  const sqsImagemQueue = new SQSMessageQueue(SQSClient, QUEUE_IMAGE);
  const ffmpegVideoProcessor = new FFMPEGVideoProcessor();
  const streamCompressorFile = new STREAMCompressorFile();
  
  const proccessVideoImage = new ProccessVideoImage(folderUtil, s3FileStorage, sqsVideoQueue, sqsImagemQueue, ffmpegVideoProcessor, streamCompressorFile);
  await proccessVideoImage.execute();
});


setInterval(async ()  => {
  const folderUtil = new FolderUtil();
  const s3FileStorage = new S3FileStorage(BUKET_NAME, REGION);
  const sqsVideoQueue = new SQSMessageQueue(SQSClient, QUEUE_VIDEO);
  const sqsImagemQueue = new SQSMessageQueue(SQSClient, QUEUE_IMAGE);
  const ffmpegVideoProcessor = new FFMPEGVideoProcessor();
  const streamCompressorFile = new STREAMCompressorFile();
  
  const proccessVideoImage = new ProccessVideoImage(folderUtil, s3FileStorage, sqsVideoQueue, sqsImagemQueue, ffmpegVideoProcessor, streamCompressorFile);
  await proccessVideoImage.execute();
}, 10000);

//intervalor de tempo


app.listen(4000, () => {
  console.log('Servidor rodando na porta 3000');
});