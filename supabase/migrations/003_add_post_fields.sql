-- 为posts表添加新字段以支持更丰富的帖子内容
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS title VARCHAR(200),
ADD COLUMN IF NOT EXISTS category VARCHAR(50),
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS image_urls TEXT[],
ADD COLUMN IF NOT EXISTS location VARCHAR(100),
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived'));

-- 更新现有的images字段为image_urls（如果需要的话）
-- 注意：这里我们保留原有的images字段，新增image_urls字段以保持兼容性

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_posts_category ON public.posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_status ON public.posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_tags ON public.posts USING GIN(tags);

-- 更新RLS策略以包含草稿状态的帖子
-- 草稿只有作者可以看到
DROP POLICY IF EXISTS "Posts are viewable by everyone" ON public.posts;

CREATE POLICY "Published posts are viewable by everyone" ON public.posts
  FOR SELECT USING (status = 'published' OR auth.uid() = user_id);

CREATE POLICY "Users can view own drafts" ON public.posts
  FOR SELECT USING (auth.uid() = user_id);