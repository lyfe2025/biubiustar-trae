import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';
import { z } from 'zod';

const router = Router();

// 验证schema
const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(50).optional(),
  bio: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
  website: z.string().url().optional().or(z.literal('')),
  avatarUrl: z.string().url().optional().or(z.literal(''))
});

const searchUsersSchema = z.object({
  q: z.string().min(1),
  limit: z.string().transform(val => parseInt(val)).pipe(z.number().min(1).max(50)).optional()
});

// 获取用户资料
router.get('/:username', optionalAuth, async (req, res) => {
  try {
    const { username } = req.params;
    const currentUserId = req.user?.id;

    // 获取用户基本信息
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (userError || !user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 检查是否关注了该用户
    let isFollowing = false;
    if (currentUserId && currentUserId !== user.id) {
      const { data: followData } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', currentUserId)
        .eq('following_id', user.id)
        .single();
      
      isFollowing = !!followData;
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          display_name: user.display_name,
          avatar_url: user.avatar_url,
          bio: user.bio,
          location: user.location,
          website: user.website,
          is_verified: user.is_verified,
          follower_count: user.follower_count,
          following_count: user.following_count,
          created_at: user.created_at,
          isFollowing
        }
      }
    });
  } catch (error) {
    console.error('获取用户资料失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 更新用户资料
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const validation = updateProfileSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: '输入数据无效',
        errors: validation.error.issues
      });
    }

    const updateData = validation.data;

    const { data: user, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('更新用户资料失败:', error);
      return res.status(500).json({
        success: false,
        message: '更新失败'
      });
    }

    res.json({
      success: true,
      message: '资料更新成功',
      data: { user }
    });
  } catch (error) {
    console.error('更新用户资料失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 关注用户
router.post('/:username/follow', authenticateToken, async (req, res) => {
  try {
    const { username } = req.params;
    const followerId = req.user.id;

    // 获取被关注用户的ID
    const { data: targetUser, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single();

    if (userError || !targetUser) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    const followingId = targetUser.id;

    // 不能关注自己
    if (followerId === followingId) {
      return res.status(400).json({
        success: false,
        message: '不能关注自己'
      });
    }

    // 检查是否已经关注
    const { data: existingFollow } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .single();

    if (existingFollow) {
      return res.status(400).json({
        success: false,
        message: '已经关注了该用户'
      });
    }

    // 创建关注关系
    const { error: followError } = await supabase
      .from('follows')
      .insert({
        follower_id: followerId,
        following_id: followingId
      });

    if (followError) {
      console.error('关注用户失败:', followError);
      return res.status(500).json({
        success: false,
        message: '关注失败'
      });
    }

    res.json({
      success: true,
      message: '关注成功'
    });
  } catch (error) {
    console.error('关注用户失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 取消关注用户
router.delete('/:username/follow', authenticateToken, async (req, res) => {
  try {
    const { username } = req.params;
    const followerId = req.user.id;

    // 获取被取消关注用户的ID
    const { data: targetUser, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single();

    if (userError || !targetUser) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    const followingId = targetUser.id;

    // 删除关注关系
    const { error: unfollowError } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);

    if (unfollowError) {
      console.error('取消关注失败:', unfollowError);
      return res.status(500).json({
        success: false,
        message: '取消关注失败'
      });
    }

    res.json({
      success: true,
      message: '取消关注成功'
    });
  } catch (error) {
    console.error('取消关注失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 获取用户的关注列表
router.get('/:username/following', optionalAuth, async (req, res) => {
  try {
    const { username } = req.params;
    const { page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    // 获取用户ID
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single();

    if (userError || !user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 获取关注列表
    const { data: follows, error: followsError } = await supabase
      .from('follows')
      .select(`
        following:users!follows_following_id_fkey(
          id,
          username,
          displayName,
          avatarUrl,
          bio,
          isVerified,
          followerCount,
          followingCount
        )
      `)
      .eq('follower_id', user.id)
      .range(offset, offset + limitNum - 1);

    if (followsError) {
      console.error('获取关注列表失败:', followsError);
      return res.status(500).json({
        success: false,
        message: '获取关注列表失败'
      });
    }

    const followingUsers = follows?.map(f => f.following) || [];

    res.json({
      success: true,
      data: {
        users: followingUsers,
        pagination: {
          page: pageNum,
          limit: limitNum,
          hasMore: followingUsers.length === limitNum
        }
      }
    });
  } catch (error) {
    console.error('获取关注列表失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 获取用户的粉丝列表
router.get('/:username/followers', optionalAuth, async (req, res) => {
  try {
    const { username } = req.params;
    const { page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    // 获取用户ID
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single();

    if (userError || !user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 获取粉丝列表
    const { data: follows, error: followsError } = await supabase
      .from('follows')
      .select(`
        follower:users!follows_follower_id_fkey(
          id,
          username,
          displayName,
          avatarUrl,
          bio,
          isVerified,
          followerCount,
          followingCount
        )
      `)
      .eq('following_id', user.id)
      .range(offset, offset + limitNum - 1);

    if (followsError) {
      console.error('获取粉丝列表失败:', followsError);
      return res.status(500).json({
        success: false,
        message: '获取粉丝列表失败'
      });
    }

    const followers = follows?.map(f => f.follower) || [];

    res.json({
      success: true,
      data: {
        users: followers,
        pagination: {
          page: pageNum,
          limit: limitNum,
          hasMore: followers.length === limitNum
        }
      }
    });
  } catch (error) {
    console.error('获取粉丝列表失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 获取用户统计数据
router.get('/:username/stats', optionalAuth, async (req, res) => {
  try {
    const { username } = req.params;

    // 获取用户ID
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single();

    if (userError || !user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    const userId = user.id;

    // 并行获取各种统计数据
    const [postsResult, eventsResult, followingResult, likesResult] = await Promise.all([
      // 帖子数量
      supabase
        .from('posts')
        .select('id', { count: 'exact' })
        .eq('author_id', userId),
      
      // 活动数量
      supabase
        .from('events')
        .select('id', { count: 'exact' })
        .eq('organizer_id', userId),
      
      // 关注数量
      supabase
        .from('follows')
        .select('id', { count: 'exact' })
        .eq('follower_id', userId),
      
      // 获得的点赞数量
      supabase
        .from('post_likes')
        .select('id', { count: 'exact' })
        .eq('post_id', userId)
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          posts: postsResult.count || 0,
          events: eventsResult.count || 0,
          following: followingResult.count || 0,
          likes: likesResult.count || 0
        }
      }
    });
  } catch (error) {
    console.error('获取用户统计数据失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 获取用户的帖子列表
router.get('/:username/posts', optionalAuth, async (req, res) => {
  try {
    const { username } = req.params;
    const { page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    // 获取用户ID
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single();

    if (userError || !user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 获取用户的帖子
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select(`
        id,
        title,
        content,
        image_url,
        like_count,
        comment_count,
        created_at,
        updated_at,
        author:users!posts_author_id_fkey(
          id,
          username,
          display_name,
          avatar_url,
          is_verified
        )
      `)
      .eq('author_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limitNum - 1);

    if (postsError) {
      console.error('获取用户帖子失败:', postsError);
      return res.status(500).json({
        success: false,
        message: '获取帖子失败'
      });
    }

    res.json({
      success: true,
      data: {
        posts: posts || [],
        pagination: {
          page: pageNum,
          limit: limitNum,
          hasMore: (posts?.length || 0) === limitNum
        }
      }
    });
  } catch (error) {
    console.error('获取用户帖子失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 获取用户的活动列表
router.get('/:username/events', optionalAuth, async (req, res) => {
  try {
    const { username } = req.params;
    const { page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    // 获取用户ID
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single();

    if (userError || !user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 获取用户的活动
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select(`
        id,
        title,
        description,
        image_url,
        start_time,
        end_time,
        location,
        participant_count,
        max_participants,
        status,
        created_at,
        organizer:users!events_organizer_id_fkey(
          id,
          username,
          display_name,
          avatar_url,
          is_verified
        )
      `)
      .eq('organizer_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limitNum - 1);

    if (eventsError) {
      console.error('获取用户活动失败:', eventsError);
      return res.status(500).json({
        success: false,
        message: '获取活动失败'
      });
    }

    res.json({
      success: true,
      data: {
        events: events || [],
        pagination: {
          page: pageNum,
          limit: limitNum,
          hasMore: (events?.length || 0) === limitNum
        }
      }
    });
  } catch (error) {
    console.error('获取用户活动失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 搜索用户
router.get('/search/users', optionalAuth, async (req, res) => {
  try {
    const validation = searchUsersSchema.safeParse(req.query);
    
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: '搜索参数无效'
      });
    }

    const { q: query, limit = 20 } = validation.data;

    // 搜索用户（按用户名和显示名称）
    const { data: users, error } = await supabase
      .from('users')
      .select('id, username, displayName, avatarUrl, bio, isVerified, followerCount')
      .or(`username.ilike.%${query}%,displayName.ilike.%${query}%`)
      .limit(limit);

    if (error) {
      console.error('搜索用户失败:', error);
      return res.status(500).json({
        success: false,
        message: '搜索失败'
      });
    }

    res.json({
      success: true,
      data: {
        users: users || [],
        query
      }
    });
  } catch (error) {
    console.error('搜索用户失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

export default router;