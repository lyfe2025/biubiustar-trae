import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';
import { z } from 'zod';

const router = Router();

// 验证schema
const createPostSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).max(2000),
  category: z.string().max(50).optional(),
  tags: z.array(z.string().max(30)).max(10).optional(),
  imageUrls: z.array(z.string().url()).max(4).optional(),
  location: z.string().max(100).optional(),
  status: z.enum(['draft', 'published']).default('published')
});

const getPostsSchema = z.object({
  page: z.string().transform(val => parseInt(val)).pipe(z.number().min(1)).optional(),
  limit: z.string().transform(val => parseInt(val)).pipe(z.number().min(1).max(50)).optional(),
  type: z.enum(['timeline', 'user', 'following']).optional()
});

const createCommentSchema = z.object({
  content: z.string().min(1).max(1000)
});

// 发布帖子
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const validation = createPostSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: '帖子内容无效',
        errors: validation.error.issues
      });
    }

    const { title, content, category, tags, imageUrls, location, status } = validation.data;

    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        user_id: userId,
        title,
        content,
        category,
        tags: tags || [],
        image_urls: imageUrls || [],
        location,
        status
      })
      .select(`
        *,
        author:users!posts_user_id_fkey(
          id,
          username,
          display_name,
          avatar_url,
          is_verified
        )
      `)
      .single();

    if (error) {
      console.error('发布帖子失败:', error);
      return res.status(500).json({
        success: false,
        message: '发布失败'
      });
    }

    res.status(201).json({
      success: true,
      message: '帖子发布成功',
      data: { post }
    });
  } catch (error) {
    console.error('发布帖子失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 获取帖子列表
router.get('/', optionalAuth, async (req, res) => {
  try {
    const currentUserId = req.user?.id;
    const validation = getPostsSchema.safeParse(req.query);
    
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: '查询参数无效'
      });
    }

    const { page = 1, limit = 20, type = 'timeline' } = validation.data;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('posts')
      .select(`
        *,
        author:users!posts_user_id_fkey(
          id,
          username,
          display_name,
          avatar_url,
          is_verified
        )
      `);

    // 根据类型过滤
    if (type === 'following' && currentUserId) {
      // 获取关注用户的帖子
      const { data: followingIds } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', currentUserId);
      
      const followingUserIds = followingIds?.map(f => f.following_id) || [];
      followingUserIds.push(currentUserId); // 包含自己的帖子
      
      query = query.in('user_id', followingUserIds);
    }

    // 暂时显示所有帖子，后续可添加visibility字段

    const { data: posts, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('获取帖子列表失败:', error);
      return res.status(500).json({
        success: false,
        message: '获取帖子失败'
      });
    }

    // 获取点赞和评论统计数据
    let postsWithStats = posts || [];
    if (posts && posts.length > 0) {
      const postIds = posts.map(p => p.id);
      
      // 获取点赞数量
      const { data: likeCounts } = await supabase
        .from('likes')
        .select('post_id')
        .in('post_id', postIds);
      
      // 获取评论数量
      const { data: commentCounts } = await supabase
        .from('comments')
        .select('post_id')
        .in('post_id', postIds);
      
      // 统计每个帖子的点赞和评论数量
      const likeCountMap = new Map();
      const commentCountMap = new Map();
      
      likeCounts?.forEach(like => {
        likeCountMap.set(like.post_id, (likeCountMap.get(like.post_id) || 0) + 1);
      });
      
      commentCounts?.forEach(comment => {
        commentCountMap.set(comment.post_id, (commentCountMap.get(comment.post_id) || 0) + 1);
      });
      
      // 如果用户已登录，检查点赞状态
      let userLikedPostIds = new Set();
      if (currentUserId) {
        const { data: userLikes } = await supabase
          .from('likes')
          .select('post_id')
          .eq('user_id', currentUserId)
          .in('post_id', postIds);
        
        userLikedPostIds = new Set(userLikes?.map(l => l.post_id) || []);
      }
      
      postsWithStats = posts.map(post => ({
        ...post,
        isLiked: userLikedPostIds.has(post.id),
        likeCount: likeCountMap.get(post.id) || 0,
        commentCount: commentCountMap.get(post.id) || 0
      }));
    }

    res.json({
      success: true,
      data: {
        posts: postsWithStats,
        pagination: {
          page,
          limit,
          hasMore: postsWithStats.length === limit
        }
      }
    });
  } catch (error) {
    console.error('获取帖子列表失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 获取单个帖子详情
router.get('/:postId', optionalAuth, async (req, res) => {
  try {
    const { postId } = req.params;
    const currentUserId = req.user?.id;

    const { data: post, error } = await supabase
      .from('posts')
      .select(`
        *,
        author:users!posts_user_id_fkey(
          id,
          username,
          display_name,
          avatar_url,
          is_verified
        )
      `)
      .eq('id', postId)
      .single();

    if (error || !post) {
      return res.status(404).json({
        success: false,
        message: '帖子不存在'
      });
    }

    // 暂时移除访问权限检查，后续可添加visibility字段

    // 获取点赞和评论数量
    const { data: likesCount } = await supabase
      .from('likes')
      .select('id', { count: 'exact' })
      .eq('post_id', postId);
    
    const { data: commentsCount } = await supabase
      .from('comments')
      .select('id', { count: 'exact' })
      .eq('post_id', postId);

    // 检查当前用户是否点赞了
    let isLiked = false;
    if (currentUserId) {
      const { data: userLike } = await supabase
        .from('likes')
        .select('id')
        .eq('user_id', currentUserId)
        .eq('post_id', postId)
        .single();
      
      isLiked = !!userLike;
    }

    res.json({
      success: true,
      data: {
        post: {
          ...post,
          isLiked,
          likeCount: likesCount?.length || 0,
          commentCount: commentsCount?.length || 0
        }
      }
    });
  } catch (error) {
    console.error('获取帖子详情失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 获取用户的帖子
router.get('/user/:username', optionalAuth, async (req, res) => {
  try {
    const { username } = req.params;
    const currentUserId = req.user?.id;
    const { page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    // 获取用户信息
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

    let query = supabase
      .from('posts')
      .select(`
        *,
        author:users!posts_user_id_fkey(
          id,
          username,
          display_name,
          avatar_url,
          is_verified
        )
      `)
      .eq('user_id', user.id);

    // 暂时显示所有帖子，后续可添加visibility字段过滤

    const { data: posts, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limitNum - 1);

    if (error) {
      console.error('获取用户帖子失败:', error);
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

// 点赞帖子
router.post('/:postId/like', authenticateToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    // 检查帖子是否存在
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('id, user_id')
      .eq('id', postId)
      .single();

    if (postError || !post) {
      return res.status(404).json({
        success: false,
        message: '帖子不存在'
      });
    }

    // 检查是否已经点赞
    const { data: existingLike } = await supabase
      .from('likes')
      .select('id')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .single();

    if (existingLike) {
      return res.status(400).json({
        success: false,
        message: '已经点赞过了'
      });
    }

    // 创建点赞记录
    const { error: likeError } = await supabase
      .from('likes')
      .insert({
        user_id: userId,
        post_id: postId
      });

    if (likeError) {
      console.error('点赞失败:', likeError);
      return res.status(500).json({
        success: false,
        message: '点赞失败'
      });
    }

    res.json({
      success: true,
      message: '点赞成功'
    });
  } catch (error) {
    console.error('点赞失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 取消点赞
router.delete('/:postId/like', authenticateToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    // 删除点赞记录
    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('user_id', userId)
      .eq('post_id', postId);

    if (error) {
      console.error('取消点赞失败:', error);
      return res.status(500).json({
        success: false,
        message: '取消点赞失败'
      });
    }

    res.json({
      success: true,
      message: '取消点赞成功'
    });
  } catch (error) {
    console.error('取消点赞失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 获取帖子的评论
router.get('/:postId/comments', optionalAuth, async (req, res) => {
  try {
    const { postId } = req.params;
    const { page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    const { data: comments, error } = await supabase
      .from('comments')
      .select(`
        *,
        author:users!comments_user_id_fkey(
          id,
          username,
          display_name,
          avatar_url,
          is_verified
        )
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true })
      .range(offset, offset + limitNum - 1);

    if (error) {
      console.error('获取评论失败:', error);
      return res.status(500).json({
        success: false,
        message: '获取评论失败'
      });
    }

    res.json({
      success: true,
      data: {
        comments: comments || [],
        pagination: {
          page: pageNum,
          limit: limitNum,
          hasMore: (comments?.length || 0) === limitNum
        }
      }
    });
  } catch (error) {
    console.error('获取评论失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 添加评论
router.post('/:postId/comments', authenticateToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;
    const validation = createCommentSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: '评论内容无效',
        errors: validation.error.issues
      });
    }

    const { content } = validation.data;

    // 检查帖子是否存在
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('id')
      .eq('id', postId)
      .single();

    if (postError || !post) {
      return res.status(404).json({
        success: false,
        message: '帖子不存在'
      });
    }

    // 创建评论
    const { data: comment, error } = await supabase
      .from('comments')
      .insert({
        user_id: userId,
        post_id: postId,
        content
      })
      .select(`
        *,
        author:users!comments_user_id_fkey(
          id,
          username,
          display_name,
          avatar_url,
          is_verified
        )
      `)
      .single();

    if (error) {
      console.error('添加评论失败:', error);
      return res.status(500).json({
        success: false,
        message: '评论失败'
      });
    }

    res.status(201).json({
      success: true,
      message: '评论成功',
      data: { comment }
    });
  } catch (error) {
    console.error('添加评论失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 删除帖子
router.delete('/:postId', authenticateToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    // 检查帖子是否存在且属于当前用户
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('id, user_id')
      .eq('id', postId)
      .eq('user_id', userId)
      .single();

    if (postError || !post) {
      return res.status(404).json({
        success: false,
        message: '帖子不存在或无权删除'
      });
    }

    // 删除帖子（级联删除相关的点赞和评论）
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);

    if (error) {
      console.error('删除帖子失败:', error);
      return res.status(500).json({
        success: false,
        message: '删除失败'
      });
    }

    res.json({
      success: true,
      message: '帖子删除成功'
    });
  } catch (error) {
    console.error('删除帖子失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

export default router;