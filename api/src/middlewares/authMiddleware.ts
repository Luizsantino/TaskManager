import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'admin1234';

export interface AuthRequest extends Request {
  user?: {
    userId: number;   // <-- correto
    email: string;
  };
}

export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token não fornecido.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; email: string };
    (req as AuthRequest).user = {
      userId: decoded.userId,
      email: decoded.email,
    };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido.' });
  }
};
