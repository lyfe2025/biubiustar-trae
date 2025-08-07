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
    const status = req.query.status as string; // 添加状态过滤
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
        ),
        reviewed_by_user:users!posts_reviewed_by_fkey(
          id,
          username,
          display_name
        )
      `, { count: 'exact' });

    // 搜索过滤
    if (search) {
      query = query.ilike('content', `%${search}%`);
    }

    // 状态过滤
    if (status && ['pending', 'published', 'rejected', 'draft', 'archived'].includes(status)) {
      query = query.eq('status', status);
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

// 帖子审核 - 获取待审核帖子列表
router.get('/posts/pending', async (req: Request, res: Response) => {
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
      `, { count: 'exact' })
      .eq('status', 'pending');

    // 搜索过滤
    if (search) {
      query = query.ilike('content', `%${search}%`);
    }

    const { data: posts, error, count } = await query
      .order('created_at', { ascending: true }) // 按创建时间升序，优先处理早期提交的
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('获取待审核帖子失败:', error);
      return res.status(500).json({
        success: false,
        message: '获取待审核帖子失败',
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
    console.error('获取待审核帖子失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
    });
  }
});

// 帖子审核 - 审核通过
router.post('/posts/:id/approve', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adminId = req.user?.id;

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: '未授权的操作',
      });
    }

    // 开始事务
    const { data: post, error: updateError } = await supabase
      .from('posts')
      .update({
        status: 'published',
        reviewed_at: new Date().toISOString(),
        reviewed_by: adminId,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('status', 'pending') // 确保只能审核待审核的帖子
      .select()
      .single();

    if (updateError) {
      console.error('审核通过失败:', updateError);
      return res.status(500).json({
        success: false,
        message: '审核通过失败',
      });
    }

    if (!post) {
      return res.status(404).json({
        success: false,
        message: '帖子不存在或已被审核',
      });
    }

    // 记录审核历史
    const { error: historyError } = await supabase
      .from('post_moderation_history')
      .insert({
        post_id: id,
        admin_id: adminId,
        action: 'approved',
        previous_status: 'pending',
        new_status: 'published',
        created_at: new Date().toISOString()
      });

    if (historyError) {
      console.error('记录审核历史失败:', historyError);
      // 不影响主要操作，只记录错误
    }

    res.json({
      success: true,
      data: post,
      message: '帖子审核通过',
    });
  } catch (error) {
    console.error('审核通过失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
    });
  }
});

// 帖子审核 - 审核拒绝
router.post('/posts/:id/reject', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = req.user?.id;

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: '未授权的操作',
      });
    }

    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: '拒绝原因不能为空',
      });
    }

    // 更新帖子状态
    const { data: post, error: updateError } = await supabase
      .from('posts')
      .update({
        status: 'rejected',
        reviewed_at: new Date().toISOString(),
        reviewed_by: adminId,
        rejection_reason: reason.trim(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('status', 'pending') // 确保只能审核待审核的帖子
      .select()
      .single();

    if (updateError) {
      console.error('审核拒绝失败:', updateError);
      return res.status(500).json({
        success: false,
        message: '审核拒绝失败',
      });
    }

    if (!post) {
      return res.status(404).json({
        success: false,
        message: '帖子不存在或已被审核',
      });
    }

    // 记录审核历史
    const { error: historyError } = await supabase
      .from('post_moderation_history')
      .insert({
        post_id: id,
        admin_id: adminId,
        action: 'rejected',
        previous_status: 'pending',
        new_status: 'rejected',
        reason: reason.trim(),
        created_at: new Date().toISOString()
      });

    if (historyError) {
      console.error('记录审核历史失败:', historyError);
      // 不影响主要操作，只记录错误
    }

    res.json({
      success: true,
      data: post,
      message: '帖子审核拒绝',
    });
  } catch (error) {
    console.error('审核拒绝失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
    });
  }
});

