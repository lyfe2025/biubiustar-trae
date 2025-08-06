-- 修复RLS策略递归问题
-- 删除有问题的管理员策略
DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;
DROP POLICY IF EXISTS "Admins can manage all posts" ON public.posts;
DROP POLICY IF EXISTS "Admins can manage all comments" ON public.comments;
DROP POLICY IF EXISTS "Admins can manage all events" ON public.events;

-- 为管理员创建独立的策略，避免递归查询
-- 管理员可以查看所有用户（基于当前用户的角色）
CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (
    true OR -- 所有人都可以查看用户资料
    (
      auth.uid() IS NOT NULL AND
      EXISTS (
        SELECT 1 FROM auth.users au
        JOIN public.users u ON au.id = u.id
        WHERE au.id = auth.uid() AND u.role IN ('admin', 'super_admin')
      )
    )
  );

-- 管理员可以更新所有用户信息
CREATE POLICY "Admins can update all users" ON public.users
  FOR UPDATE USING (
    auth.uid() = id OR -- 用户可以更新自己的信息
    (
      auth.uid() IS NOT NULL AND
      EXISTS (
        SELECT 1 FROM auth.users au
        JOIN public.users u ON au.id = u.id
        WHERE au.id = auth.uid() AND u.role IN ('admin', 'super_admin')
      )
    )
  );

-- 管理员可以删除用户（仅超级管理员）
CREATE POLICY "Super admins can delete users" ON public.users
  FOR DELETE USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM auth.users au
      JOIN public.users u ON au.id = u.id
      WHERE au.id = auth.uid() AND u.role = 'super_admin'
    )
  );

-- 管理员可以管理所有帖子
CREATE POLICY "Admins can update all posts" ON public.posts
  FOR UPDATE USING (
    auth.uid() = user_id OR -- 用户可以更新自己的帖子
    (
      auth.uid() IS NOT NULL AND
      EXISTS (
        SELECT 1 FROM auth.users au
        JOIN public.users u ON au.id = u.id
        WHERE au.id = auth.uid() AND u.role IN ('admin', 'super_admin')
      )
    )
  );

CREATE POLICY "Admins can delete all posts" ON public.posts
  FOR DELETE USING (
    auth.uid() = user_id OR -- 用户可以删除自己的帖子
    (
      auth.uid() IS NOT NULL AND
      EXISTS (
        SELECT 1 FROM auth.users au
        JOIN public.users u ON au.id = u.id
        WHERE au.id = auth.uid() AND u.role IN ('admin', 'super_admin')
      )
    )
  );

-- 管理员可以管理所有评论
CREATE POLICY "Admins can update all comments" ON public.comments
  FOR UPDATE USING (
    auth.uid() = user_id OR -- 用户可以更新自己的评论
    (
      auth.uid() IS NOT NULL AND
      EXISTS (
        SELECT 1 FROM auth.users au
        JOIN public.users u ON au.id = u.id
        WHERE au.id = auth.uid() AND u.role IN ('admin', 'super_admin')
      )
    )
  );

CREATE POLICY "Admins can delete all comments" ON public.comments
  FOR DELETE USING (
    auth.uid() = user_id OR -- 用户可以删除自己的评论
    (
      auth.uid() IS NOT NULL AND
      EXISTS (
        SELECT 1 FROM auth.users au
        JOIN public.users u ON au.id = u.id
        WHERE au.id = auth.uid() AND u.role IN ('admin', 'super_admin')
      )
    )
  );

-- 管理员可以管理所有活动
CREATE POLICY "Admins can update all events" ON public.events
  FOR UPDATE USING (
    auth.uid() = organizer_id OR -- 组织者可以更新自己的活动
    (
      auth.uid() IS NOT NULL AND
      EXISTS (
        SELECT 1 FROM auth.users au
        JOIN public.users u ON au.id = u.id
        WHERE au.id = auth.uid() AND u.role IN ('admin', 'super_admin')
      )
    )
  );

CREATE POLICY "Admins can delete all events" ON public.events
  FOR DELETE USING (
    auth.uid() = organizer_id OR -- 组织者可以删除自己的活动
    (
      auth.uid() IS NOT NULL AND
      EXISTS (
        SELECT 1 FROM auth.users au
        JOIN public.users u ON au.id = u.id
        WHERE au.id = auth.uid() AND u.role IN ('admin', 'super_admin')
      )
    )
  );

-- 创建一个安全的管理员检查函数
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = user_id AND role IN ('admin', 'super_admin')
  );
END;
$$;

-- 授权函数给authenticated角色
GRANT EXECUTE ON FUNCTION is_admin(UUID) TO authenticated;