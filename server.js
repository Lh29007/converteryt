const express = require('express');
const ytdl = require('ytdl-core');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');

const app = express();
ffmpeg.setFfmpegPath(ffmpegPath);

app.use(express.static(path.join(__dirname, 'public')));

// Télécharger MP4
app.get('/download', async (req, res) => {
    const { url, format } = req.query;
    if (!url) return res.status(400).send('URL manquante');

    try {
        const info = await ytdl.getInfo(url);
        const title = info.videoDetails.title.replace(/[\/\\?%*:|"<>]/g, '-');

        if (format === 'mp3') {
            res.header('Content-Disposition', `attachment; filename="${title}.mp3"`);
            const stream = ytdl(url, { quality: 'highestaudio' });
            ffmpeg(stream)
                .audioBitrate(128)
                .format('mp3')
                .pipe(res);
        } else {
            res.header('Content-Disposition', `attachment; filename="${title}.mp4"`);
            ytdl(url, { format: 'mp4' }).pipe(res);
        }
    } catch (err) {
        res.status(500).send('Erreur lors du téléchargement');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serveur lancé sur le port ${PORT}`));