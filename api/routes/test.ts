import { Router } from 'express';
import { supabase } from '../config/database.js';

const router = Router();

// 测试Supabase连接
router.get('/supabase', async (req, res) => {
  try {
    // 测试数据库连接
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (error) {
      console.error('Supabase连接测试失败:', error);
      return res.status(500).json({
        success: false,
        message: 'Supabase连接失败',
        error: error.message
      });
    }

    res.json({
      success: true,
      message: 'Supabase连接正常',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Supabase连接测试异常:', error);
    res.status(500).json({
      success: false,
      message: '连接测试异常',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
});

// 测试环境变量
router.get('/env', (req, res) => {
  res.json({
    supabaseUrl: process.env.SUPABASE_URL ? '已配置' : '未配置',
    supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? '已配置' : '未配置',
    nodeEnv: process.env.NODE_ENV,
    port: process.env.PORT
  });
});

export default router;