import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';
import { z } from 'zod';

const router = Router();

// 验证schema
const createEventSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  location: z.string().max(200).optional(),
  maxParticipants: z.number().int().min(1).optional(),
  imageUrl: z.string().url().optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
  isPublic: z.boolean().default(true)
}).refine(data => new Date(data.endTime) > new Date(data.startTime), {
  message: "结束时间必须晚于开始时间",
  path: ["endTime"]
});

const updateEventSchema = createEventSchema.partial();

const getEventsSchema = z.object({
  page: z.string().transform(val => parseInt(val)).pipe(z.number().min(1)).optional(),
  limit: z.string().transform(val => parseInt(val)).pipe(z.number().min(1).max(50)).optional(),
  status: z.enum(['upcoming', 'ongoing', 'past', 'all']).optional(),
  location: z.string().optional(),
  tags: z.string().optional() // 逗号分隔的标签
});

// 创建活动
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const validation = createEventSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: '活动信息无效',
        errors: validation.error.issues
      });
    }

    const eventData = validation.data;

    const { data: event, error } = await supabase
      .from('events')
      .insert({
        organizer_id: userId,
        title: eventData.title,
        description: eventData.description,
        start_date: eventData.startTime,
        end_date: eventData.endTime,
        location: eventData.location,
        max_participants: eventData.maxParticipants,
        image_url: eventData.imageUrl,
        tags: eventData.tags || []
        // 暂时移除 is_public 字段，后续可根据需要添加
      })
      .select(`
        *,
        organizer:users!events_organizer_id_fkey(
          id,
          username,
          display_name,
          avatar_url,
          is_verified
        )
      `)
      .single();

    if (error) {
      console.error('创建活动失败:', error);
      return res.status(500).json({
        success: false,
        message: '创建活动失败'
      });
    }

    res.status(201).json({
      success: true,
      message: '活动创建成功',
      data: { event }
    });
  } catch (error) {
    console.error('创建活动失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 获取活动列表
router.get('/', optionalAuth, async (req, res) => {
  try {
    const currentUserId = req.user?.id;
    const validation = getEventsSchema.safeParse(req.query);
    
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: '查询参数无效'
      });
    }

    const { page = 1, limit = 20, status = 'upcoming', location, tags } = validation.data;
    const offset = (page - 1) * limit;
    const now = new Date().toISOString();

    let query = supabase
      .from('events')
      .select(`
        *,
        organizer:users!events_organizer_id_fkey(
          id,
          username,
          display_name,
          avatar_url,
          is_verified
        )
      `);

    // 暂时显示所有活动（后续可根据需要添加权限控制）
    // 如果需要权限控制，可以在这里添加相关逻辑

    // 根据状态过滤
    switch (status) {
      case 'upcoming':
        query = query.gt('start_date', now);
        break;
      case 'ongoing':
        query = query.lte('start_date', now).gt('end_date', now);
        break;
      case 'past':
        query = query.lt('end_date', now);
        break;
      case 'all':
        // 不添加时间过滤
        break;
    }

    // 位置过滤
    if (location) {
      query = query.ilike('location', `%${location}%`);
    }

    // 标签过滤
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      query = query.overlaps('tags', tagArray);
    }

    const { data: events, error } = await query
      .order('start_date', { ascending: status === 'past' ? false : true })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('获取活动列表失败:', error);
      return res.status(500).json({
        success: false,
        message: '获取活动失败'
      });
    }

    // 如果用户已登录，检查参与状态和获取参与者数量
    let eventsWithParticipationStatus = events || [];
    if (events && events.length > 0) {
      const eventIds = events.map(e => e.id);
      
      // 获取参与者数量
      const { data: participantCounts } = await supabase
        .from('event_participants')
        .select('event_id')
        .in('event_id', eventIds);
      
      const participantCountMap = new Map();
      participantCounts?.forEach(p => {
        participantCountMap.set(p.event_id, (participantCountMap.get(p.event_id) || 0) + 1);
      });
      
      let participatedEventIds = new Set();
      if (currentUserId) {
        const { data: userParticipations } = await supabase
          .from('event_participants')
          .select('event_id')
          .eq('user_id', currentUserId)
          .in('event_id', eventIds);
        
        participatedEventIds = new Set(userParticipations?.map(p => p.event_id) || []);
      }
      
      eventsWithParticipationStatus = events.map(event => ({
        ...event,
        isParticipating: participatedEventIds.has(event.id),
        participantCount: participantCountMap.get(event.id) || 0
      }));
    }

    res.json({
      success: true,
      data: {
        events: eventsWithParticipationStatus,
        pagination: {
          page,
          limit,
          hasMore: eventsWithParticipationStatus.length === limit
        }
      }
    });
  } catch (error) {
    console.error('获取活动列表失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 获取单个活动详情
router.get('/:eventId', optionalAuth, async (req, res) => {
  try {
    const { eventId } = req.params;
    const currentUserId = req.user?.id;

    const { data: event, error } = await supabase
      .from('events')
      .select(`
        *,
        organizer:users!events_organizer_id_fkey(
          id,
          username,
          display_name,
          avatar_url,
          is_verified
        )
      `)
      .eq('id', eventId)
      .single();

    if (error || !event) {
      return res.status(404).json({
        success: false,
        message: '活动不存在'
      });
    }

    // 暂时移除权限检查，后续可根据需要添加
    // 如果需要权限控制，可以在这里添加相关逻辑

    // 获取参与者数量
    const { data: participantsCount } = await supabase
      .from('event_participants')
      .select('id', { count: 'exact' })
      .eq('event_id', eventId);

    // 检查当前用户是否参与了活动
    let isParticipating = false;
    if (currentUserId) {
      const { data: participation } = await supabase
        .from('event_participants')
        .select('id')
        .eq('user_id', currentUserId)
        .eq('event_id', eventId)
        .single();
      
      isParticipating = !!participation;
    }

    res.json({
      success: true,
      data: {
        event: {
          ...event,
          isParticipating,
          participantCount: participantsCount?.length || 0
        }
      }
    });
  } catch (error) {
    console.error('获取活动详情失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 更新活动
router.put('/:eventId', authenticateToken, async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;
    const validation = updateEventSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: '活动信息无效',
        errors: validation.error.issues
      });
    }

    // 检查活动是否存在且属于当前用户
    const { data: existingEvent, error: checkError } = await supabase
      .from('events')
      .select('id, organizer_id')
      .eq('id', eventId)
      .eq('organizer_id', userId)
      .single();

    if (checkError || !existingEvent) {
      return res.status(404).json({
        success: false,
        message: '活动不存在或无权修改'
      });
    }

    const updateData = validation.data;
    const dbUpdateData: any = {};

    // 转换字段名
    if (updateData.title !== undefined) dbUpdateData.title = updateData.title;
    if (updateData.description !== undefined) dbUpdateData.description = updateData.description;
    if (updateData.startTime !== undefined) dbUpdateData.start_date = updateData.startTime;
    if (updateData.endTime !== undefined) dbUpdateData.end_date = updateData.endTime;
    if (updateData.location !== undefined) dbUpdateData.location = updateData.location;
    if (updateData.maxParticipants !== undefined) dbUpdateData.max_participants = updateData.maxParticipants;
    if (updateData.imageUrl !== undefined) dbUpdateData.image_url = updateData.imageUrl;
    if (updateData.tags !== undefined) dbUpdateData.tags = updateData.tags;
    // 暂时移除 is_public 字段更新，后续可根据需要添加
    // if (updateData.isPublic !== undefined) dbUpdateData.is_public = updateData.isPublic;

    const { data: event, error } = await supabase
      .from('events')
      .update(dbUpdateData)
      .eq('id', eventId)
      .select(`
        *,
        organizer:users!events_organizer_id_fkey(
          id,
          username,
          display_name,
          avatar_url,
          is_verified
        )
      `)
      .single();

    if (error) {
      console.error('更新活动失败:', error);
      return res.status(500).json({
        success: false,
        message: '更新失败'
      });
    }

    res.json({
      success: true,
      message: '活动更新成功',
      data: { event }
    });
  } catch (error) {
    console.error('更新活动失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 参与活动
router.post('/:eventId/join', authenticateToken, async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    // 检查活动是否存在
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, max_participants, start_date, end_date')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return res.status(404).json({
        success: false,
        message: '活动不存在'
      });
    }

    // 检查活动是否已经开始
    const now = new Date();
    const startTime = new Date(event.start_date);
    if (startTime <= now) {
      return res.status(400).json({
        success: false,
        message: '活动已经开始，无法参与'
      });
    }

    // 检查是否已经参与
    const { data: existingParticipation } = await supabase
      .from('event_participants')
      .select('id')
      .eq('user_id', userId)
      .eq('event_id', eventId)
      .single();

    if (existingParticipation) {
      return res.status(400).json({
        success: false,
        message: '已经参与了该活动'
      });
    }

    // 检查人数限制
    if (event.max_participants) {
      const { data: participantsCount } = await supabase
        .from('event_participants')
        .select('id', { count: 'exact' })
        .eq('event_id', eventId);
      
      if ((participantsCount?.length || 0) >= event.max_participants) {
        return res.status(400).json({
          success: false,
          message: '活动人数已满'
        });
      }
    }

    // 创建参与记录
    const { error: joinError } = await supabase
      .from('event_participants')
      .insert({
        user_id: userId,
        event_id: eventId
      });

    if (joinError) {
      console.error('参与活动失败:', joinError);
      return res.status(500).json({
        success: false,
        message: '参与失败'
      });
    }

    res.json({
      success: true,
      message: '参与活动成功'
    });
  } catch (error) {
    console.error('参与活动失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 退出活动
router.delete('/:eventId/join', authenticateToken, async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    // 检查活动是否存在
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, start_date')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return res.status(404).json({
        success: false,
        message: '活动不存在'
      });
    }

    // 检查活动是否已经开始
    const now = new Date();
    const startTime = new Date(event.start_date);
    if (startTime <= now) {
      return res.status(400).json({
        success: false,
        message: '活动已经开始，无法退出'
      });
    }

    // 删除参与记录
    const { error } = await supabase
      .from('event_participants')
      .delete()
      .eq('user_id', userId)
      .eq('event_id', eventId);

    if (error) {
      console.error('退出活动失败:', error);
      return res.status(500).json({
        success: false,
        message: '退出失败'
      });
    }

    res.json({
      success: true,
      message: '退出活动成功'
    });
  } catch (error) {
    console.error('退出活动失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 获取活动参与者列表
router.get('/:eventId/participants', optionalAuth, async (req, res) => {
  try {
    const { eventId } = req.params;
    const { page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    // 检查活动是否存在
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return res.status(404).json({
        success: false,
        message: '活动不存在'
      });
    }

    // 获取参与者列表
    const { data: participants, error } = await supabase
      .from('event_participants')
      .select(`
        joined_at,
        participant:users!event_participants_user_id_fkey(
          id,
          username,
          display_name,
          avatar_url,
          is_verified
        )
      `)
      .eq('event_id', eventId)
      .order('joined_at', { ascending: true })
      .range(offset, offset + limitNum - 1);

    if (error) {
      console.error('获取参与者列表失败:', error);
      return res.status(500).json({
        success: false,
        message: '获取参与者失败'
      });
    }

    const participantUsers = participants?.map(p => ({
      ...p.participant,
      joinedAt: p.joined_at
    })) || [];

    res.json({
      success: true,
      data: {
        participants: participantUsers,
        pagination: {
          page: pageNum,
          limit: limitNum,
          hasMore: participantUsers.length === limitNum
        }
      }
    });
  } catch (error) {
    console.error('获取参与者列表失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 删除活动
router.delete('/:eventId', authenticateToken, async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    // 检查活动是否存在且属于当前用户
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, organizer_id')
      .eq('id', eventId)
      .eq('organizer_id', userId)
      .single();

    if (eventError || !event) {
      return res.status(404).json({
        success: false,
        message: '活动不存在或无权删除'
      });
    }

    // 删除活动（级联删除参与记录）
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);

    if (error) {
      console.error('删除活动失败:', error);
      return res.status(500).json({
        success: false,
        message: '删除失败'
      });
    }

    res.json({
      success: true,
      message: '活动删除成功'
    });
  } catch (error) {
    console.error('删除活动失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 获取用户创建的活动
router.get('/user/:username/created', optionalAuth, async (req, res) => {
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
      .from('events')
      .select(`
        *,
        organizer:users!events_organizer_id_fkey(
          id,
          username,
          display_name,
          avatar_url,
          is_verified
        )
      `)
      .eq('organizer_id', user.id);

    // 暂时显示所有活动，后续可根据需要添加权限控制
    // if (currentUserId !== user.id) {
    //   query = query.eq('is_public', true);
    // }

    const { data: events, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limitNum - 1);

    if (error) {
      console.error('获取用户活动失败:', error);
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

// 获取用户参与的活动
router.get('/user/:username/joined', optionalAuth, async (req, res) => {
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

    // 只有本人可以查看参与的活动
    if (currentUserId !== user.id) {
      return res.status(403).json({
        success: false,
        message: '无权查看他人参与的活动'
      });
    }

    const { data: participations, error } = await supabase
      .from('event_participants')
      .select(`
        joined_at,
        event:events!event_participants_event_id_fkey(
          *,
          organizer:users!events_organizer_id_fkey(
            id,
            username,
            display_name,
            avatar_url,
            is_verified
          )
        )
      `)
      .eq('user_id', user.id)
      .order('joined_at', { ascending: false })
      .range(offset, offset + limitNum - 1);

    if (error) {
      console.error('获取参与活动失败:', error);
      return res.status(500).json({
        success: false,
        message: '获取参与活动失败'
      });
    }

    const events = participations?.map(p => ({
      ...p.event,
      joinedAt: p.joined_at
    })) || [];

    res.json({
      success: true,
      data: {
        events,
        pagination: {
          page: pageNum,
          limit: limitNum,
          hasMore: events.length === limitNum
        }
      }
    });
  } catch (error) {
    console.error('获取参与活动失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

export default router;