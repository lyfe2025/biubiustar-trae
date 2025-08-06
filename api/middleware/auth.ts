import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/database.js';

// 扩展 Request 接口以包含用户信息
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        username: string;
        display_name: string;
        avatar_url?: string;
        bio?: string;
        location?: string;
        website?: string;
        is_verified: boolean;
        role: 'user' | 'admin' | 'super_admin';
        follower_count: number;
        following_count: number;
        post_count: number;
      };
    }
  }
}

// JWT 认证中间件
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 从请求头获取 token
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: '未提供认证令牌',
      });
    }

    // 验证 JWT token
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('JWT_SECRET 未配置');
      return res.status(500).json({
        success: false,
        message: '服务器配置错误',
      });
    }

    const decoded = jwt.verify(token, secret) as { userId: string };
    
    // 获取用户信息
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', decoded.userId)
      .single();

    if (userError || !userData) {
      return res.status(401).json({
        success: false,
        message: '用户不存在或已被删除',
      });
    }

    // 将用户信息添加到请求对象
    req.user = {
      id: userData.id,
      email: userData.email,
      username: userData.username,
      display_name: userData.display_name,
      avatar_url: userData.avatar_url,
      bio: userData.bio,
      location: userData.location,
      website: userData.website,
      is_verified: userData.is_verified,
      role: userData.role || 'user',
      follower_count: userData.follower_count,
      following_count: userData.following_count,
      post_count: userData.post_count,
    };

    next();
  } catch (error) {
    console.error('认证中间件错误:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: '无效的认证令牌',
      });
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: '认证令牌已过期',
      });
    }

    res.status(500).json({
      success: false,
      message: '服务器内部错误',
    });
  }
};

// 可选认证中间件（不强制要求认证，但如果有token会解析用户信息）
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : null;

    if (!token) {
      // 没有token，继续执行但不设置用户信息
      return next();
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('JWT_SECRET 未配置');
      return next();
    }

    try {
      const decoded = jwt.verify(token, secret) as { userId: string };
      
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', decoded.userId)
        .single();

      if (!userError && userData) {
        req.user = {
          id: userData.id,
          email: userData.email,
          username: userData.username,
          display_name: userData.display_name,
          avatar_url: userData.avatar_url,
          bio: userData.bio,
          location: userData.location,
          website: userData.website,
          is_verified: userData.is_verified,
          role: userData.role || 'user',
          follower_count: userData.follower_count,
          following_count: userData.following_count,
          post_count: userData.post_count,
        };
      }
    } catch (jwtError) {
      // JWT 验证失败，但不阻止请求继续
      console.log('可选认证JWT验证失败:', jwtError);
    }

    next();
  } catch (error) {
    console.error('可选认证中间件错误:', error);
    // 出错时不阻止请求继续
    next();
  }
};

// 管理员权限检查中间件
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: '需要认证',
    });
  }

  // 检查用户是否具有管理员权限
  if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      message: '需要管理员权限',
    });
  }

  next();
};

// 超级管理员权限检查中间件
export const requireSuperAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: '需要认证',
    });
  }

  // 检查用户是否具有超级管理员权限
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      message: '需要超级管理员权限',
    });
  }

  next();
};

// 角色权限检查中间件工厂函数
export const requireRole = (roles: ('user' | 'admin' | 'super_admin')[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: '需要认证',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: '权限不足',
      });
    }

    next();
  };
};