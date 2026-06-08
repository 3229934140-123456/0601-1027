import { useState, useMemo } from 'react';
import { X, ChevronRight, Check, Users, Target, FileText, MessageSquare, Building2, AlertTriangle } from 'lucide-react';
import { Customer } from '../../types';
import { useCRMStore } from '../../store/crmStore';
import { INDUSTRIES, SALES_REPS } from '../../constants';
import { getLabelByValue } from '../../utils';

interface MergeCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type MergeStep = 'select' | 'chooseMaster' | 'preview' | 'success';

export default function MergeCustomerModal({ isOpen, onClose }: MergeCustomerModalProps) {
  const { customers, contacts, opportunities, contracts, followups, mergeCustomers } = useCRMStore();
  const [step, setStep] = useState<MergeStep>('select');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [masterId, setMasterId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [customers, searchQuery]);

  const getCustomerStats = (customerId: string) => {
    return {
      contacts: contacts.filter((c) => c.customerId === customerId).length,
      opportunities: opportunities.filter((o) => o.customerId === customerId).length,
      contracts: contracts.filter((c) => c.customerId === customerId).length,
      followups: followups.filter((f) => f.customerId === customerId).length,
    };
  };

  const getTotalStats = () => {
    return selectedIds.reduce(
      (total, id) => {
        const stats = getCustomerStats(id);
        return {
          contacts: total.contacts + stats.contacts,
          opportunities: total.opportunities + stats.opportunities,
          contracts: total.contracts + stats.contracts,
          followups: total.followups + stats.followups,
        };
      },
      { contacts: 0, opportunities: 0, contracts: 0, followups: 0 }
    );
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleNextStep = () => {
    if (step === 'select' && selectedIds.length >= 2) {
      setMasterId(selectedIds[0]);
      setStep('chooseMaster');
    } else if (step === 'chooseMaster' && masterId) {
      setStep('preview');
    }
  };

  const handlePrevStep = () => {
    if (step === 'chooseMaster') {
      setStep('select');
    } else if (step === 'preview') {
      setStep('chooseMaster');
    }
  };

  const handleMerge = () => {
    const sourceIds = selectedIds.filter((id) => id !== masterId);
    mergeCustomers(masterId, sourceIds);
    setStep('success');
  };

  const handleClose = () => {
    setStep('select');
    setSelectedIds([]);
    setMasterId('');
    setSearchQuery('');
    onClose();
  };

  if (!isOpen) return null;

  const masterCustomer = customers.find((c) => c.id === masterId);
  const totalStats = getTotalStats();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">合并客户</h2>
              <p className="text-primary-100 text-sm mt-1">
                将多个重复客户合并为一个主客户，相关数据统一归集
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center gap-2 mt-4">
            {['select', 'chooseMaster', 'preview', 'success'].map((s, index) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                    step === s
                      ? 'bg-white text-primary-600 scale-110'
                      : ['select', 'chooseMaster', 'preview', 'success'].indexOf(step) > index
                      ? 'bg-emerald-400 text-white'
                      : 'bg-white/30 text-white/70'
                  }`}
                >
                  {['select', 'chooseMaster', 'preview', 'success'].indexOf(step) > index ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < 3 && (
                  <div
                    className={`w-12 h-0.5 mx-1 ${
                      ['select', 'chooseMaster', 'preview', 'success'].indexOf(step) > index
                        ? 'bg-emerald-400'
                        : 'bg-white/30'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {step === 'select' && (
            <div>
              <p className="text-sm text-slate-600 mb-4">
                选择需要合并的客户（至少选择2个）
              </p>
              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder="搜索客户名称..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input pl-10"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                {filteredCustomers.map((cust) => {
                  const stats = getCustomerStats(cust.id);
                  const isSelected = selectedIds.includes(cust.id);
                  return (
                    <label
                      key={cust.id}
                      className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-primary-400 bg-primary-50'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(cust.id)}
                        className="mt-1 w-5 h-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-slate-400" />
                          <span className="font-medium text-slate-800">{cust.name}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          {getLabelByValue(INDUSTRIES, cust.industry)}
                        </p>
                        <div className="flex gap-4 mt-2 text-xs">
                          <span className="text-slate-500">
                            <Users className="w-3.5 h-3.5 inline mr-1" />
                            {stats.contacts} 联系人
                          </span>
                          <span className="text-slate-500">
                            <Target className="w-3.5 h-3.5 inline mr-1" />
                            {stats.opportunities} 商机
                          </span>
                          <span className="text-slate-500">
                            <FileText className="w-3.5 h-3.5 inline mr-1" />
                            {stats.contracts} 合同
                          </span>
                          <span className="text-slate-500">
                            <MessageSquare className="w-3.5 h-3.5 inline mr-1" />
                            {stats.followups} 跟进
                          </span>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {step === 'chooseMaster' && (
            <div>
              <p className="text-sm text-slate-600 mb-4">
                选择一个客户作为主客户，其他客户的数据将合并到该客户名下
              </p>
              <div className="space-y-3">
                {selectedIds.map((id) => {
                  const cust = customers.find((c) => c.id === id);
                  const stats = getCustomerStats(id);
                  const isMaster = masterId === id;
                  if (!cust) return null;
                  return (
                    <label
                      key={id}
                      className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        isMaster
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="master"
                        checked={isMaster}
                        onChange={() => setMasterId(id)}
                        className="mt-1 w-5 h-5 text-primary-600 focus:ring-primary-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-800">{cust.name}</span>
                          {isMaster && (
                            <span className="badge bg-primary-100 text-primary-700">主客户</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          {getLabelByValue(INDUSTRIES, cust.industry)} · 负责人：
                          {SALES_REPS.find((r) => r.id === cust.owner)?.name}
                        </p>
                        <div className="flex gap-4 mt-2 text-xs">
                          <span className="text-slate-500">{stats.contacts} 联系人</span>
                          <span className="text-slate-500">{stats.opportunities} 商机</span>
                          <span className="text-slate-500">{stats.contracts} 合同</span>
                          <span className="text-slate-500">{stats.followups} 跟进</span>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {step === 'preview' && masterCustomer && (
            <div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800">合并前请确认</p>
                    <p className="text-sm text-amber-700 mt-1">
                      合并操作不可撤销，被合并的客户将被删除，所有相关数据将转移到主客户名下
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-5">
                <h4 className="font-medium text-slate-800 mb-3">合并结果预览</h4>
                <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-5 border border-primary-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 text-lg">
                        {masterCustomer.name}
                      </p>
                      <p className="text-sm text-primary-700">主客户</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/70 rounded-lg p-3">
                      <p className="text-xs text-slate-500 mb-1">联系人</p>
                      <p className="text-xl font-bold text-slate-800">
                        {totalStats.contacts}
                        <span className="text-sm font-normal text-slate-400 ml-1">个</span>
                      </p>
                    </div>
                    <div className="bg-white/70 rounded-lg p-3">
                      <p className="text-xs text-slate-500 mb-1">商机</p>
                      <p className="text-xl font-bold text-slate-800">
                        {totalStats.opportunities}
                        <span className="text-sm font-normal text-slate-400 ml-1">个</span>
                      </p>
                    </div>
                    <div className="bg-white/70 rounded-lg p-3">
                      <p className="text-xs text-slate-500 mb-1">合同</p>
                      <p className="text-xl font-bold text-slate-800">
                        {totalStats.contracts}
                        <span className="text-sm font-normal text-slate-400 ml-1">份</span>
                      </p>
                    </div>
                    <div className="bg-white/70 rounded-lg p-3">
                      <p className="text-xs text-slate-500 mb-1">跟进记录</p>
                      <p className="text-xl font-bold text-slate-800">
                        {totalStats.followups}
                        <span className="text-sm font-normal text-slate-400 ml-1">条</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-slate-800 mb-3">将被合并的客户</h4>
                <div className="space-y-2">
                  {selectedIds
                    .filter((id) => id !== masterId)
                    .map((id) => {
                      const cust = customers.find((c) => c.id === id);
                      const stats = getCustomerStats(id);
                      if (!cust) return null;
                      return (
                        <div
                          key={id}
                          className="flex items-center justify-between p-3 bg-rose-50 rounded-lg border border-rose-100"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-slate-700 font-medium">{cust.name}</span>
                            <span className="badge bg-rose-100 text-rose-700">将删除</span>
                          </div>
                          <div className="flex gap-3 text-xs text-slate-500">
                            <span>{stats.contacts}联系人</span>
                            <span>{stats.opportunities}商机</span>
                            <span>{stats.contracts}合同</span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">合并成功！</h3>
              <p className="text-slate-600 mb-6">
                已成功将 {selectedIds.length - 1} 个客户合并到「{masterCustomer?.name}」
              </p>
              <div className="bg-slate-50 rounded-xl p-4 max-w-xs mx-auto">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary-600">
                      {totalStats.contacts}
                    </p>
                    <p className="text-xs text-slate-500">联系人</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary-600">
                      {totalStats.opportunities}
                    </p>
                    <p className="text-xs text-slate-500">商机</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary-600">
                      {totalStats.contracts}
                    </p>
                    <p className="text-xs text-slate-500">合同</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary-600">
                      {totalStats.followups}
                    </p>
                    <p className="text-xs text-slate-500">跟进</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {step !== 'success' && (
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-between">
            <button
              onClick={step === 'select' ? handleClose : handlePrevStep}
              className="btn-secondary"
            >
              {step === 'select' ? '取消' : '上一步'}
            </button>
            <button
              onClick={step === 'preview' ? handleMerge : handleNextStep}
              disabled={
                (step === 'select' && selectedIds.length < 2) ||
                (step === 'chooseMaster' && !masterId)
              }
              className={step === 'preview' ? 'btn-primary' : 'btn-primary'}
            >
              {step === 'preview' ? '确认合并' : '下一步'}
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        )}

        {step === 'success' && (
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-center">
            <button onClick={handleClose} className="btn-primary">
              完成
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
