import { Router, Request, Response } from 'express';
import { supabase } from '../config/database.js';
import { authenticateToken, requireAdmin, requireSuperAdmin } from '../middleware/auth.js';

const router = Router();

// 所有管理员路由都需要认证和管理员权限
router.use(authenticateToken);
router.use(requireAdmin);

// 获取管理员仪表板统计数据
router.get('/dashboard/stats', async (req: Request, res: Response) => {
  try {
    // 获取基础统计数据
    const { data: stats, error: statsError } = await supabase
      .from('admin_stats')
      .select('*')
      .single();

    if (statsError) {
      console.error('获取统计数据失败:', statsError);
      return res.status(500).json({
        success: false,
        message: '获取统计数据失败',
      });
    }

    // 获取最近7天的用户注册趋势
    const { data: userTrend, error: userTrendError } = await supabase
      .from('users')
      .select('created_at')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: true });

    // 获取最近7天的帖子发布趋势
    const { data: postTrend, error: postTrendError } = await supabase
      .from('posts')
      .select('created_at')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: true });

    // 处理趋势数据
    const processTrendData = (data: any[], days: number = 7) => {
      const result = [];
      const now = new Date();
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split('T')[0];
        const count = data?.filter(item => 
          item.created_at.startsWith(dateStr)
        ).length || 0;
        
        result.push({
          date: dateStr,
          count
        });
      }
      
      return result;
    };

    res.json({
      success: true,
      data: {
        ...stats,
        userTrend: processTrendData(userTrend || []),
        postTrend: processTrendData(postTrend || [])
      },
    });
  } catch (error) {
    console.error('获取仪表板数据失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
    });
  }
});

// 用户管理 - 获取用户列表
router.get('/users', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const role = req.query.role as string;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('users')
      .select('*', { count: 'exact' });

    // 搜索过滤
    if (search) {
      query = query.or(`username.ilike.%${search}%,email.ilike.%${search}%,display_name.ilike.%${search}%`);
    }

    // 角色过滤
    if (role && ['user', 'admin', 'super_admin'].includes(role)) {
      query = query.eq('role', role);
    }

    const { data: users, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('获取用户列表失败:', error);
      return res.status(500).json({
        success: false,
        message: '获取用户列表失败',
      });
    }

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      },
    });
  } catch (error) {
    console.error('获取用户列表失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
    });
  }
});

// 用户管理 - 更新用户信息
router.put('/users/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role, is_verified, display_name, bio } = req.body;

    // 只有超级管理员可以修改其他管理员
    if (role && ['admin', 'super_admin'].includes(role)) {
      if (req.user?.role !== 'super_admin') {
        return res.status(403).json({
          success: false,
          message: '只有超级管理员可以设置管理员角色',
        });
      }
    }

    const updateData: any = {};
    if (role !== undefined) updateData.role = role;
    if (is_verified !== undefined) updateData.is_verified = is_verified;
    if (display_name !== undefined) updateData.display_name = display_name;
    if (bio !== undefined) updateData.bio = bio;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('更新用户失败:', error);
      return res.status(500).json({
        success: false,
        message: '更新用户失败',
      });
    }

    res.json({
      success: true,
      data,
      message: '用户信息更新成功',
    });
  } catch (error) {
    console.error('更新用户失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
    });
  }
});

// 内容管理 - 获取帖子列表
router.get('/posts', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('posts')
      .select(`
        *,
        users!posts_user_id_fkey(
          id,
          username,
          display_name,
          avatar_url
        )
      `, { count: 'exact' });

    // 搜索过滤
    if (search) {
      query = query.ilike('content', `%${search}%`);
    }

    const { data: posts, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('获取帖子列表失败:', error);
      return res.status(500).json({
        success: false,
        message: '获取帖子列表失败',
      });
    }

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      },
    });
  } catch (error) {
    console.error('获取帖子列表失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
    });
  }
});

// 内容管理 - 删除帖子
router.delete('/posts/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('删除帖子失败:', error);
      return res.status(500).json({
        success: false,
        message: '删除帖子失败',
      });
    }

    res.json({
      success: true,
      message: '帖子删除成功',
    });
  } catch (error) {
    console.error('删除帖子失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
    });
  }
});

// 内容管理 - 获取评论列表
router.get('/comments', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('comments')
      .select(`
        *,
        users!comments_user_id_fkey(
          id,
          username,
          display_name,
          avatar_url
        ),
        posts!comments_post_id_fkey(
          id,
          content
        )
      `, { count: 'exact' });

    // 搜索过滤
    if (search) {
      query = query.ilike('content', `%${search}%`);
    }

    const { data: comments, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('获取评论列表失败:', error);
      return res.status(500).json({
        success: false,
        message: '获取评论列表失败',
      });
    }

    res.json({
      success: true,
      data: {
        comments,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      },
    });
  } catch (error) {
    console.error('获取评论列表失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
    });
  }
});

// 内容管理 - 删除评论
router.delete('/comments/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('删除评论失败:', error);
      return res.status(500).json({
        success: false,
        message: '删除评论失败',
      });
    }

    res.json({
      success: true,
      message: '评论删除成功',
    });
  } catch (error) {
    console.error('删除评论失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
    });
  }
});

// 活动管理 - 获取活动列表
router.get('/events', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const status = req.query.status as string;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('events')
      .select(`
        *,
        users!events_organizer_id_fkey(
          id,
          username,
          display_name,
          avatar_url
        )
      `, { count: 'exact' });

    // 搜索过滤
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // 状态过滤
    if (status && ['upcoming', 'ongoing', 'completed', 'cancelled'].includes(status)) {
      query = query.eq('status', status);
    }

    const { data: events, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('获取活动列表失败:', error);
      return res.status(500).json({
        success: false,
        message: '获取活动列表失败',
      });
    }

    res.json({
      success: true,
      data: {
        events,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      },
    });
  } catch (error) {
    console.error('获取活动列表失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
    });
  }
});

// 活动管理 - 更新活动状态
router.put('/events/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, is_featured } = req.body;

    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (is_featured !== undefined) updateData.is_featured = is_featured;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('events')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('更新活动失败:', error);
      return res.status(500).json({
        success: false,
        message: '更新活动失败',
      });
    }

    res.json({
      success: true,
      data,
      message: '活动更新成功',
    });
  } catch (error) {
    console.error('更新活动失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
    });
  }
});

// 活动管理 - 删除活动
router.delete('/events/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('删除活动失败:', error);
      return res.status(500).json({
        success: false,
        message: '删除活动失败',
      });
    }

    res.json({
      success: true,
      message: '活动删除成功',
    });
  } catch (error) {
    console.error('删除活动失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
    });
  }
});

export default router;