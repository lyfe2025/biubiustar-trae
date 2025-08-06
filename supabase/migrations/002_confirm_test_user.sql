-- 手动确认测试用户的邮箱
-- 这个迁移用于开发环境，确认刚创建的测试用户

UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email = 'testuser123@gmail.com' 
  AND email_confirmed_at IS NULL;

-- 如果需要确认所有未确认的用户（仅开发环境）
-- UPDATE auth.users 
-- SET email_confirmed_at = NOW()
-- WHERE email_confirmed_at IS NULL;