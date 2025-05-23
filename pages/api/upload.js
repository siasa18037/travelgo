import ImageKit from 'imagekit';
import multer from 'multer';

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

// ตั้งค่า multer memory storage
const upload = multer({ storage: multer.memoryStorage() });

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
}

export const config = {
  api: {
    bodyParser: false, // ต้องปิด body parser
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  try {
    await runMiddleware(req, res, upload.single('file'));

    const fileBuffer = req.file.buffer;

    const result = await imagekit.upload({
      file: fileBuffer, // หรือใช้ base64 ได้เช่นกัน
      fileName: req.file.originalname,
      folder: '/Travelgo', // หรือเปลี่ยนชื่อโฟลเดอร์ได้
    });

    res.status(200).json({ url: result.url });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Upload failed', detail: err.message });
  }
}
