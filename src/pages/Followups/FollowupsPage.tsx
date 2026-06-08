import { useState } from 'react';
import {
  Phone, Users, Mail, MapPin, MoreHorizontal, Plus,
  Calendar, Clock, ChevronRight
} from 'lucide-react';
import { useCRMStore } from '../../store/crmStore';
import { FOLLOWUP_TYPES, SALES_REPS } from '../../constants';
import { formatDate, formatDateTime } from '../../utils';
import PageHeader from '../../components/UI/PageHeader';
import Modal from '../../components/UI/Modal';

const typeIcons: Record<string, any> = {
  call: Phone,
  meeting: Users,
  email: Mail,
  visit: MapPin,
  other: MoreHorizontal,
};

const typeColors: Record<string, string> = {
  call: 'bg-blue-100 text-blue-600',
  meeting: 'bg-purple-100 text-purple-600',
  email: 'bg-emerald-100 text-emerald-600',
  visit: 'bg-amber-100 text-amber-600',
  other: 'bg-slate-100 text-slate-600',
};

export default function FollowupsPage() {
  const { followups, customers, opportunities, addFollowup } = useCRMStore();
  const [typeFilter, setTypeFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    customerId: '',
    opportunityId: '',
    type: 'call' as const,
    content: '',
    followDate: formatDate(new Date()),
    nextFollowDate: '',
    nextFollowContent: '',
    owner: 'rep1',
  });

  const getCustomerName = (customerId: string) => {
    return customers.find((c) => c.id === customerId)?.name || '-';
  };

  const getOpportunityName = (opportunityId?: string) => {
    if (!opportunityId) return '-';
    return opportunities.find((o) => o.id === opportunityId)?.name || '-';
  };

  const getOwnerName = (ownerId: string) => {
    return SALES_REPS.find((r) => r.id === ownerId)?.name || '-';
  };

  const getTypeName = (type: string) => {
    return FOLLOWUP_TYPES.find((t) => t.value === type)?.label || type;
  };

  const filteredFollowups = followups.filter((f) => {
    return typeFilter === 'all' || f.type === typeFilter;
  });

  const groupedByDate = filteredFollowups.reduce((groups: Record<string, typeof followups>, followup) => {
    const date = followup.followDate;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(followup);
    return groups;
  }, {});

  const sortedDates = Object.keys(groupedByDate).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addFollowup(formData);
    setIsFormOpen(false);
    setFormData({
      customerId: '',
      opportunityId: '',
      type: 'call',
      content: '',
      followDate: formatDate(new Date()),
      nextFollowDate: '',
      nextFollowContent: '',
      owner: 'rep1',
    });
  };

  const upcomingFollowups = followups
    .filter((f) => f.nextFollowDate && new Date(f.nextFollowDate) >= new Date())
    .sort((a, b) => new Date(a.nextFollowDate!).getTime() - new Date(b.nextFollowDate!).getTime())
    .slice(0, 5);

  return (
    <div>
      <PageHeader
        title="跟进记录"
        description="记录和查看客户跟进情况"
        action={{ label: '新增跟进', onClick: () => setIsFormOpen(true) }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="card p-4 mb-4">
            <div className="flex gap-2">
              <button
                onClick={() => setTypeFilter('all')}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  typeFilter === 'all'
                    ? 'bg-primary-100 text-primary-700 font-medium'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                全部
              </button>
              {FOLLOWUP_TYPES.map((type) => {
                const Icon = typeIcons[type.value];
                return (
                  <button
                    key={type.value}
                    onClick={() => setTypeFilter(type.value)}
                    className={`px-3 py-1.5 text-sm rounded-md flex items-center gap-1.5 transition-colors ${
                      typeFilter === type.value
                        ? 'bg-primary-100 text-primary-700 font-medium'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {type.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-6">
            {sortedDates.length === 0 ? (
              <div className="card p-12 text-center text-slate-400">
                暂无跟进记录
              </div>
            ) : (
              sortedDates.map((date) => (
                <div key={date}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-primary-500" />
                    <span className="text-sm font-medium text-slate-700">{date}</span>
                    <span className="text-xs text-slate-400">
                      ({groupedByDate[date].length} 条跟进)
                    </span>
                  </div>
                  <div className="relative pl-4 border-l-2 border-slate-200 space-y-4">
                    {groupedByDate[date].map((followup) => {
                      const Icon = typeIcons[followup.type] || MoreHorizontal;
                      return (
                        <div key={followup.id} className="relative">
                          <div className={`absolute -left-[25px] w-6 h-6 rounded-full flex items-center justify-center ${typeColors[followup.type]}`}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="card p-4 ml-2">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-slate-800">
                                    {getCustomerName(followup.customerId)}
                                  </span>
                                  <span className={`badge ${typeColors[followup.type]} text-xs`}>
                                    {getTypeName(followup.type)}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-500 mt-0.5">
                                  商机：{getOpportunityName(followup.opportunityId)}
                                </p>
                              </div>
                              <span className="text-xs text-slate-400">
                                {followup.followDate}
                              </span>
                            </div>
                            <p className="text-sm text-slate-600 whitespace-pre-wrap">
                              {followup.content}
                            </p>
                            {followup.nextFollowDate && (
                              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 text-sm">
                                <Calendar className="w-4 h-4 text-amber-500" />
                                <span className="text-slate-600">下次跟进：</span>
                                <span className="font-medium text-amber-600">
                                  {followup.nextFollowDate}
                                </span>
                                {followup.nextFollowContent && (
                                  <>
                                    <ChevronRight className="w-4 h-4 text-slate-400" />
                                    <span className="text-slate-500">{followup.nextFollowContent}</span>
                                  </>
                                )}
                              </div>
                            )}
                            <div className="mt-2 text-right">
                              <span className="text-xs text-slate-400">
                                跟进人：{getOwnerName(followup.owner)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="card p-5 sticky top-6">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              待跟进
            </h3>
            <div className="space-y-3">
              {upcomingFollowups.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">暂无待跟进</p>
              ) : (
                upcomingFollowups.map((followup) => (
                  <div key={followup.id} className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                    <p className="font-medium text-slate-800 text-sm">
                      {getCustomerName(followup.customerId)}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {followup.nextFollowContent || '下次跟进'}
                    </p>
                    <p className="text-xs text-amber-600 font-medium mt-2">
                      {followup.nextFollowDate}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title="新增跟进记录"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">关联客户 *</label>
              <select
                value={formData.customerId}
                onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                className="select"
                required
              >
                <option value="">请选择客户</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">关联商机</label>
              <select
                value={formData.opportunityId}
                onChange={(e) => setFormData({ ...formData, opportunityId: e.target.value })}
                className="select"
              >
                <option value="">不关联商机</option>
                {opportunities
                  .filter((o) => o.customerId === formData.customerId || !formData.customerId)
                  .map((o) => (
                    <option key={o.id} value={o.id}>{o.name}</option>
                  ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">跟进类型</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="select"
              >
                {FOLLOWUP_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">跟进日期</label>
              <input
                type="date"
                value={formData.followDate}
                onChange={(e) => setFormData({ ...formData, followDate: e.target.value })}
                className="input"
              />
            </div>
          </div>
          <div>
            <label className="label">跟进内容 *</label>
            <textarea
              required
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="input min-h-[100px] resize-none"
              placeholder="请输入跟进内容..."
            />
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-sm font-medium text-slate-700 mb-3">下次跟进安排</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label text-xs">日期</label>
                <input
                  type="date"
                  value={formData.nextFollowDate}
                  onChange={(e) => setFormData({ ...formData, nextFollowDate: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="label text-xs">内容</label>
                <input
                  type="text"
                  value={formData.nextFollowContent}
                  onChange={(e) => setFormData({ ...formData, nextFollowContent: e.target.value })}
                  className="input"
                  placeholder="跟进主题"
                />
              </div>
            </div>
          </div>
          <div>
            <label className="label">跟进人</label>
            <select
              value={formData.owner}
              onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
              className="select"
            >
              {SALES_REPS.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 pt-4">
            <button type="button" onClick={() => setIsFormOpen(false)} className="btn-secondary flex-1">
              取消
            </button>
            <button type="submit" className="btn-primary flex-1">
              保存记录
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
