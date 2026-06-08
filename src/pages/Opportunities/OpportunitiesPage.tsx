import { useState } from 'react';
import { Plus, Trash2, DollarSign, FileText, ArrowRight, TrendingUp } from 'lucide-react';
import { useCRMStore } from '../../store/crmStore';
import { OPPORTUNITY_STAGES, SALES_REPS, LOST_REASONS } from '../../constants';
import { formatCurrency, formatDate } from '../../utils';
import PageHeader from '../../components/UI/PageHeader';
import SlidePanel from '../../components/UI/SlidePanel';
import Modal from '../../components/UI/Modal';
import ConfirmDialog from '../../components/UI/ConfirmDialog';

export default function OpportunitiesPage() {
  const {
    opportunities, customers, quoteItems,
    addOpportunity, updateOpportunity, updateOpportunityStage, deleteOpportunity,
    addQuoteItem, updateQuoteItem, deleteQuoteItem,
  } = useCRMStore();

  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [selectedOpp, setSelectedOpp] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingOpp, setEditingOpp] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('detail');
  const [isLostOpen, setIsLostOpen] = useState(false);
  const [lostOppId, setLostOppId] = useState<string | null>(null);
  const [lostReason, setLostReason] = useState('');

  const [formData, setFormData] = useState({
    customerId: '',
    name: '',
    stage: 'initial' as const,
    amount: 0,
    winRate: 10,
    expectedCloseDate: '',
    owner: 'rep1',
  });

  const [quoteForm, setQuoteForm] = useState({
    id: '',
    productName: '',
    quantity: 1,
    unitPrice: 0,
    description: '',
  });
  const [isQuoteFormOpen, setIsQuoteFormOpen] = useState(false);

  const getCustomerName = (customerId: string) => {
    return customers.find((c) => c.id === customerId)?.name || '-';
  };

  const getOwnerName = (ownerId: string) => {
    return SALES_REPS.find((r) => r.id === ownerId)?.name || '-';
  };

  const getOppQuoteItems = (oppId: string) => {
    return quoteItems.filter((q) => q.opportunityId === oppId);
  };

  const getQuoteTotal = (oppId: string) => {
    const items = getOppQuoteItems(oppId);
    return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  };

  const getStageOpps = (stage: string) => {
    return opportunities.filter((opp) => opp.stage === stage);
  };

  const getStageTotal = (stage: string) => {
    return getStageOpps(stage).reduce((sum, opp) => sum + opp.amount, 0);
  };

  const openDetail = (opp: any) => {
    setSelectedOpp(opp);
    setIsDetailOpen(true);
    setActiveTab('detail');
  };

  const handleOpenForm = (opp?: any) => {
    if (opp) {
      setEditingOpp(opp);
      setFormData({
        customerId: opp.customerId,
        name: opp.name,
        stage: opp.stage,
        amount: opp.amount,
        winRate: opp.winRate,
        expectedCloseDate: opp.expectedCloseDate,
        owner: opp.owner,
      });
    } else {
      setEditingOpp(null);
      setFormData({
        customerId: customers[0]?.id || '',
        name: '',
        stage: 'initial',
        amount: 0,
        winRate: 10,
        expectedCloseDate: '',
        owner: 'rep1',
      });
    }
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingOpp) {
      updateOpportunity(editingOpp.id, formData);
    } else {
      addOpportunity(formData);
    }
    setIsFormOpen(false);
  };

  const handleStageChange = (oppId: string, newStage: string) => {
    updateOpportunityStage(oppId, newStage as any);
  };

  const handleMarkLost = () => {
    if (lostOppId && lostReason) {
      updateOpportunityStage(lostOppId, 'lost');
      updateOpportunity(lostOppId, { lostReason });
      setIsLostOpen(false);
      setLostOppId(null);
      setLostReason('');
    }
  };

  const handleOpenQuoteForm = (item?: any) => {
    if (item) {
      setQuoteForm({
        id: item.id,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        description: item.description || '',
      });
    } else {
      setQuoteForm({
        id: '',
        productName: '',
        quantity: 1,
        unitPrice: 0,
        description: '',
      });
    }
    setIsQuoteFormOpen(true);
  };

  const handleQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOpp) return;
    if (quoteForm.id) {
      updateQuoteItem(quoteForm.id, quoteForm);
    } else {
      addQuoteItem({
        opportunityId: selectedOpp.id,
        productName: quoteForm.productName,
        quantity: quoteForm.quantity,
        unitPrice: quoteForm.unitPrice,
        description: quoteForm.description,
      });
    }
    setIsQuoteFormOpen(false);
  };

  const totalPipeline = opportunities.reduce((sum, opp) => sum + opp.amount, 0);
  const weightedPipeline = opportunities.reduce((sum, opp) => sum + opp.amount * opp.winRate / 100, 0);
  const wonAmount = opportunities.filter(o => o.stage === 'won').reduce((sum, o) => sum + o.amount, 0);

  return (
    <div>
      <PageHeader
        title="商机管理"
        description="跟踪和推进销售机会"
        action={{ label: '新增商机', onClick: () => handleOpenForm() }}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">管道总金额</p>
              <p className="text-lg font-bold text-slate-800">{formatCurrency(totalPipeline)}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">加权金额</p>
              <p className="text-lg font-bold text-slate-800">{formatCurrency(weightedPipeline)}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <FileText className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">商机总数</p>
              <p className="text-lg font-bold text-slate-800">{opportunities.length}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-slate-500">已赢单金额</p>
              <p className="text-lg font-bold text-slate-800">{formatCurrency(wonAmount)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setViewMode('board')}
          className={`btn-sm ${viewMode === 'board' ? 'btn-primary' : 'btn-secondary'}`}
        >
          看板视图
        </button>
        <button
          onClick={() => setViewMode('list')}
          className={`btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-secondary'}`}
        >
          列表视图
        </button>
      </div>

      {viewMode === 'board' && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {OPPORTUNITY_STAGES.map((stage) => (
            <div key={stage.value} className="flex-shrink-0 w-72">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                  <span className="font-medium text-slate-700">{stage.label}</span>
                  <span className="text-xs text-slate-400">({getStageOpps(stage.value).length})</span>
                </div>
                <span className="text-xs font-medium text-slate-500">
                  {formatCurrency(getStageTotal(stage.value))}
                </span>
              </div>
              <div className="space-y-3 min-h-[200px] bg-slate-100 rounded-lg p-2">
                {getStageOpps(stage.value).map((opp) => (
                  <div
                    key={opp.id}
                    className="card-hover p-3 cursor-pointer"
                    onClick={() => openDetail(opp)}
                  >
                    <p className="font-medium text-slate-800 text-sm mb-2">{opp.name}</p>
                    <p className="text-xs text-slate-500 mb-2">{getCustomerName(opp.customerId)}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-primary-600">
                        {formatCurrency(opp.amount)}
                      </span>
                      <span className="text-xs text-slate-400">{opp.winRate}%</span>
                    </div>
                    {stage.value !== 'won' && stage.value !== 'lost' && (
                      <div className="mt-3 flex justify-end">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const stageIndex = OPPORTUNITY_STAGES.findIndex(s => s.value === stage.value);
                            if (stageIndex < OPPORTUNITY_STAGES.length - 3) {
                              handleStageChange(opp.id, OPPORTUNITY_STAGES[stageIndex + 1].value);
                            }
                          }}
                          className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1"
                          disabled={stage.value === 'won' || stage.value === 'lost'}
                        >
                          推进阶段 <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                {getStageOpps(stage.value).length === 0 && (
                  <p className="text-center py-8 text-slate-400 text-xs">暂商机</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {viewMode === 'list' && (
        <div className="card overflow-hidden">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>商机名称</th>
                  <th>客户名称</th>
                  <th>阶段</th>
                  <th>预计金额</th>
                  <th>赢率</th>
                  <th>预计成交</th>
                  <th>负责人</th>
                  <th className="text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {opportunities.map((opp) => (
                  <tr key={opp.id}>
                    <td className="font-medium text-slate-900">{opp.name}</td>
                    <td>{getCustomerName(opp.customerId)}</td>
                    <td>
                      <span className={`badge bg-slate-100 text-slate-700`}>
                        {OPPORTUNITY_STAGES.find(s => s.value === opp.stage)?.label}
                      </span>
                    </td>
                    <td className="font-medium text-primary-600">{formatCurrency(opp.amount)}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary-500 rounded-full"
                            style={{ width: `${opp.winRate}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-500">{opp.winRate}%</span>
                      </div>
                    </td>
                    <td className="text-slate-500">{opp.expectedCloseDate || '-'}</td>
                    <td>{getOwnerName(opp.owner)}</td>
                    <td className="text-right">
                      <button
                        onClick={() => openDetail(opp)}
                        className="p-1.5 text-primary-600 hover:bg-primary-50 rounded transition-colors"
                        title="查看详情"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <SlidePanel
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={selectedOpp?.name || '商机详情'}
        width="w-[520px]"
      >
        {selectedOpp && (
          <div>
            <div className="flex gap-1 border-b border-slate-200 mb-4">
              {['detail', 'quote'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                    activeTab === tab
                      ? 'text-primary-600 border-primary-600'
                      : 'text-slate-500 border-transparent hover:text-slate-700'
                  }`}
                >
                  {tab === 'detail' && '基本信息'}
                  {tab === 'quote' && '报价清单'}
                </button>
              ))}
            </div>

            {activeTab === 'detail' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">客户名称</p>
                    <p className="text-sm font-medium text-slate-700">
                      {getCustomerName(selectedOpp.customerId)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">负责人</p>
                    <p className="text-sm font-medium text-slate-700">
                      {getOwnerName(selectedOpp.owner)}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">阶段</p>
                    <span className={`badge bg-slate-100 text-slate-700`}>
                      {OPPORTUNITY_STAGES.find(s => s.value === selectedOpp.stage)?.label}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">赢率</p>
                    <p className="text-sm font-medium text-slate-700">{selectedOpp.winRate}%</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">预计金额</p>
                    <p className="text-sm font-semibold text-primary-600">
                      {formatCurrency(selectedOpp.amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">预计成交</p>
                    <p className="text-sm font-medium text-slate-700">
                      {selectedOpp.expectedCloseDate || '-'}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-2">阶段推进</p>
                  <div className="flex flex-wrap gap-2">
                    {OPPORTUNITY_STAGES.map((stage) => (
                      <button
                        key={stage.value}
                        onClick={() => handleStageChange(selectedOpp.id, stage.value)}
                        className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                          selectedOpp.stage === stage.value
                            ? `${stage.color} text-white`
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {stage.label}
                      </button>
                    ))}
                  </div>
                </div>
                {selectedOpp.stage === 'lost' && selectedOpp.lostReason && (
                  <div className="p-3 bg-rose-50 rounded-lg">
                    <p className="text-xs text-rose-500 mb-1">输单原因</p>
                    <p className="text-sm text-rose-700">{selectedOpp.lostReason}</p>
                  </div>
                )}
                <div className="flex gap-2 pt-4">
                  <button
                    onClick={() => {
                      handleOpenForm(selectedOpp);
                      setIsDetailOpen(false);
                    }}
                    className="btn-secondary flex-1"
                  >
                    编辑
                  </button>
                  {selectedOpp.stage !== 'lost' && (
                    <button
                      onClick={() => {
                        setLostOppId(selectedOpp.id);
                        setIsLostOpen(true);
                      }}
                      className="btn-danger flex-1"
                    >
                      标记输单
                    </button>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'quote' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-sm text-slate-500">报价明细</p>
                    <p className="text-lg font-bold text-primary-600">
                      总计：{formatCurrency(getQuoteTotal(selectedOpp.id))}
                    </p>
                  </div>
                  <button
                    onClick={() => handleOpenQuoteForm()}
                    className="btn-primary text-sm"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    添加
                  </button>
                </div>
                <div className="space-y-2">
                  {getOppQuoteItems(selectedOpp.id).map((item) => (
                    <div key={item.id} className="p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-slate-800 text-sm">{item.productName}</p>
                          {item.description && (
                            <p className="text-xs text-slate-500 mt-1">{item.description}</p>
                          )}
                          <p className="text-xs text-slate-500 mt-2">
                            数量：{item.quantity} × 单价：¥{item.unitPrice.toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-primary-600">
                            ¥{(item.quantity * item.unitPrice).toLocaleString()}
                          </span>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleOpenQuoteForm(item)}
                              className="p-1 text-slate-400 hover:text-primary-600"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => deleteQuoteItem(item.id)}
                              className="p-1 text-slate-400 hover:text-rose-600"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {getOppQuoteItems(selectedOpp.id).length === 0 && (
                    <p className="text-center py-8 text-slate-400 text-sm">暂无报价项</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </SlidePanel>

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={editingOpp ? '编辑商机' : '新增商机'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">关联客户 *</label>
            <select
              value={formData.customerId}
              onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
              className="select"
              required
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">商机名称 *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input"
              placeholder="请输入商机名称"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">预计金额 (元)</label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                className="input"
                placeholder="0"
              />
            </div>
            <div>
              <label className="label">赢率 (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.winRate}
                onChange={(e) => setFormData({ ...formData, winRate: Number(e.target.value) })}
                className="input"
                placeholder="10"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">阶段</label>
              <select
                value={formData.stage}
                onChange={(e) => setFormData({ ...formData, stage: e.target.value as any })}
                className="select"
              >
                {OPPORTUNITY_STAGES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">预计成交日期</label>
              <input
                type="date"
                value={formData.expectedCloseDate}
                onChange={(e) => setFormData({ ...formData, expectedCloseDate: e.target.value })}
                className="input"
              />
            </div>
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
          <div className="flex gap-2 pt-4">
            <button type="button" onClick={() => setIsFormOpen(false)} className="btn-secondary flex-1">
              取消
            </button>
            <button type="submit" className="btn-primary flex-1">
              {editingOpp ? '保存修改' : '创建商机'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isQuoteFormOpen}
        onClose={() => setIsQuoteFormOpen(false)}
        title={quoteForm.id ? '编辑报价项' : '添加报价项'}
      >
        <form onSubmit={handleQuoteSubmit} className="space-y-4">
          <div>
            <label className="label">产品名称 *</label>
            <input
              type="text"
              required
              value={quoteForm.productName}
              onChange={(e) => setQuoteForm({ ...quoteForm, productName: e.target.value })}
              className="input"
              placeholder="请输入产品名称"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">数量</label>
              <input
                type="number"
                min="1"
                value={quoteForm.quantity}
                onChange={(e) => setQuoteForm({ ...quoteForm, quantity: Number(e.target.value) })}
                className="input"
              />
            </div>
            <div>
              <label className="label">单价 (元)</label>
              <input
                type="number"
                min="0"
                value={quoteForm.unitPrice}
                onChange={(e) => setQuoteForm({ ...quoteForm, unitPrice: Number(e.target.value) })}
                className="input"
              />
            </div>
          </div>
          <div>
            <label className="label">描述</label>
            <textarea
              value={quoteForm.description}
              onChange={(e) => setQuoteForm({ ...quoteForm, description: e.target.value })}
              className="input min-h-[60px] resize-none"
              placeholder="产品描述或备注"
            />
          </div>
          <div className="flex gap-2 pt-4">
            <button type="button" onClick={() => setIsQuoteFormOpen(false)} className="btn-secondary flex-1">
              取消
            </button>
            <button type="submit" className="btn-primary flex-1">
              保存
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isLostOpen}
        onClose={() => {
          setIsLostOpen(false);
          setLostOppId(null);
          setLostReason('');
        }}
        title="标记输单"
      >
        <p className="text-sm text-slate-600 mb-4">请选择输单原因：</p>
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
              setLostOppId(null);
              setLostReason('');
            }}
            className="btn-secondary flex-1"
          >
            取消
          </button>
          <button onClick={handleMarkLost} disabled={!lostReason} className="btn-danger flex-1">
            确认输单
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) deleteOpportunity(deleteId);
        }}
        title="确认删除"
        message="确定要删除这个商机吗？相关报价数据也将被删除。"
      />
    </div>
  );
}
