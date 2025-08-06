-- 完全重新设计RLS策略以避免递归
-- 首先删除所有现有的用户表策略
DROP POLICY IF EXISTS "Users can view all profiles" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update all users" ON public.users;
DROP POLICY IF EXISTS "Super admins can delete users" ON public.users;
DROP POLICY IF EXISTS "Admins can update all posts" ON public.posts;
DROP POLICY IF EXISTS "Admins can delete all posts" ON public.posts;
DROP POLICY IF EXISTS "Admins can update all comments" ON public.comments;
DROP POLICY IF EXISTS "Admins can delete all comments" ON public.comments;
DROP POLICY IF EXISTS "Admins can update all events" ON public.events;
DROP POLICY IF EXISTS "Admins can delete all events" ON public.events;

-- 删除可能导致问题的函数
DROP FUNCTION IF EXISTS is_admin(UUID);

-- 创建简化的用户表策略（避免递归查询）
-- 所有人都可以查看用户资料
CREATE POLICY "Public profiles are viewable by everyone" ON public.users
  FOR SELECT USING (true);

-- 用户只能更新自己的资料
CREATE POLICY "Users can update own profile only" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- 用户只能插入自己的资料
CREATE POLICY "Users can insert own profile only" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 创建一个安全的管理员检查视图（不会导致递归）
CREATE OR REPLACE VIEW current_user_role AS
SELECT 
  auth.uid() as user_id,
  COALESCE(u.role, 'user') as role,
  CASE 
    WHEN u.role IN ('admin', 'super_admin') THEN true 
    ELSE false 
  END as is_admin
FROM auth.users au
LEFT JOIN public.users u ON au.id = u.id
WHERE au.id = auth.uid();

-- 授权访问视图
GRANT SELECT ON current_user_role TO authenticated;

-- 为帖子创建管理员策略（使用视图避免递归）
CREATE POLICY "Admins can manage posts" ON public.posts
  FOR ALL USING (
    auth.uid() = user_id OR -- 用户可以管理自己的帖子
    EXISTS (
      SELECT 1 FROM current_user_role 
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- 为评论创建管理员策略
CREATE POLICY "Admins can manage comments" ON public.comments
  FOR ALL USING (
    auth.uid() = user_id OR -- 用户可以管理自己的评论
    EXISTS (
      SELECT 1 FROM current_user_role 
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- 为活动创建管理员策略
CREATE POLICY "Admins can manage events" ON public.events
  FOR ALL USING (
    auth.uid() = organizer_id OR -- 组织者可以管理自己的活动
    EXISTS (
      SELECT 1 FROM current_user_role 
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- 创建一个特殊的管理员用户管理策略
-- 只有超级管理员可以删除用户
CREATE POLICY "Super admin can delete users" ON public.users
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM current_user_role 
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );

-- 管理员可以更新其他用户的某些字段（但不能更新角色）
CREATE POLICY "Admin can update user status" ON public.users
  FOR UPDATE USING (
    auth.uid() = id OR -- 用户可以更新自己
    EXISTS (
      SELECT 1 FROM current_user_role 
      WHERE user_id = auth.uid() AND is_admin = true
    )
  )
  WITH CHECK (
    auth.uid() = id OR -- 用户可以更新自己
    (
      EXISTS (
        SELECT 1 FROM current_user_role 
        WHERE user_id = auth.uid() AND is_admin = true
      )
      AND (
        -- 管理员不能修改其他用户的角色，除非是超级管理员
        role = (SELECT role FROM public.users WHERE id = users.id) OR
        EXISTS (
          SELECT 1 FROM current_user_role 
          WHERE user_id = auth.uid() AND role = 'super_admin'
        )
      )
    )
  );