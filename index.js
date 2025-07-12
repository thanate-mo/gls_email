const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;
const cors = require('cors')

app.use(express.json()); // สำหรับอ่าน JSON body

// ✅ เปิดใช้งาน CORS สำหรับทุก origin
app.use(cors())

const DATA_PATH = path.join(__dirname, 'data/emails.json');

// 🔁 Helper: โหลดข้อมูลจากไฟล์
const loadEmails = () => {
  if (!fs.existsSync(DATA_PATH)) return [];
  const data = fs.readFileSync(DATA_PATH, 'utf8');
  return JSON.parse(data || '[]');
};

// 🔁 Helper: บันทึกข้อมูลลงไฟล์
const saveEmails = (emails) => {
  fs.writeFileSync(DATA_PATH, JSON.stringify(emails, null, 2), 'utf8');
};

// ✅ GET - อ่านทั้งหมด
app.get('/emails', (req, res) => {
  const emails = loadEmails();
  res.json(emails);
});

// ✅ GET - อ่านตาม bucode
app.get('/emails/:bucode', (req, res) => {
  const bucode = req.params.bucode;
  const emails = loadEmails();
  const email = emails.find(e => e.bucode === bucode);
  if (!email) return res.status(404).json({ message: 'Not found' });
  res.json(email);
});

// ✅ POST - เพิ่มใหม่
app.post('/emails', (req, res) => {
  const { bucode, to, cc } = req.body;
  if (!bucode || !to) return res.status(400).json({ message: 'Missing bucode or to' });

  const emails = loadEmails();
  if (emails.find(e => e.bucode === bucode)) {
    console.log('duplicate bucode');
    return res.status(409).json({ message: 'bucode already exists' });
  }
  
  console.log('create new bucode');
  emails.push({ bucode, to, cc });
  saveEmails(emails);
  res.status(201).json({ message: 'Added', bucode });
});

// ✅ PUT - แก้ไขตาม bucode
app.put('/emails/:bucode', (req, res) => {
  const bucode = req.params.bucode;
  const { to, cc } = req.body;

  const emails = loadEmails();
  const index = emails.findIndex(e => e.bucode === bucode);
  if (index === -1) return res.status(404).json({ message: 'Not found' });

  emails[index] = { bucode, to, cc };
  saveEmails(emails);
  res.json({ message: 'Updated', bucode });
});

// ✅ DELETE - ลบตาม bucode
app.delete('/emails/:bucode', (req, res) => {
  const bucode = req.params.bucode;

  const emails = loadEmails();
  const filtered = emails.filter(e => e.bucode !== bucode);
  if (filtered.length === emails.length) return res.status(404).json({ message: 'Not found' });

  saveEmails(filtered);
  res.json({ message: 'Deleted', bucode });
});


// Endpoint: GET /users
app.get('/users', (req, res) => {
  fs.readFile('./data/users.json', 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ message: 'Error reading JSON file' });
    }
    const users = JSON.parse(data);
    res.json(users);
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
