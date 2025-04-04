import { CategoryType } from '../modules/category/entities/category.entity';

// 支出分类数据
export const expenseCategories = [
  { name: '餐饮', type: CategoryType.EXPENSE, icon: 'food', sort: 1 },
  { name: '交通', type: CategoryType.EXPENSE, icon: 'car', sort: 2 },
  { name: '购物', type: CategoryType.EXPENSE, icon: 'shopping', sort: 3 },
  { name: '居住', type: CategoryType.EXPENSE, icon: 'home', sort: 4 },
  { name: '娱乐', type: CategoryType.EXPENSE, icon: 'entertainment', sort: 5 },
  { name: '医疗', type: CategoryType.EXPENSE, icon: 'medical', sort: 6 },
  { name: '教育', type: CategoryType.EXPENSE, icon: 'education', sort: 7 },
];

// 收入分类数据
export const incomeCategories = [
  { name: '工资', type: CategoryType.INCOME, icon: 'salary', sort: 1 },
  { name: '奖金', type: CategoryType.INCOME, icon: 'bonus', sort: 2 },
  { name: '理财', type: CategoryType.INCOME, icon: 'investment', sort: 3 },
  { name: '兼职', type: CategoryType.INCOME, icon: 'part-time', sort: 4 },
  { name: '红包', type: CategoryType.INCOME, icon: 'red-packet', sort: 5 },
];

// 合并所有分类
export const allCategories = [...expenseCategories, ...incomeCategories];