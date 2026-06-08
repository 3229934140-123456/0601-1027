import { useState } from 'react';
import { Search, Plus, UserPlus, Trash2, Filter } from 'lucide-react';
import { useCRMStore } from '../../store/crmStore';
import { LEAD_SOURCES, INDUSTRIES, LEAD_STATUS } from '../../constants';
import { getLabelByValue } from '../../utils';
import PageHeader from '../../components/UI/PageHeader';
import SlidePanel from '../../components/UI/SlidePanel';
import ConfirmDialog from '../../components/UI/ConfirmDialog';

export default function LeadsPage() {
  const { leads, settings, addLead, updateLead, deleteLead, convertLeadToCustomer } = useCRMStore();
  const visibleFields = settings.fieldConfig.leads;
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    companyName: string;
    contactName: string;
    phone: string;
    email: string;
    source: string;
    industry: string;
    status: 'new' | 'following' | 'converted' | 'invalid';
    remarks: string;
  }>({
    companyName: '',
    contactName: '',
    phone: '',
    email: '',
    source: 'website',
    industry: 'internet',
    status: 'new',
    remarks: '',
  });

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone.includes(searchQuery);
    const matchesSource = sourceFilter === 'all' || lead.source === sourceFilter;
    const matchesIndustry = industryFilter === 'all' || lead.industry === industryFilter;
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    return matchesSearch && matchesSource && matchesIndustry && matchesStatus;
  });

  const handleOpenPanel = (lead?: any) => {
    if (lead) {
      setEditingLead(lead);
      setFormData({
        companyName: lead.companyName,
        contactName: lead.contactName,
        phone: lead.phone,
        email: lead.email,
        source: lead.source,
        industry: lead.industry,
        status: lead.status,
        remarks: lead.remarks || '',
      });
    } else {
      setEditingLead(null);
      setFormData({
        companyName: '',
        contactName: '',
        phone: '',
        email: '',
        source: 'website',
        industry: 'internet',
        status: 'new',
        remarks: '',
      });
    }
    setIsPanelOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingLead) {
      updateLead(editingLead.id, formData);
    } else {
      addLead(formData);
    }
    setIsPanelOpen(false);
  };

  const handleConvert = (id: string) => {
    convertLeadToCustomer(id);
  };

  const getStatusBadge = (status: string) => {
    const statusInfo = LEAD_STATUS.find((s) => s.value === status);
    if (!statusInfo) return null;
    return (
      <span className={`badge ${statusInfo.color}`}>
        {statusInfo.label}
      </span>
    );
  };

  return (
    <div>
      <PageHeader
        title="线索池"
        description="管理销售线索，跟进转化为客户"
        action={{ label: '新增线索', onClick: () => handleOpenPanel() }}
      />

      <div className="card p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="搜索公司名称、联系人、电话..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="select"
            >
              <option value="all">全部来源</option>
              {LEAD_SOURCES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <select
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
              className="select"
            >
              <option value="all">全部行业</option>
              {INDUSTRIES.map((i) => (
                <option key={i.value} value={i.value}>{i.label}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="select"
            >
              <option value="all">全部状态</option>
              {LEAD_STATUS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                {visibleFields.includes('companyName') && <th>公司名称</th>}
                {visibleFields.includes('contactName') && <th>联系人</th>}
                {visibleFields.includes('phone') && <th>电话</th>}
                {visibleFields.includes('email') && <th>邮箱</th>}
                {visibleFields.includes('source') && <th>来源</th>}
                {visibleFields.includes('industry') && <th>行业</th>}
                {visibleFields.includes('status') && <th>状态</th>}
                {visibleFields.includes('createdAt') && <th>创建时间</th>}
                <th className="text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={visibleFields.length + 1} className="text-center py-12 text-slate-400">
                    暂无线索数据
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead.id}>
                    {visibleFields.includes('companyName') && <td className="font-medium text-slate-900">{lead.companyName}</td>}
                    {visibleFields.includes('contactName') && <td>{lead.contactName}</td>}
                    {visibleFields.includes('phone') && <td>{lead.phone}</td>}
                    {visibleFields.includes('email') && <td>{lead.email || '-'}</td>}
                    {visibleFields.includes('source') && <td>{getLabelByValue(LEAD_SOURCES, lead.source)}</td>}
                    {visibleFields.includes('industry') && <td>{getLabelByValue(INDUSTRIES, lead.industry)}</td>}
                    {visibleFields.includes('status') && <td>{getStatusBadge(lead.status)}</td>}
                    {visibleFields.includes('createdAt') && <td className="text-slate-500">{lead.createdAt}</td>}
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {lead.status !== 'converted' && (
                          <button
                            onClick={() => handleConvert(lead.id)}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                            title="转为客户"
                          >
                            <UserPlus className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenPanel(lead)}
                          className="p-1.5 text-primary-600 hover:bg-primary-50 rounded transition-colors"
                          title="编辑"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setDeleteId(lead.id)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <SlidePanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        title={editingLead ? '编辑线索' : '新增线索'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">公司名称 *</label>
            <input
              type="text"
              required
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              className="input"
              placeholder="请输入公司名称"
            />
          </div>
          <div>
            <label className="label">联系人 *</label>
            <input
              type="text"
              required
              value={formData.contactName}
              onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
              className="input"
              placeholder="请输入联系人姓名"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">电话</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="input"
                placeholder="请输入电话"
              />
            </div>
            <div>
              <label className="label">邮箱</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input"
                placeholder="请输入邮箱"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">来源</label>
              <select
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                className="select"
              >
                {LEAD_SOURCES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">行业</label>
              <select
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="select"
              >
                {INDUSTRIES.map((i) => (
                  <option key={i.value} value={i.value}>{i.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="label">状态</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="select"
            >
              {LEAD_STATUS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">备注</label>
            <textarea
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              className="input min-h-[80px] resize-none"
              placeholder="请输入备注信息"
            />
          </div>
          <div className="flex gap-2 pt-4">
            <button type="button" onClick={() => setIsPanelOpen(false)} className="btn-secondary flex-1">
              取消
            </button>
            <button type="submit" className="btn-primary flex-1">
              {editingLead ? '保存修改' : '创建线索'}
            </button>
          </div>
        </form>
      </SlidePanel>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) deleteLead(deleteId);
        }}
        title="确认删除"
        message="确定要删除这条线索吗？删除后无法恢复。"
      />
    </div>
  );
}
