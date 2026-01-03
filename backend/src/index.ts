import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

// .env yuklash
dotenv.config();

// Express va Prisma
const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req: Request, res: Response) => {
  res.json({ 
    message: 'Backend ishga tushdi! 🚀',
    timestamp: new Date()
  });
});

// Health check (database bilan)
app.get('/health', async (req: Request, res: Response) => {
  try {
    await prisma.$connect();
    res.json({ status: 'OK', database: 'Connected ✅' });
  } catch (error) {
    res.status(500).json({ status: 'ERROR', database: 'Disconnected ❌' });
  }
});

// ==================== USER CRUD ====================

// 1️⃣ CREATE - Yangi user yaratish
app.post('/users', async (req: Request, res: Response) => {
  try {
    const { email, name, password } = req.body;
    
    const user = await prisma.user.create({
      data: { email, name, password }
    });
    
    res.status(201).json(user);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// 2️⃣ READ ALL - Barcha userlarni olish
app.get('/users', async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 3️⃣ READ ONE - Bitta userni olish
app.get('/users/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: Number(id) }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User topilmadi' });
    }
    
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 4️⃣ UPDATE - Userni yangilash
app.put('/users/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { email, name, password } = req.body;
    
    const user = await prisma.user.update({
      where: { id: Number(id) },
      data: { email, name, password }
    });
    
    res.json(user);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// 5️⃣ DELETE - Userni o'chirish
app.delete('/users/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    await prisma.user.delete({
      where: { id: Number(id) }
    });
    
    res.json({ message: 'User o\'chirildi' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Serverni ishga tushirish
app.listen(PORT, () => {
  console.log(`✅ Server ${PORT} portda ishlamoqda!`);
  console.log(`🌐 http://localhost:${PORT}`);
  console.log(`📊 Database: Connected`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
