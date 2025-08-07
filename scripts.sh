#!/bin/bash

# 项目脚本交互式入口
# ===================

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# 显示主菜单
show_menu() {
    clear
    echo -e "${CYAN}🛠️  项目脚本管理中心${NC}"
    echo -e "${CYAN}========================${NC}"
    echo ""
    echo -e "${BLUE}请选择要执行的操作：${NC}"
    echo ""
    echo "  1) 部署相关脚本"
    echo "  2) 工具脚本"  
    echo "  3) 数据库脚本"
    echo "  4) 备份与恢复"
    echo "  5) 系统检查"
    echo "  0) 退出"
    echo ""
    echo -n -e "${YELLOW}请输入选项 [0-5]: ${NC}"
}

# 部署脚本菜单
deployment_menu() {
    clear
    echo -e "${PURPLE}🚀 部署相关脚本${NC}"
    echo -e "${PURPLE}===============${NC}"
    echo ""
    echo "  1) 开发环境部署"
    echo "  2) 测试环境部署"
    echo "  3) 生产环境部署" 
    echo "  4) 回滚部署"
    echo "  0) 返回主菜单"
    echo ""
    echo -n -e "${YELLOW}请输入选项 [0-4]: ${NC}"
}

# 工具脚本菜单
tools_menu() {
    clear
    echo -e "${GREEN}🔧 工具脚本${NC}"
    echo -e "${GREEN}==========${NC}"
    echo ""
    echo "  1) 代码格式化"
    echo "  2) 依赖检查"
    echo "  3) 性能分析"  
    echo "  4) 日志清理"
    echo "  0) 返回主菜单"
    echo ""
    echo -n -e "${YELLOW}请输入选项 [0-4]: ${NC}"
}

# 数据库脚本菜单
database_menu() {
    clear
    echo -e "${BLUE}💾 数据库脚本${NC}"
    echo -e "${BLUE}============${NC}"
    echo ""
    echo "  1) 数据备份"
    echo "  2) 数据恢复"
    echo "  3) 数据迁移"
    echo "  4) 数据库优化"
    echo "  0) 返回主菜单" 
    echo ""
    echo -n -e "${YELLOW}请输入选项 [0-4]: ${NC}"
}

# 备份恢复菜单
backup_menu() {
    clear
    echo -e "${CYAN}💼 备份与恢复${NC}"
    echo -e "${CYAN}============${NC}"
    echo ""
    echo "  1) 项目完整备份"
    echo "  2) 配置文件备份"
    echo "  3) 恢复备份"
    echo "  4) 清理旧备份"
    echo "  0) 返回主菜单"
    echo ""
    echo -n -e "${YELLOW}请输入选项 [0-4]: ${NC}"
}

# 系统检查
system_check() {
    clear
    echo -e "${GREEN}🔍 系统环境检查${NC}"
    echo -e "${GREEN}===============${NC}"
    echo ""
    
    echo -e "${BLUE}Node.js 版本:${NC}"
    node --version 2>/dev/null || echo "未安装"
    echo ""
    
    echo -e "${BLUE}Git 版本:${NC}"
    git --version 2>/dev/null || echo "未安装"
    echo ""
    
    echo -e "${BLUE}项目信息:${NC}"
    echo "目录: $(pwd)"
    if [ -f "package.json" ]; then
        echo "项目名: $(cat package.json | grep '"name"' | head -1 | cut -d'"' -f4)"
        echo "版本: $(cat package.json | grep '"version"' | head -1 | cut -d'"' -f4)"
    fi
    echo ""
    
    echo -e "${BLUE}磁盘空间:${NC}"
    df -h . | tail -1
    echo ""
    
    echo -n -e "${YELLOW}按任意键返回主菜单...${NC}"
    read -n 1
}

# 执行脚本的通用函数
execute_script() {
    local script_path="$1"
    local script_name="$2"
    
    if [ -f "$script_path" ]; then
        echo -e "${GREEN}执行: $script_name${NC}"
        bash "$script_path"
    else
        echo -e "${RED}脚本不存在: $script_path${NC}"
        echo -e "${YELLOW}你可以创建这个脚本来实现对应功能${NC}"
    fi
    
    echo ""
    echo -n -e "${YELLOW}按任意键继续...${NC}"
    read -n 1
}

# 主循环
main() {
    while true; do
        show_menu
        read choice
        
        case $choice in
            1)
                while true; do
                    deployment_menu
                    read deploy_choice
                    case $deploy_choice in
                        1) execute_script "scripts/deployment/dev-deploy.sh" "开发环境部署" ;;
                        2) execute_script "scripts/deployment/test-deploy.sh" "测试环境部署" ;;
                        3) execute_script "scripts/deployment/prod-deploy.sh" "生产环境部署" ;;
                        4) execute_script "scripts/deployment/rollback.sh" "回滚部署" ;;
                        0) break ;;
                        *) echo -e "${RED}无效选项${NC}"; sleep 1 ;;
                    esac
                done
                ;;
            2)
                while true; do
                    tools_menu
                    read tools_choice
                    case $tools_choice in
                        1) execute_script "scripts/tools/format-code.sh" "代码格式化" ;;
                        2) execute_script "scripts/tools/check-deps.sh" "依赖检查" ;;
                        3) execute_script "scripts/tools/performance.sh" "性能分析" ;;
                        4) execute_script "scripts/tools/clean-logs.sh" "日志清理" ;;
                        0) break ;;
                        *) echo -e "${RED}无效选项${NC}"; sleep 1 ;;
                    esac
                done
                ;;
            3)
                while true; do
                    database_menu  
                    read db_choice
                    case $db_choice in
                        1) execute_script "scripts/database/backup.sh" "数据备份" ;;
                        2) execute_script "scripts/database/restore.sh" "数据恢复" ;;
                        3) execute_script "scripts/database/migrate.sh" "数据迁移" ;;
                        4) execute_script "scripts/database/optimize.sh" "数据库优化" ;;
                        0) break ;;
                        *) echo -e "${RED}无效选项${NC}"; sleep 1 ;;
                    esac
                done
                ;;
            4)
                while true; do
                    backup_menu
                    read backup_choice
                    case $backup_choice in
                        1) execute_script "scripts/tools/full-backup.sh" "项目完整备份" ;;
                        2) execute_script "scripts/tools/config-backup.sh" "配置文件备份" ;;
                        3) execute_script "scripts/tools/restore-backup.sh" "恢复备份" ;;
                        4) execute_script "scripts/tools/clean-backups.sh" "清理旧备份" ;;
                        0) break ;;
                        *) echo -e "${RED}无效选项${NC}"; sleep 1 ;;
                    esac
                done
                ;;
            5)
                system_check
                ;;
            0)
                echo -e "${GREEN}再见！${NC}"
                exit 0
                ;;
            *)
                echo -e "${RED}无效选项，请重新选择${NC}"
                sleep 1
                ;;
        esac
    done
}

# 检查参数，支持直接调用特定功能
if [ $# -gt 0 ]; then
    case "$1" in
        "check") system_check; exit 0 ;;
        "help") 
            echo "用法: $0 [check|help]"
            echo "  check - 执行系统检查"
            echo "  help  - 显示此帮助"
            echo "  无参数 - 启动交互式菜单"
            exit 0
            ;;
    esac
fi

# 启动主程序
main
