import { useState } from 'react';
import { Plus, FileText, DollarSign, CheckCircle, Clock, Trash2 } from 'lucide-react';
import { useCRMStore } from '../../store/crmStore';
import { CONTRACT_STATUS, PAYMENT_STATUS, SALES_REPS } from '../../constants';
import { formatCurrency } from '../../utils';
import PageHeader from '../../components/UI/PageHeader';
import SlidePanel from '../../components/UI/SlidePanel';
import Modal from '../../components/UI/Modal';
import ConfirmDialog from '../../components/UI/ConfirmDialog';

export default function ContractsPage() {
  const {
    contracts, customers, opportunities, payments, settings,
    addContract, updateContract, deleteContract,
    addPayment, updatePayment, markPaymentPaid, deletePayment,
  } = useCRMStore();
  const visibleFields = settings.fieldConfig.contracts;

  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    id: '',
    name: '',
    amount: 0,
    dueDate: '',
    status: 'pending' as const,
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

  const getContractPayments = (contractId: string) => {
    return payments.filter((p) => p.contractId === contractId);
  };

  const getPaidAmount = (contractId: string) => {
    return getContractPayments(contractId)
      .filter((p) => p.status === 'paid')
      .reduce((sum, p) => sum + p.amount, 0);
  };

  const getPaymentProgress = (contractId: string) => {
    const contract = contracts.find((c) => c.id === contractId);
    if (!contract || contract.amount === 0) return 0;
    return Math.round((getPaidAmount(contractId) / contract.amount) * 100);
  };

  const getStatusBadge = (status: string) => {
    const statusInfo = CONTRACT_STATUS.find((s) => s.value === status);
    if (!statusInfo) return null;
    return <span className={`badge ${statusInfo.color}`}>{statusInfo.label}</span>;
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusInfo = PAYMENT_STATUS.find((s) => s.value === status);
    if (!statusInfo) return null;
    return <span className={`badge ${statusInfo.color}`}>{statusInfo.label}</span>;
  };

  const filteredContracts = contracts.filter((c) => {
    return statusFilter === 'all' || c.status === statusFilter;
  });

  const openDetail = (contract: any) => {
    setSelectedContract(contract);
    setIsDetailOpen(true);
  };

  const handleOpenForm = (contract?: any) => {
    if (contract) {
      setEditingContract(contract);
    } else {
      setEditingContract(null);
    }
    setIsFormOpen(true);
  };

  const handleOpenPaymentForm = (payment?: any) => {
    if (payment) {
      setPaymentForm({
        id: payment.id,
        name: payment.name,
        amount: payment.amount,
        dueDate: payment.dueDate,
        status: payment.status,
      });
    } else {
      setPaymentForm({
        id: '',
        name: '',
        amount: 0,
        dueDate: '',
        status: 'pending',
      });
    }
    setIsPaymentFormOpen(true);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContract) return;
    if (paymentForm.id) {
      updatePayment(paymentForm.id, paymentForm);
    } else {
      addPayment({
        contractId: selectedContract.id,
        name: paymentForm.name,
        amount: paymentForm.amount,
        dueDate: paymentForm.dueDate,
        status: paymentForm.status,
      });
    }
    setIsPaymentFormOpen(false);
  };

  const totalContractAmount = contracts.reduce((sum, c) => sum + c.amount, 0);
  const totalPaidAmount = contracts.reduce((sum, c) => sum + getPaidAmount(c.id), 0);

  return (
    <div>
      <PageHeader
        title="合同管理"
        description="管理合同和回款计划"
        action={{ label: '新增合同', onClick: () => handleOpenForm() }}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">合同总数</p>
              <p className="text-lg font-bold text-slate-800">{contracts.length}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">合同总金额</p>
              <p className="text-lg font-bold text-slate-800">{formatCurrency(totalContractAmount)}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">已回款金额</p>
              <p className="text-lg font-bold text-emerald-600">{formatCurrency(totalPaidAmount)}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">待回款金额</p>
              <p className="text-lg font-bold text-amber-600">{formatCurrency(totalContractAmount - totalPaidAmount)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-4 mb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              statusFilter === 'all'
                ? 'bg-primary-100 text-primary-700 font-medium'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            全部
          </button>
          {CONTRACT_STATUS.map((status) => (
            <button
              key={status.value}
              onClick={() => setStatusFilter(status.value)}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                statusFilter === status.value
                  ? 'bg-primary-100 text-primary-700 font-medium'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {status.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredContracts.length === 0 ? (
          <div className="col-span-full card p-12 text-center text-slate-400">
            暂无合同数据
          </div>
        ) : (
          filteredContracts.map((contract) => (
            <div
              key={contract.id}
              className="card-hover p-5 cursor-pointer"
              onClick={() => openDetail(contract)}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  {visibleFields.includes('name') && (
                    <p className="font-semibold text-slate-800">{contract.name}</p>
                  )}
                  {visibleFields.includes('contractNo') && (
                    <p className="text-xs text-slate-500 mt-1">{contract.contractNo}</p>
                  )}
                </div>
                {visibleFields.includes('status') && getStatusBadge(contract.status)}
              </div>
              <div className="space-y-2 text-sm mb-4">
                {visibleFields.includes('customerName') && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">客户</span>
                    <span className="text-slate-700">{getCustomerName(contract.customerId)}</span>
                  </div>
                )}
                {visibleFields.includes('amount') && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">金额</span>
                    <span className="font-semibold text-primary-600">{formatCurrency(contract.amount)}</span>
                  </div>
                )}
                {visibleFields.includes('signDate') && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">签订日期</span>
                    <span className="text-slate-700">{contract.signDate}</span>
                  </div>
                )}
                {visibleFields.includes('owner') && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">负责人</span>
                    <span className="text-slate-700">{getOwnerName(contract.owner)}</span>
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                  <span>回款进度</span>
                  <span>{getPaymentProgress(contract.id)}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{ width: `${getPaymentProgress(contract.id)}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1.5">
                  已回款 {formatCurrency(getPaidAmount(contract.id))} / {formatCurrency(contract.amount)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <SlidePanel
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={selectedContract?.name || '合同详情'}
        width="w-[520px]"
      >
        {selectedContract && (
          <div>
            <div className="mb-4">
              {getStatusBadge(selectedContract.status)}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-xs text-slate-500 mb-1">合同编号</p>
                <p className="text-sm font-medium text-slate-700">{selectedContract.contractNo}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">签订日期</p>
                <p className="text-sm font-medium text-slate-700">{selectedContract.signDate}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">客户名称</p>
                <p className="text-sm font-medium text-slate-700">
                  {getCustomerName(selectedContract.customerId)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">关联商机</p>
                <p className="text-sm font-medium text-slate-700">
                  {getOpportunityName(selectedContract.opportunityId)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">合同金额</p>
                <p className="text-lg font-bold text-primary-600">
                  {formatCurrency(selectedContract.amount)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">负责人</p>
                <p className="text-sm font-medium text-slate-700">
                  {getOwnerName(selectedContract.owner)}
                </p>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-slate-800">回款计划</h4>
                <button
                  onClick={() => handleOpenPaymentForm()}
                  className="btn-primary text-sm"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  添加
                </button>
              </div>
              <div className="space-y-2">
                {getContractPayments(selectedContract.id).map((payment) => (
                  <div key={payment.id} className="p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-slate-800 text-sm">{payment.name}</p>
                        {getPaymentStatusBadge(payment.status)}
                      </div>
                      <div className="flex gap-1">
                        {payment.status !== 'paid' && (
                          <button
                            onClick={() => markPaymentPaid(payment.id)}
                            className="text-xs text-emerald-600 hover:text-emerald-700"
                          >
                            标记回款
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenPaymentForm(payment)}
                          className="p-1 text-slate-400 hover:text-primary-600"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => deletePayment(payment.id)}
                          className="p-1 text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>金额：¥{payment.amount.toLocaleString()}</span>
                      <span>到期：{payment.dueDate}</span>
                      {payment.paidDate && <span>回款：{payment.paidDate}</span>}
                    </div>
                  </div>
                ))}
                {getContractPayments(selectedContract.id).length === 0 && (
                  <p className="text-center py-6 text-slate-400 text-sm">暂无回款计划</p>
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-6">
              <button
                onClick={() => {
                  handleOpenForm(selectedContract);
                  setIsDetailOpen(false);
                }}
                className="btn-secondary flex-1"
              >
                编辑合同
              </button>
              <button
                onClick={() => setDeleteId(selectedContract.id)}
                className="btn-danger flex-1"
              >
                删除合同
              </button>
            </div>
          </div>
        )}
      </SlidePanel>

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingContract ? '编辑合同' : '新增合同'}
        size="lg"
      >
        <ContractForm
          contract={editingContract}
          onClose={() => setIsFormOpen(false)}
          customers={customers}
          opportunities={opportunities}
          onSubmit={(data: any) => {
            if (editingContract) {
              updateContract(editingContract.id, data);
            } else {
              addContract(data);
            }
            setIsFormOpen(false);
          }}
          isEdit={!!editingContract}
        />
      </Modal>

      <Modal
        isOpen={isPaymentFormOpen}
        onClose={() => setIsPaymentFormOpen(false)}
        title={paymentForm.id ? '编辑回款计划' : '添加回款计划'}
      >
        <form onSubmit={handlePaymentSubmit} className="space-y-4">
          <div>
            <label className="label">款项名称 *</label>
            <input
              type="text"
              required
              value={paymentForm.name}
              onChange={(e) => setPaymentForm({ ...paymentForm, name: e.target.value })}
              className="input"
              placeholder="如：首付款、验收款等"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">金额 (元) *</label>
              <input
                type="number"
                required
                min="0"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })}
                className="input"
              />
            </div>
            <div>
              <label className="label">到期日期 *</label>
              <input
                type="date"
                required
                value={paymentForm.dueDate}
                onChange={(e) => setPaymentForm({ ...paymentForm, dueDate: e.target.value })}
                className="input"
              />
            </div>
          </div>
          <div>
            <label className="label">状态</label>
            <select
              value={paymentForm.status}
              onChange={(e) => setPaymentForm({ ...paymentForm, status: e.target.value as any })}
              className="select"
            >
              {PAYMENT_STATUS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 pt-4">
            <button type="button" onClick={() => setIsPaymentFormOpen(false)} className="btn-secondary flex-1">
              取消
            </button>
            <button type="submit" className="btn-primary flex-1">
              保存
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) deleteContract(deleteId);
          setIsDetailOpen(false);
        }}
        title="确认删除"
        message="确定要删除这个合同吗？相关的回款计划也将被删除，且无法恢复。"
      />
    </div>
  );
}

function ContractForm({ contract, onClose, customers, opportunities, onSubmit, isEdit }: any) {
  const [formData, setFormData] = useState({
    customerId: contract?.customerId || customers[0]?.id || '',
    opportunityId: contract?.opportunityId || '',
    contractNo: contract?.contractNo || `HT${Date.now().toString().slice(-8)}`,
    name: contract?.name || '',
    amount: contract?.amount || 0,
    signDate: contract?.signDate || new Date().toISOString().split('T')[0],
    status: contract?.status || 'executing',
    owner: contract?.owner || 'rep1',
    remarks: contract?.remarks || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">合同名称 *</label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="input"
          placeholder="请输入合同名称"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">合同编号</label>
          <input
            type="text"
            value={formData.contractNo}
            onChange={(e) => setFormData({ ...formData, contractNo: e.target.value })}
            className="input"
          />
        </div>
        <div>
          <label className="label">签订日期</label>
          <input
            type="date"
            value={formData.signDate}
            onChange={(e) => setFormData({ ...formData, signDate: e.target.value })}
            className="input"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">关联客户 *</label>
          <select
            value={formData.customerId}
            onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
            className="select"
            required
          >
            {customers.map((c: any) => (
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
              .filter((o: any) => o.customerId === formData.customerId || !formData.customerId)
              .map((o: any) => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">合同金额 (元)</label>
          <input
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
            className="input"
          />
        </div>
        <div>
          <label className="label">状态</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="select"
          >
            {CONTRACT_STATUS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
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
      <div>
        <label className="label">备注</label>
        <textarea
          value={formData.remarks}
          onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
          className="input min-h-[60px] resize-none"
          placeholder="备注信息"
        />
      </div>
      <div className="flex gap-2 pt-4">
        <button type="button" onClick={onClose} className="btn-secondary flex-1">
          取消
        </button>
        <button type="submit" className="btn-primary flex-1">
          {isEdit ? '保存修改' : '创建合同'}
        </button>
      </div>
    </form>
  );
}
