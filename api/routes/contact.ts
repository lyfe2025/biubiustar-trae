import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';

const router = Router();

// 联系表单验证schema
const contactFormSchema = z.object({
  name: z.string().min(1, '姓名不能为空').max(100, '姓名长度不能超过100个字符'),
  email: z.string().email('请输入有效的邮箱地址').max(255, '邮箱长度不能超过255个字符'),
  company: z.string().max(200, '公司名称长度不能超过200个字符').optional(),
  phone: z.string().max(50, '电话号码长度不能超过50个字符').optional(),
  cooperation_type: z.enum(['technical', 'business', 'investment', 'other'], {
    errorMap: () => ({ message: '请选择有效的合作类型' })
  }),
  description: z.string().min(1, '详细需求描述不能为空').max(2000, '需求描述长度不能超过2000个字符')
});

// 防止垃圾邮件的速率限制
const contactRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 3, // 每15分钟最多3次提交
  message: {
    success: false,
    message: '提交过于频繁，请稍后再试'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 提交联系表单
router.post('/', contactRateLimit, async (req, res) => {
  try {
    // 验证请求数据
    const validation = contactFormSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: '表单数据无效',
        errors: validation.error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message
        }))
      });
    }

    const { name, email, company, phone, cooperation_type, description } = validation.data;

    // 简单的垃圾邮件检测
    const spamKeywords = ['spam', 'test', 'fake', '测试', '垃圾'];
    const contentToCheck = `${name} ${email} ${company || ''} ${description}`.toLowerCase();
    const hasSpamKeywords = spamKeywords.some(keyword => contentToCheck.includes(keyword));
    
    if (hasSpamKeywords) {
      console.warn('检测到可疑的垃圾邮件内容:', { name, email, company });
      // 不直接拒绝，而是标记为需要审核
    }

    // 检查是否存在重复提交（相同邮箱在24小时内的重复提交）
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: existingSubmission } = await supabase
      .from('contact_forms')
      .select('id')
      .eq('email', email)
      .gte('created_at', twentyFourHoursAgo)
      .limit(1);

    if (existingSubmission && existingSubmission.length > 0) {
      return res.status(429).json({
        success: false,
        message: '您在24小时内已提交过联系表单，请耐心等待我们的回复'
      });
    }

    // 插入联系表单数据
    const { data: contactForm, error } = await supabase
      .from('contact_forms')
      .insert({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        company: company?.trim() || null,
        phone: phone?.trim() || null,
        cooperation_type,
        description: description.trim(),
        status: 'pending'
      })
      .select('id, name, email, cooperation_type, created_at')
      .single();

    if (error) {
      console.error('保存联系表单失败:', error);
      return res.status(500).json({
        success: false,
        message: '提交失败，请稍后重试'
      });
    }

    // 记录成功提交的日志
    console.log('联系表单提交成功:', {
      id: contactForm.id,
      name: contactForm.name,
      email: contactForm.email,
      cooperation_type: contactForm.cooperation_type,
      created_at: contactForm.created_at
    });

    res.status(201).json({
      success: true,
      message: '联系表单提交成功！我们会尽快与您联系。',
      data: {
        id: contactForm.id,
        submitted_at: contactForm.created_at
      }
    });
  } catch (error) {
    console.error('联系表单提交失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，请稍后重试'
    });
  }
});

// 获取联系表单统计信息（仅供管理员使用）
router.get('/stats', async (req, res) => {
  try {
    // 这里可以添加管理员权限验证
    // 暂时返回基本统计信息
    const { data: stats, error } = await supabase
      .from('contact_forms')
      .select('status, cooperation_type, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('获取联系表单统计失败:', error);
      return res.status(500).json({
        success: false,
        message: '获取统计信息失败'
      });
    }

    // 统计各种状态的数量
    const statusCounts = stats?.reduce((acc, form) => {
      acc[form.status] = (acc[form.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    // 统计各种合作类型的数量
    const typeCounts = stats?.reduce((acc, form) => {
      acc[form.cooperation_type] = (acc[form.cooperation_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    res.json({
      success: true,
      data: {
        total: stats?.length || 0,
        statusCounts,
        typeCounts,
        recent: stats?.slice(0, 5) || []
      }
    });
  } catch (error) {
    console.error('获取联系表单统计失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

export default router;