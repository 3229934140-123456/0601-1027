export const LEAD_SOURCES = [
  { value: 'website', label: '官网注册' },
  { value: 'marketing', label: '市场活动' },
  { value: 'referral', label: '转介绍' },
  { value: 'coldcall', label: 'Cold Call' },
  { value: 'exhibition', label: '展会' },
  { value: 'other', label: '其他' },
];

export const INDUSTRIES = [
  { value: 'internet', label: '互联网' },
  { value: 'finance', label: '金融' },
  { value: 'manufacturing', label: '制造业' },
  { value: 'education', label: '教育' },
  { value: 'medical', label: '医疗' },
  { value: 'retail', label: '零售' },
  { value: 'other', label: '其他' },
];

export const LEAD_STATUS = [
  { value: 'new', label: '新建', color: 'bg-blue-100 text-blue-800' },
  { value: 'following', label: '跟进中', color: 'bg-amber-100 text-amber-800' },
  { value: 'converted', label: '已转化', color: 'bg-emerald-100 text-emerald-800' },
  { value: 'invalid', label: '已无效', color: 'bg-gray-100 text-gray-800' },
];

export const CUSTOMER_STATUS = [
  { value: 'active', label: '活跃', color: 'bg-emerald-100 text-emerald-800' },
  { value: 'dormant', label: '休眠', color: 'bg-gray-100 text-gray-800' },
  { value: 'lost', label: '流失', color: 'bg-rose-100 text-rose-800' },
];

export const COMPANY_SCALES = [
  { value: 'small', label: '小型 (1-50人' },
  { value: 'medium', label: '中型 (50-200人' },
  { value: 'large', label: '大型 (200-1000人' },
  { value: 'enterprise', label: '企业级 (1000人以上' },
];

export const OPPORTUNITY_STAGES = [
  { value: 'initial', label: '初步接触', winRate: 10, color: 'bg-sky-500' },
  { value: 'requirement', label: '需求确认', winRate: 25, color: 'bg-blue-500' },
  { value: 'proposal', label: '方案报价', winRate: 50, color: 'bg-indigo-500' },
  { value: 'negotiation', label: '商务谈判', winRate: 75, color: 'bg-purple-500' },
  { value: 'won', label: '赢单', winRate: 100, color: 'bg-emerald-500' },
  { value: 'lost', label: '输单', winRate: 0, color: 'bg-rose-500' },
];

export const CONTRACT_STATUS = [
  { value: 'pending', label: '待签订', color: 'bg-amber-100 text-amber-800' },
  { value: 'executing', label: '执行中', color: 'bg-blue-100 text-blue-800' },
  { value: 'completed', label: '已完成', color: 'bg-emerald-100 text-emerald-800' },
  { value: 'terminated', label: '已终止', color: 'bg-rose-100 text-rose-800' },
];

export const PAYMENT_STATUS = [
  { value: 'pending', label: '待回款', color: 'bg-amber-100 text-amber-800' },
  { value: 'paid', label: '已回款', color: 'bg-emerald-100 text-emerald-800' },
  { value: 'overdue', label: '已逾期', color: 'bg-rose-100 text-rose-800' },
];

export const FOLLOWUP_TYPES = [
  { value: 'call', label: '电话', icon: 'Phone' },
  { value: 'meeting', label: '会议', icon: 'Users' },
  { value: 'email', label: '邮件', icon: 'Mail' },
  { value: 'visit', label: '拜访', icon: 'MapPin' },
  { value: 'other', label: '其他', icon: 'MoreHorizontal' },
];

export const SALES_REPS = [
  { id: 'rep1', name: '张伟' },
  { id: 'rep2', name: '李娜' },
  { id: 'rep3', name: '王强' },
  { id: 'rep4', name: '刘芳' },
  { id: 'rep5', name: '陈明' },
];

export const LOST_REASONS = [
  '价格过高',
  '竞品胜出',
  '需求不匹配',
  '预算不足',
  '决策人变动',
  '项目延期',
  '其他原因',
];

export const FIELD_CONFIG_OPTIONS = {
  leads: [
    { key: 'companyName', label: '公司名称' },
    { key: 'contactName', label: '联系人' },
    { key: 'phone', label: '电话' },
    { key: 'email', label: '邮箱' },
    { key: 'source', label: '来源' },
    { key: 'industry', label: '行业' },
    { key: 'status', label: '状态' },
    { key: 'createdAt', label: '创建时间' },
  ],
  customers: [
    { key: 'name', label: '客户名称' },
    { key: 'industry', label: '行业' },
    { key: 'scale', label: '规模' },
    { key: 'status', label: '状态' },
    { key: 'owner', label: '负责人' },
    { key: 'createdAt', label: '创建时间' },
  ],
  opportunities: [
    { key: 'name', label: '商机名称' },
    { key: 'customerName', label: '客户名称' },
    { key: 'stage', label: '阶段' },
    { key: 'amount', label: '预计金额' },
    { key: 'winRate', label: '赢率' },
    { key: 'expectedCloseDate', label: '预计成交' },
    { key: 'owner', label: '负责人' },
  ],
  contracts: [
    { key: 'contractNo', label: '合同编号' },
    { key: 'name', label: '合同名称' },
    { key: 'customerName', label: '客户名称' },
    { key: 'amount', label: '合同金额' },
    { key: 'signDate', label: '签订日期' },
    { key: 'status', label: '状态' },
    { key: 'owner', label: '负责人' },
  ],
};

export const DEFAULT_FIELD_CONFIG = {
  leads: ['companyName', 'contactName', 'phone', 'source', 'industry', 'status', 'createdAt'],
  customers: ['name', 'industry', 'scale', 'status', 'owner', 'createdAt'],
  opportunities: ['name', 'customerName', 'stage', 'amount', 'winRate', 'expectedCloseDate', 'owner'],
  contracts: ['contractNo', 'name', 'customerName', 'amount', 'status', 'owner'],
};
