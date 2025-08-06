import { Router, Request, Response } from 'express';
import { supabase } from '../config/database.js';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const router = Router();

// 验证schemas
const registerSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  username: z.string().min(3, '用户名至少3个字符').max(50, '用户名最多50个字符'),
  password: z.string().min(6, '密码至少6个字符'),
  displayName: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(1, '请输入密码'),
});

// 生成JWT token
const generateToken = (userId: string) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET not configured');
  }
  return jwt.sign({ userId }, secret, { expiresIn: '7d' });
};

// 用户注册
router.post('/register', async (req: Request, res: Response) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const { email, username, password, displayName } = validatedData;

    // 检查用户是否已存在
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .or(`email.eq.${email},username.eq.${username}`)
      .single();

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: '邮箱或用户名已被使用',
      });
    }

    // 使用 Supabase Auth 创建用户
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          display_name: displayName || username,
        },
      },
    });

    if (authError) {
      console.error('Supabase Auth 注册错误:', authError);
      return res.status(400).json({
        success: false,
        message: authError.message,
      });
    }

    if (!authData.user) {
      return res.status(400).json({
        success: false,
        message: '用户创建失败',
      });
    }

    // 在 users 表中创建用户记录
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        username,
        display_name: displayName || username,
      })
      .select()
      .single();

    if (userError) {
      console.error('用户数据创建错误:', userError);
      // 如果用户表插入失败，删除 auth 用户
      await supabase.auth.admin.deleteUser(authData.user.id);
      return res.status(500).json({
        success: false,
        message: '用户创建失败',
      });
    }

    // 生成 JWT token
    const token = generateToken(authData.user.id);

    res.status(201).json({
      success: true,
      message: '注册成功',
      data: {
        user: {
          id: userData.id,
          email: userData.email,
          username: userData.username,
          display_name: userData.display_name,
          avatar_url: userData.avatar_url,
        },
        token,
      },
    });
  } catch (error) {
    console.error('注册错误:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: '输入数据无效',
        errors: error.issues,
      });
    }
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
    });
  }
});

// 用户登录
router.post('/login', async (req: Request, res: Response) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const { email, password } = validatedData;

    // 使用 Supabase Auth 登录
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      console.error('Supabase Auth 登录错误:', authError);
      return res.status(401).json({
        success: false,
        message: '邮箱或密码错误',
      });
    }

    if (!authData.user) {
      return res.status(401).json({
        success: false,
        message: '登录失败',
      });
    }

    // 获取用户详细信息
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (userError || !userData) {
      console.error('获取用户数据错误:', userError);
      return res.status(500).json({
        success: false,
        message: '获取用户信息失败',
      });
    }

    // 生成 JWT token
    const token = generateToken(authData.user.id);

    res.json({
      success: true,
      message: '登录成功',
      data: {
        user: {
          id: userData.id,
          email: userData.email,
          username: userData.username,
          display_name: userData.display_name,
          avatar_url: userData.avatar_url,
          bio: userData.bio,
          location: userData.location,
          website: userData.website,
          is_verified: userData.is_verified,
          follower_count: userData.follower_count,
          following_count: userData.following_count,
          post_count: userData.post_count,
        },
        token,
      },
    });
  } catch (error) {
    console.error('登录错误:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: '输入数据无效',
        errors: error.issues,
      });
    }
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
    });
  }
});

// 用户登出
router.post('/logout', async (req: Request, res: Response) => {
  try {
    // 从请求头获取 token
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (token) {
      // 使用 Supabase Auth 登出
      await supabase.auth.signOut();
    }

    res.json({
      success: true,
      message: '登出成功',
    });
  } catch (error) {
    console.error('登出错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
    });
  }
});

// 获取当前用户信息
router.get('/me', async (req: Request, res: Response) => {
  try {
    // 从请求头获取 token
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: '未提供认证令牌',
      });
    }

    // 验证 JWT token
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET not configured');
    }

    const decoded = jwt.verify(token, secret) as { userId: string };
    
    // 获取用户信息
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', decoded.userId)
      .single();

    if (userError || !userData) {
      return res.status(404).json({
        success: false,
        message: '用户不存在',
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: userData.id,
          email: userData.email,
          username: userData.username,
          displayName: userData.display_name,
          avatarUrl: userData.avatar_url,
          bio: userData.bio,
          location: userData.location,
          website: userData.website,
          isVerified: userData.is_verified,
          followerCount: userData.follower_count,
          followingCount: userData.following_count,
          postCount: userData.post_count,
        },
      },
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: '无效的认证令牌',
      });
    }
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
    });
  }
});

export default router;