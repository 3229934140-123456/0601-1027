import { useState } from 'react';
import { Search, Plus, Trash2, Users, UserX, Merge, Building2 } from 'lucide-react';
import { useCRMStore } from '../../store/crmStore';
import { INDUSTRIES, CUSTOMER_STATUS, COMPANY_SCALES, LOST_REASONS, SALES_REPS } from '../../constants';
import { getLabelByValue } from '../../utils';
import PageHeader from '../../components/UI/PageHeader';
import SlidePanel from '../../components/UI/SlidePanel';
import Modal from '../../components/UI/Modal';
import ConfirmDialog from '../../components/UI/ConfirmDialog';
import MergeCustomerModal from '../../components/Customers/MergeCustomerModal';

export default function CustomersPage() {
  const {
    customers, contacts, opportunities, settings,
    addCustomer, updateCustomer, deleteCustomer, mergeCustomers, markCustomerLost,
    addContact, updateContact, deleteContact,
  } = useCRMStore();
  const visibleFields = settings.fieldConfig.customers;

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
  const [isLostOpen, setIsLostOpen] = useState(false);
  const [lostCustomerId, setLostCustomerId] = useState<string | null>(null);
  const [lostReason, setLostReason] = useState('');
  const [activeTab, setActiveTab] = useState('info');

  const [formData, setFormData] = useState({
    name: '',
    industry: 'internet',
    scale: 'small',
    address: '',
    status: 'active' as const,
    owner: 'rep1',
  });

  const [contactForm, setContactForm] = useState({
    id: '',
    name: '',
    position: '',
    phone: '',
    email: '',
    isDecisionMaker: false,
  });
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);

  const filteredCustomers = customers.filter((cust) => {
    const matchesSearch = cust.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || cust.status === statusFilter;
    const matchesIndustry = industryFilter === 'all' || cust.industry === industryFilter;
    return matchesSearch && matchesStatus && matchesIndustry;
  });

  const getCustomerContacts = (customerId: string) => {
    return contacts.filter((c) => c.customerId === customerId);
  };

  const getCustomerOpportunities = (customerId: string) => {
    return opportunities.filter((o) => o.customerId === customerId);
  };

  const getOwnerName = (ownerId: string) => {
    return SALES_REPS.find((r) => r.id === ownerId)?.name || '-';
  };

  const getStatusBadge = (status: string) => {
    const statusInfo = CUSTOMER_STATUS.find((s) => s.value === status);
    if (!statusInfo) return null;
    return <span className={`badge ${statusInfo.color}`}>{statusInfo.label}</span>;
  };

  const openDetail = (customer: any) => {
    setSelectedCustomer(customer);
    setIsDetailOpen(true);
    setActiveTab('info');
  };

  const handleOpenForm = (customer?: any) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({
        name: customer.name,
        industry: customer.industry,
        scale: customer.scale,
        address: customer.address,
        status: customer.status,
        owner: customer.owner,
      });
    } else {
      setEditingCustomer(null);
      setFormData({
        name: '',
        industry: 'internet',
        scale: 'small',
        address: '',
        status: 'active',
        owner: 'rep1',
      });
    }
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCustomer) {
      updateCustomer(editingCustomer.id, formData);
    } else {
      addCustomer(formData);
    }
    setIsFormOpen(false);
  };

  const handleOpenContactForm = (contact?: any) => {
    if (contact) {
      setContactForm({
        id: contact.id,
        name: contact.name,
        position: contact.position,
        phone: contact.phone,
        email: contact.email,
        isDecisionMaker: contact.isDecisionMaker,
      });
    } else {
      setContactForm({
        id: '',
        name: '',
        position: '',
        phone: '',
        email: '',
        isDecisionMaker: false,
      });
    }
    setIsContactFormOpen(true);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    if (contactForm.id) {
      updateContact(contactForm.id, contactForm);
    } else {
      addContact({
        customerId: selectedCustomer.id,
        name: contactForm.name,
        position: contactForm.position,
        phone: contactForm.phone,
        email: contactForm.email,
        isDecisionMaker: contactForm.isDecisionMaker,
      });
    }
    setIsContactFormOpen(false);
  };

  const handleMarkLost = () => {
    if (lostCustomerId && lostReason) {
      markCustomerLost(lostCustomerId, lostReason);
      setIsLostOpen(false);
      setLostCustomerId(null);
      setLostReason('');
    }
  };

  const customerOpps = selectedCustomer ? getCustomerOpportunities(selectedCustomer.id) : [];
  const totalOppAmount = customerOpps.reduce((sum, opp) => sum + opp.amount, 0);

  return (
    <div>
      <PageHeader
        title="客户档案"
        description="管理客户信息和联系人"
        action={{ label: '新增客户', onClick: () => handleOpenForm() }}
      />

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setIsMergeModalOpen(true)}
          className="btn-secondary"
        >
          <Merge className="w-4 h-4 mr-1.5" />
          合并客户
        </button>
      </div>

      <div className="card p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="搜索客户名称..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="select"
          >
            <option value="all">全部状态</option>
            {CUSTOMER_STATUS.map((s) => (
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
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.length === 0 ? (
          <div className="col-span-full card p-12 text-center text-slate-400">
            暂无客户数据
          </div>
        ) : (
          filteredCustomers.map((customer) => (
            <div
              key={customer.id}
              className="card-hover p-5 cursor-pointer"
              onClick={() => openDetail(customer)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    {visibleFields.includes('name') && (
                      <h3 className="font-semibold text-slate-800">{customer.name}</h3>
                    )}
                    {visibleFields.includes('industry') && (
                      <p className="text-xs text-slate-500">
                        {getLabelByValue(INDUSTRIES, customer.industry)}
                      </p>
                    )}
                  </div>
                </div>
                {visibleFields.includes('status') && getStatusBadge(customer.status)}
              </div>
              <div className="space-y-2 text-sm text-slate-600">
                {visibleFields.includes('scale') && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">企业规模</span>
                    <span>{getLabelByValue(COMPANY_SCALES, customer.scale)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400">联系人</span>
                  <span>{getCustomerContacts(customer.id).length} 人</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">商机数</span>
                  <span>{getCustomerOpportunities(customer.id).length} 个</span>
                </div>
                {visibleFields.includes('owner') && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">负责人</span>
                    <span>{getOwnerName(customer.owner)}</span>
                  </div>
                )}
                {visibleFields.includes('createdAt') && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">创建时间</span>
                    <span className="text-slate-500">{customer.createdAt}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <SlidePanel
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={selectedCustomer?.name || '客户详情'}
        width="w-[500px]"
      >
        {selectedCustomer && (
          <div>
            <div className="flex gap-2 border-b border-slate-200 mb-4">
              {['info', 'contacts', 'opportunities'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                    activeTab === tab
                      ? 'text-primary-600 border-primary-600'
                      : 'text-slate-500 border-transparent hover:text-slate-700'
                  }`}
                >
                  {tab === 'info' && '基本信息'}
                  {tab === 'contacts' && '联系人'}
                  {tab === 'opportunities' && '商机'}
                </button>
              ))}
            </div>

            {activeTab === 'info' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">行业</p>
                    <p className="text-sm font-medium text-slate-700">
                      {getLabelByValue(INDUSTRIES, selectedCustomer.industry)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">企业规模</p>
                    <p className="text-sm font-medium text-slate-700">
                      {getLabelByValue(COMPANY_SCALES, selectedCustomer.scale)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">状态</p>
                    <p>{getStatusBadge(selectedCustomer.status)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">负责人</p>
                    <p className="text-sm font-medium text-slate-700">
                      {getOwnerName(selectedCustomer.owner)}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">地址</p>
                  <p className="text-sm text-slate-700">{selectedCustomer.address || '-'}</p>
                </div>
                {selectedCustomer.status === 'lost' && (
                  <div className="p-3 bg-rose-50 rounded-lg">
                    <p className="text-xs text-rose-500 mb-1">流失原因</p>
                    <p className="text-sm text-rose-700">{selectedCustomer.lostReason}</p>
                  </div>
                )}
                <div className="flex gap-2 pt-4">
                  <button
                    onClick={() => {
                      handleOpenForm(selectedCustomer);
                      setIsDetailOpen(false);
                    }}
                    className="btn-secondary flex-1"
                  >
                    编辑信息
                  </button>
                  {selectedCustomer.status !== 'lost' && (
                    <button
                      onClick={() => {
                        setLostCustomerId(selectedCustomer.id);
                        setIsLostOpen(true);
                      }}
                      className="btn-danger flex-1"
                    >
                      <UserX className="w-4 h-4 mr-1.5" />
                      标记流失
                    </button>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'contacts' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <p className="text-sm text-slate-500">
                    共 {getCustomerContacts(selectedCustomer.id).length} 位联系人
                  </p>
                  <button
                    onClick={() => handleOpenContactForm()}
                    className="btn-primary text-sm"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    添加
                  </button>
                </div>
                <div className="space-y-3">
                  {getCustomerContacts(selectedCustomer.id).map((contact) => (
                    <div key={contact.id} className="p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center border border-slate-200">
                            <Users className="w-4 h-4 text-slate-400" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-slate-800">{contact.name}</p>
                              {contact.isDecisionMaker && (
                                <span className="badge bg-amber-100 text-amber-700">决策人</span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500">{contact.position}</p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleOpenContactForm(contact)}
                            className="p-1.5 text-slate-400 hover:text-primary-600 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => deleteContact(contact.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-slate-500 space-y-1">
                        <p>📞 {contact.phone || '-'}</p>
                        <p>✉️ {contact.email || '-'}</p>
                      </div>
                    </div>
                  ))}
                  {getCustomerContacts(selectedCustomer.id).length === 0 && (
                    <p className="text-center py-8 text-slate-400 text-sm">暂无联系人</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'opportunities' && (
              <div>
                <p className="text-sm text-slate-500 mb-4">
                  共 {customerOpps.length} 个商机，总金额 ¥{totalOppAmount.toLocaleString()}
                </p>
                <div className="space-y-3">
                  {customerOpps.map((opp) => (
                    <div key={opp.id} className="p-3 bg-slate-50 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-medium text-slate-800">{opp.name}</p>
                        <span className="text-sm font-semibold text-primary-600">
                          ¥{opp.amount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span>赢率 {opp.winRate}%</span>
                        <span>预计成交 {opp.expectedCloseDate || '-'}</span>
                      </div>
                    </div>
                  ))}
                  {customerOpps.length === 0 && (
                    <p className="text-center py-8 text-slate-400 text-sm">暂无商机</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </SlidePanel>

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={editingCustomer ? '编辑客户' : '新增客户'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">客户名称 *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input"
              placeholder="请输入客户名称"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
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
            <div>
              <label className="label">企业规模</label>
              <select
                value={formData.scale}
                onChange={(e) => setFormData({ ...formData, scale: e.target.value })}
                className="select"
              >
                {COMPANY_SCALES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="label">地址</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="input"
              placeholder="请输入地址"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">状态</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="select"
              >
                {CUSTOMER_STATUS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">负责人</label>
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
          </div>
          <div className="flex gap-2 pt-4">
            <button type="button" onClick={() => setIsFormOpen(false)} className="btn-secondary flex-1">
              取消
            </button>
            <button type="submit" className="btn-primary flex-1">
              {editingCustomer ? '保存修改' : '创建客户'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isContactFormOpen}
        onClose={() => setIsContactFormOpen(false)}
        title={contactForm.id ? '编辑联系人' : '添加联系人'}
      >
        <form onSubmit={handleContactSubmit} className="space-y-4">
          <div>
            <label className="label">姓名 *</label>
            <input
              type="text"
              required
              value={contactForm.name}
              onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
              className="input"
              placeholder="请输入姓名"
            />
          </div>
          <div>
            <label className="label">职位</label>
            <input
              type="text"
              value={contactForm.position}
              onChange={(e) => setContactForm({ ...contactForm, position: e.target.value })}
              className="input"
              placeholder="请输入职位"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">电话</label>
              <input
                type="tel"
                value={contactForm.phone}
                onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                className="input"
                placeholder="请输入电话"
              />
            </div>
            <div>
              <label className="label">邮箱</label>
              <input
                type="email"
                value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                className="input"
                placeholder="请输入邮箱"
              />
            </div>
          </div>
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={contactForm.isDecisionMaker}
                onChange={(e) => setContactForm({ ...contactForm, isDecisionMaker: e.target.checked })}
                className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-slate-700">标记为决策人</span>
            </label>
          </div>
          <div className="flex gap-2 pt-4">
            <button type="button" onClick={() => setIsContactFormOpen(false)} className="btn-secondary flex-1">
              取消
            </button>
            <button type="submit" className="btn-primary flex-1">
              保存
            </button>
          </div>
        </form>
      </Modal>

      <MergeCustomerModal
        isOpen={isMergeModalOpen}
        onClose={() => setIsMergeModalOpen(false)}
      />

      <Modal
        isOpen={isLostOpen}
        onClose={() => {
          setIsLostOpen(false);
          setLostCustomerId(null);
          setLostReason('');
        }}
        title="标记客户流失"
      >
        <p className="text-sm text-slate-600 mb-4">请选择流失原因：</p>
        <div className="space-y-2">
          {LOST_REASONS.map((reason) => (
            <label
              key={reason}
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                lostReason === reason
                  ? 'border-rose-300 bg-rose-50'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                name="lostReason"
                checked={lostReason === reason}
                onChange={() => setLostReason(reason)}
                className="text-rose-600 focus:ring-rose-500"
              />
              <span className="text-sm text-slate-700">{reason}</span>
            </label>
          ))}
        </div>
        <div className="flex gap-2 pt-4">
          <button
            onClick={() => {
              setIsLostOpen(false);
              setLostCustomerId(null);
              setLostReason('');
            }}
            className="btn-secondary flex-1"
          >
            取消
          </button>
          <button
            onClick={handleMarkLost}
            disabled={!lostReason}
            className="btn-danger flex-1"
          >
            确认流失
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) deleteCustomer(deleteId);
        }}
        title="确认删除"
        message="确定要删除该客户吗？相关的联系人、商机、合同等数据也将被删除，且无法恢复。"
      />
    </div>
  );
}
