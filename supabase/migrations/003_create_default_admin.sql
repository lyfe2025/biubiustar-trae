-- 创建默认管理员账号
-- 邮箱: admin@biubiustar.com
-- 密码: admin123
-- 角色: super_admin

-- 首先检查是否已存在该管理员账号
DO $$
BEGIN
  -- 检查auth.users表中是否已存在该邮箱
  IF NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'admin@biubiustar.com'
  ) THEN
    -- 插入到auth.users表（Supabase认证表）
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      role
    ) VALUES (
      gen_random_uuid(),
      '00000000-0000-0000-0000-000000000000',
      'admin@biubiustar.com',
      crypt('admin123', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Administrator"}',
      false,
      'authenticated'
    );
    
    -- 获取刚创建的用户ID
    DECLARE
      admin_user_id uuid;
    BEGIN
      SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@biubiustar.com';
      
      -- 插入到public.users表（应用用户表）
      INSERT INTO public.users (
        id,
        email,
        username,
        display_name,
        avatar_url,
        bio,
        is_verified,
        role,
        created_at,
        updated_at
      ) VALUES (
        admin_user_id,
        'admin@biubiustar.com',
        'admin',
        'Administrator',
        null,
        'System Administrator',
        true,
        'super_admin',
        now(),
        now()
      );
    END;
    
    RAISE NOTICE 'Default admin user created successfully: admin@biubiustar.com';
  ELSE
    RAISE NOTICE 'Admin user already exists: admin@biubiustar.com';
  END IF;
END $$;

-- 确保管理员用户具有正确的权限
UPDATE public.users 
SET role = 'super_admin', is_verified = true 
WHERE email = 'admin@biubiustar.com';

-- 验证创建结果
SELECT 
  u.id,
  u.email,
  u.username,
  u.display_name,
  u.role,
  u.is_verified,
  u.created_at
FROM public.users u
WHERE u.email = 'admin@biubiustar.com';