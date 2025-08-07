-- 更新posts表的RLS策略以支持审核流程（修正版）

-- 删除现有的RLS策略
DROP POLICY IF EXISTS "Users can view published posts" ON posts;
DROP POLICY IF EXISTS "Users can view own posts" ON posts;
DROP POLICY IF EXISTS "Users can insert own posts" ON posts;
DROP POLICY IF EXISTS "Users can update own posts" ON posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON posts;
DROP POLICY IF EXISTS "Admins can view all posts" ON posts;
DROP POLICY IF EXISTS "Admins can update all posts" ON posts;
DROP POLICY IF EXISTS "Admins can delete all posts" ON posts;

-- 创建新的RLS策略

-- 1. 普通用户可以查看已发布的帖子
CREATE POLICY "Users can view published posts" ON posts
  FOR SELECT
  USING (status = 'published');

-- 2. 用户可以查看自己的所有帖子（包括待审核、草稿等）
CREATE POLICY "Users can view own posts" ON posts
  FOR SELECT
  USING (auth.uid() = user_id);

-- 3. 管理员可以查看所有帖子
CREATE POLICY "Admins can view all posts" ON posts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'super_admin')
    )
  );

-- 4. 用户可以插入自己的帖子（默认状态为pending）
CREATE POLICY "Users can insert own posts" ON posts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 5. 用户可以更新自己的帖子（简化版，不检查审核字段）
CREATE POLICY "Users can update own posts" ON posts
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 6. 用户可以删除自己的帖子（仅限草稿和被拒绝的帖子）
CREATE POLICY "Users can delete own posts" ON posts
  FOR DELETE
  USING (
    auth.uid() = user_id AND
    status IN ('draft', 'rejected')
  );

-- 7. 管理员可以更新所有帖子（包括审核状态）
CREATE POLICY "Admins can update all posts" ON posts
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'super_admin')
    )
  );

-- 8. 管理员可以删除所有帖子
CREATE POLICY "Admins can delete all posts" ON posts
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'super_admin')
    )
  );

-- 为审核历史表设置RLS策略
ALTER TABLE post_moderation_history ENABLE ROW LEVEL SECURITY;

-- 管理员可以查看所有审核历史
CREATE POLICY "Admins can view moderation history" ON post_moderation_history
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'super_admin')
    )
  );

-- 管理员可以插入审核历史记录
CREATE POLICY "Admins can insert moderation history" ON post_moderation_history
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'super_admin')
    ) AND
    auth.uid() = moderator_id
  );

-- 用户可以查看自己帖子的审核历史
CREATE POLICY "Users can view own post moderation history" ON post_moderation_history
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM posts 
      WHERE posts.id = post_moderation_history.post_id 
      AND posts.user_id = auth.uid()
    )
  );

-- 授权给anon和authenticated角色
GRANT SELECT ON post_moderation_history TO anon, authenticated;
GRANT INSERT ON post_moderation_history TO authenticated;