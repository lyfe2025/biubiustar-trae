-- 创建联系表单表
CREATE TABLE IF NOT EXISTS public.contact_forms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  company VARCHAR(200),
  phone VARCHAR(50),
  cooperation_type VARCHAR(50) NOT NULL CHECK (cooperation_type IN ('technical', 'business', 'investment', 'other')),
  description TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
  admin_notes TEXT,
  processed_by UUID REFERENCES public.users(id),
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_contact_forms_status ON public.contact_forms(status);
CREATE INDEX IF NOT EXISTS idx_contact_forms_cooperation_type ON public.contact_forms(cooperation_type);
CREATE INDEX IF NOT EXISTS idx_contact_forms_created_at ON public.contact_forms(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_forms_email ON public.contact_forms(email);
CREATE INDEX IF NOT EXISTS idx_contact_forms_processed_by ON public.contact_forms(processed_by);

-- 启用行级安全策略 (RLS)
ALTER TABLE public.contact_forms ENABLE ROW LEVEL SECURITY;

-- 创建 RLS 策略
-- 允许匿名用户插入联系表单（提交表单）
CREATE POLICY "Anyone can submit contact forms" ON public.contact_forms
  FOR INSERT WITH CHECK (true);

-- 只有管理员可以查看联系表单
CREATE POLICY "Only admins can view contact forms" ON public.contact_forms
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- 只有管理员可以更新联系表单（处理状态、添加备注等）
CREATE POLICY "Only admins can update contact forms" ON public.contact_forms
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- 只有管理员可以删除联系表单
CREATE POLICY "Only admins can delete contact forms" ON public.contact_forms
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- 授权给 anon 和 authenticated 角色
-- anon 角色只能插入（提交表单）
GRANT INSERT ON public.contact_forms TO anon;
-- authenticated 角色可以插入，管理员可以进行所有操作
GRANT INSERT ON public.contact_forms TO authenticated;
GRANT SELECT, UPDATE, DELETE ON public.contact_forms TO authenticated;

-- 创建更新时间戳的触发器函数（如果不存在）
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为联系表单表创建更新时间戳触发器
CREATE TRIGGER update_contact_forms_updated_at 
    BEFORE UPDATE ON public.contact_forms 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 添加注释
COMMENT ON TABLE public.contact_forms IS '联系表单数据表';
COMMENT ON COLUMN public.contact_forms.id IS '主键ID';
COMMENT ON COLUMN public.contact_forms.name IS '联系人姓名';
COMMENT ON COLUMN public.contact_forms.email IS '联系人邮箱';
COMMENT ON COLUMN public.contact_forms.company IS '公司名称（可选）';
COMMENT ON COLUMN public.contact_forms.phone IS '联系电话（可选）';
COMMENT ON COLUMN public.contact_forms.cooperation_type IS '合作类型：technical-技术合作, business-商务合作, investment-投资合作, other-其他';
COMMENT ON COLUMN public.contact_forms.description IS '详细需求描述';
COMMENT ON COLUMN public.contact_forms.status IS '处理状态：pending-待处理, processing-处理中, completed-已完成, rejected-已拒绝';
COMMENT ON COLUMN public.contact_forms.admin_notes IS '管理员备注';
COMMENT ON COLUMN public.contact_forms.processed_by IS '处理人员ID';
COMMENT ON COLUMN public.contact_forms.processed_at IS '处理时间';
COMMENT ON COLUMN public.contact_forms.created_at IS '创建时间';
COMMENT ON COLUMN public.contact_forms.updated_at IS '更新时间';