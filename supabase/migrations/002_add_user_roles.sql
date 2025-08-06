-- 为用户表添加角色字段
ALTER TABLE public.users 
ADD COLUMN role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin'));

-- 创建角色索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- 更新现有用户的默认角色
UPDATE public.users SET role = 'user' WHERE role IS NULL;

-- 创建管理员权限策略
-- 管理员可以查看和管理所有用户
CREATE POLICY "Admins can manage all users" ON public.users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- 管理员可以查看和管理所有帖子
CREATE POLICY "Admins can manage all posts" ON public.posts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- 管理员可以查看和管理所有评论
CREATE POLICY "Admins can manage all comments" ON public.comments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- 管理员可以查看和管理所有活动
CREATE POLICY "Admins can manage all events" ON public.events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- 创建管理员统计视图
CREATE OR REPLACE VIEW admin_stats AS
SELECT 
  (SELECT COUNT(*) FROM public.users) as total_users,
  (SELECT COUNT(*) FROM public.users WHERE role = 'admin') as admin_users,
  (SELECT COUNT(*) FROM public.posts) as total_posts,
  (SELECT COUNT(*) FROM public.comments) as total_comments,
  (SELECT COUNT(*) FROM public.events) as total_events,
  (SELECT COUNT(*) FROM public.likes) as total_likes,
  (SELECT COUNT(*) FROM public.follows) as total_follows;

-- 授权管理员访问统计视图
GRANT SELECT ON admin_stats TO authenticated;