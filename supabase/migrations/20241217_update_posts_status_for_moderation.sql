-- 更新posts表的status字段以支持审核流程
-- 添加pending和rejected状态，修改默认值为pending

-- 首先删除现有的check约束
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_status_check;

-- 添加新的check约束，包含审核状态
ALTER TABLE posts ADD CONSTRAINT posts_status_check 
  CHECK (status IN ('draft', 'pending', 'published', 'rejected', 'archived'));

-- 修改默认值为pending（待审核）
ALTER TABLE posts ALTER COLUMN status SET DEFAULT 'pending';

-- 添加审核相关字段
ALTER TABLE posts ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES users(id);
ALTER TABLE posts ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- 创建审核历史表
CREATE TABLE IF NOT EXISTS post_moderation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  moderator_id UUID NOT NULL REFERENCES users(id),
  action VARCHAR(20) NOT NULL CHECK (action IN ('approve', 'reject', 'pending')),
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 为审核历史表创建索引
CREATE INDEX IF NOT EXISTS idx_post_moderation_history_post_id ON post_moderation_history(post_id);
CREATE INDEX IF NOT EXISTS idx_post_moderation_history_moderator_id ON post_moderation_history(moderator_id);
CREATE INDEX IF NOT EXISTS idx_post_moderation_history_created_at ON post_moderation_history(created_at);

-- 为posts表的审核相关字段创建索引
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_reviewed_at ON posts(reviewed_at);
CREATE INDEX IF NOT EXISTS idx_posts_reviewed_by ON posts(reviewed_by);

-- 更新现有published状态的帖子，保持其状态不变
-- 新发布的帖子将默认为pending状态

COMMENT ON COLUMN posts.status IS '帖子状态：draft(草稿), pending(待审核), published(已发布), rejected(已拒绝), archived(已归档)';
COMMENT ON COLUMN posts.reviewed_at IS '审核时间';
COMMENT ON COLUMN posts.reviewed_by IS '审核人员ID';
COMMENT ON COLUMN posts.rejection_reason IS '拒绝原因';
COMMENT ON TABLE post_moderation_history IS '帖子审核历史记录表';