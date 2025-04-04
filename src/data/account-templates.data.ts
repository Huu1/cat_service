import { AccountType } from '../modules/account/enums/account-type.enum';

export const accountTemplates = [
  // 现金账户
  {
    name: '现金',
    type: AccountType.CASH,
    icon: 'cash',
    description: '日常现金账户',
    sort: 1,
  },
  {
    name: '储蓄卡',
    type: AccountType.CASH,
    icon: 'debit-card',
    description: '银行储蓄卡',
    sort: 2,
  },
  {
    name: '支付宝',
    type: AccountType.CASH,
    icon: 'alipay',
    description: '支付宝账户',
    sort: 3,
  },
  {
    name: '微信',
    type: AccountType.CASH,
    icon: 'wechat',
    description: '微信钱包',
    sort: 4,
  },

  // 信用账户
  {
    name: '信用卡',
    type: AccountType.CREDIT,
    icon: 'credit-card',
    description: '银行信用卡',
    sort: 1,
  },
  {
    name: '花呗',
    type: AccountType.CREDIT,
    icon: 'huabei',
    description: '支付宝花呗',
    sort: 2,
  },
  {
    name: '白条',
    type: AccountType.CREDIT,
    icon: 'baitiao',
    description: '京东白条',
    sort: 3,
  },

  // 投资账户
  {
    name: '基金账户',
    type: AccountType.INVESTMENT,
    icon: 'fund',
    description: '基金投资',
    sort: 1,
  },
  {
    name: '股票账户',
    type: AccountType.INVESTMENT,
    icon: 'stock',
    description: '股票投资',
    sort: 2,
  },
  {
    name: '余额理财',
    type: AccountType.INVESTMENT,
    icon: 'money-manage',
    description: '余额理财产品',
    sort: 3,
  },

  // 债权债务
  {
    name: '应收账款',
    type: AccountType.RECEIVABLE,
    icon: 'receivable',
    description: '别人欠我的钱',
    sort: 1,
  },
  {
    name: '应付账款',
    type: AccountType.PAYABLE,
    icon: 'payable',
    description: '我欠别人的钱',
    sort: 1,
  },
];