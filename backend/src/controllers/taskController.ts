import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export const getTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, search, page = '1', limit = '10' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = { userId: req.userId };
    if (status) where.status = status;
    if (search) where.title = { contains: search as string };

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where, skip, take: parseInt(limit as string),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.task.count({ where }),
    ]);

    res.json({ tasks, total, page: parseInt(page as string), totalPages: Math.ceil(total / parseInt(limit as string)) });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
};

export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description } = req.body;
    if (!title) {
      res.status(400).json({ error: 'Title is required' });
      return;
    }
    const task = await prisma.task.create({
      data: { title, description, userId: req.userId! },
    });
    res.status(201).json(task);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params['id'] as string);
    const task = await prisma.task.findFirst({
      where: { id, userId: req.userId },
    });
    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    res.json(task);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params['id'] as string);
    const task = await prisma.task.findFirst({
      where: { id, userId: req.userId },
    });
    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    const updated = await prisma.task.update({
      where: { id },
      data: req.body,
    });
    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params['id'] as string);
    const task = await prisma.task.findFirst({
      where: { id, userId: req.userId },
    });
    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    await prisma.task.delete({ where: { id } });
    res.json({ message: 'Task deleted successfully' });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
};

export const toggleTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params['id'] as string);
    const task = await prisma.task.findFirst({
      where: { id, userId: req.userId },
    });
    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    const updated = await prisma.task.update({
      where: { id },
      data: { status: newStatus },
    });
    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
};