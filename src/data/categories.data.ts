import { CategoryType } from '../modules/category/entities/category.entity';

// 支出分类数据
export const expenseCategories = [
  { name: '餐饮', type: CategoryType.EXPENSE, icon: 'food', sort: 1 },
  { name: '购物', type: CategoryType.EXPENSE, icon: 'car', sort: 2 },
  { name: '服饰', type: CategoryType.EXPENSE, icon: 'shopping', sort: 3 },
  { name: '护肤', type: CategoryType.EXPENSE, icon: 'home', sort: 4 },
  { name: '住房', type: CategoryType.EXPENSE, icon: 'entertainment', sort: 5 },
  { name: '交通', type: CategoryType.EXPENSE, icon: 'medical', sort: 6 },
  { name: '医疗', type: CategoryType.EXPENSE, icon: 'education', sort: 7 },
  { name: '汽车', type: CategoryType.EXPENSE, icon: 'education', sort: 8 },
  { name: '学习', type: CategoryType.EXPENSE, icon: 'education', sort: 9 },
  { name: '运动', type: CategoryType.EXPENSE, icon: 'education', sort: 10 },
  { name: '社交', type: CategoryType.EXPENSE, icon: 'education', sort: 11 },
  { name: '人情', type: CategoryType.EXPENSE, icon: 'education', sort: 12 },
  { name: '旅行', type: CategoryType.EXPENSE, icon: 'education', sort: 13 },
  { name: '烟酒', type: CategoryType.EXPENSE, icon: 'education', sort: 14 },
  { name: '理发', type: CategoryType.EXPENSE, icon: 'education', sort: 15 },
  { name: '软件', type: CategoryType.EXPENSE, icon: 'education', sort: 16 },
  { name: '其他', type: CategoryType.EXPENSE, icon: 'education', sort: 17 },
];

// 收入分类数据
export const incomeCategories = [
  { name: '工资', type: CategoryType.INCOME, icon: 'salary', sort: 1 },
  { name: '奖金', type: CategoryType.INCOME, icon: 'bonus', sort: 2 },
  { name: '加班', type: CategoryType.INCOME, icon: 'investment', sort: 3 },
  { name: '福利', type: CategoryType.INCOME, icon: 'part-time', sort: 4 },
  { name: '公积金', type: CategoryType.INCOME, icon: 'red-packet', sort: 5 },
  { name: '红包', type: CategoryType.INCOME, icon: 'red-packet', sort: 5 },
  { name: '兼职', type: CategoryType.INCOME, icon: 'red-packet', sort: 5 },
  { name: '副业', type: CategoryType.INCOME, icon: 'red-packet', sort: 5 },
  { name: '退税', type: CategoryType.INCOME, icon: 'red-packet', sort: 5 },
  { name: '投资', type: CategoryType.INCOME, icon: 'red-packet', sort: 5 },
  { name: '意外收入', type: CategoryType.INCOME, icon: 'red-packet', sort: 5 },
  { name: '其他', type: CategoryType.INCOME, icon: 'red-packet', sort: 5 },
];

// 合并所有分类
export const allCategories = [...expenseCategories, ...incomeCategories];