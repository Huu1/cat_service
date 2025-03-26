export enum AccountType {
  CASH = 'cash',       // 资金账户（现金、银行卡等）
  CREDIT = 'credit',   // 信用账户（信用卡、花呗等）
  INVESTMENT = 'investment', // 理财账户（基金、股票等）
  RECEIVABLE = 'receivable', // 应收款项
  PAYABLE = 'payable'   // 应付款项
}

export const AccountTypesMap = [
  { title: '资金账户', type: AccountType.CASH },
  { title: '信用账户', type: AccountType.CREDIT },
  { title: '理财账户', type: AccountType.INVESTMENT },
  { title: '应收账户', type: AccountType.RECEIVABLE },
  { title: '应付账户', type: AccountType.PAYABLE },
];