// 帖子审核 - 批量审核
router.post('/posts/batch-moderate', async (req: Request, res: Response) => {
  try {
    const { postIds, action, reason } = req.body;
    const adminId = req.user?.id;

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: '未授权的操作',
      });
    }

    if (!Array.isArray(postIds) || postIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: '请选择要审核的帖子',
      });
    }

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: '无效的审核操作',
      });
    }

    if (action === 'reject' && (!reason || reason.trim().length === 0)) {
      return res.status(400).json({
        success: false,
        message: '批量拒绝时必须提供拒绝原因',
      });
    }

    const updateData: any = {
      reviewed_at: new Date().toISOString(),
      reviewed_by: adminId,
      updated_at: new Date().toISOString()
    };

    if (action === 'approve') {
      updateData.status = 'published';
    } else {
      updateData.status = 'rejected';
      updateData.rejection_reason = reason.trim();
    }

    // 批量更新帖子状态
    const { data: posts, error: updateError } = await supabase
      .from('posts')
      .update(updateData)
      .in('id', postIds)
      .eq('status', 'pending') // 确保只能审核待审核的帖子
      .select();

    if (updateError) {
      console.error('批量审核失败:', updateError);
      return res.status(500).json({
        success: false,
        message: '批量审核失败',
      });
    }

    // 记录审核历史
    const historyRecords = posts?.map(post => ({
      post_id: post.id,
      admin_id: adminId,
      action: action === 'approve' ? 'approved' : 'rejected',
      previous_status: 'pending',
      new_status: action === 'approve' ? 'published' : 'rejected',
      reason: action === 'reject' ? reason.trim() : undefined,
      created_at: new Date().toISOString()
    })) || [];

    if (historyRecords.length > 0) {
      const { error: historyError } = await supabase
        .from('post_moderation_history')
        .insert(historyRecords);

      if (historyError) {
        console.error('记录批量审核历史失败:', historyError);
        // 不影响主要操作，只记录错误
      }
    }

    res.json({
      success: true,
      data: {
        processedCount: posts?.length || 0,
        posts
      },
      message: `成功${action === 'approve' ? '通过' : '拒绝'}了 ${posts?.length || 0} 个帖子`,
    });
  } catch (error) {
    console.error('批量审核失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
    });
  }
});

// 帖子审核 - 获取审核历史
router.get('/posts/:id/moderation-history', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data: history, error } = await supabase
      .from('post_moderation_history')
      .select(`
        *,
        admin:users!post_moderation_history_admin_id_fkey(
          id,
          username,
          display_name
        )
      `)
      .eq('post_id', id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('获取审核历史失败:', error);
      return res.status(500).json({
        success: false,
        message: '获取审核历史失败',
      });
    }

    res.json({
      success: true,
      data: history || [],
    });
  } catch (error) {
    console.error('获取审核历史失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
    });
  }
});

// 帖子审核 - 获取审核统计
router.get('/posts/moderation-stats', async (req: Request, res: Response) => {
  try {
    // 获取各状态的帖子数量
    const { data: stats, error } = await supabase
      .from('posts')
      .select('status')
      .not('status', 'is', null);

    if (error) {
      console.error('获取审核统计失败:', error);
      return res.status(500).json({
        success: false,
        message: '获取审核统计失败',
      });
    }

    // 统计各状态数量
    const statusCounts = {
      pending: 0,
      published: 0,
      rejected: 0,
      draft: 0,
      archived: 0
    };

    stats?.forEach(post => {
      if (statusCounts.hasOwnProperty(post.status)) {
        statusCounts[post.status as keyof typeof statusCounts]++;
      }
    });

    // 获取今日审核数量
    const today = new Date().toISOString().split('T')[0];
    const { data: todayModerated, error: todayError } = await supabase
      .from('post_moderation_history')
      .select('action')
      .gte('created_at', `${today}T00:00:00.000Z`)
      .lt('created_at', `${today}T23:59:59.999Z`);

    const todayStats = {
      approved: 0,
      rejected: 0
    };

    todayModerated?.forEach(record => {
      if (record.action === 'approved') todayStats.approved++;
      if (record.action === 'rejected') todayStats.rejected++;
    });

    res.json({
      success: true,
      data: {
        statusCounts,
        todayStats,
        total: stats?.length || 0
      },
    });
  } catch (error) {
    console.error('获取审核统计失败:', error);
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