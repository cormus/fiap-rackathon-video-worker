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

const app = express();
const upload = multer({ dest: 'temp/' });

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

app.post('/upload2', upload.single('video'), async (req, res) => {
  const videoPath = (req && req.file)? req.file.path: "";

  const tempDir = 'temp';
  
  if (!fs.existsSync(tempDir)){
      fs.mkdirSync(tempDir);
  }
  const outputDir = `${tempDir}/frames_${Date.now()}`;
  fs.mkdirSync(outputDir);

  const sqsMessageQueue = new SQSMessageQueue("", "");
  const ffmpegVideoProcessor = new FFMPEGVideoProcessor();
  const streamCompressorFile = new STREAMCompressorFile();

  const proccessVideoImage = new ProccessVideoImage(sqsMessageQueue, ffmpegVideoProcessor, streamCompressorFile);
  const zipBuffer = await proccessVideoImage.execute(videoPath, outputDir);

  const outputPath = `${tempDir}/arquivo.zip`;
  fs.writeFileSync(outputPath, zipBuffer);

  res.json(true);
});

app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});