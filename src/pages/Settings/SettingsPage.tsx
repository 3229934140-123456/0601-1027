import { useState } from 'react';
import { Settings, Database, RefreshCw, ListChecks, Download, AlertTriangle } from 'lucide-react';
import { useCRMStore } from '../../store/crmStore';
import { FIELD_CONFIG_OPTIONS } from '../../constants';
import PageHeader from '../../components/UI/PageHeader';
import ConfirmDialog from '../../components/UI/ConfirmDialog';

export default function SettingsPage() {
  const { settings, updateFieldConfig, importSampleData, resetData } = useCRMStore();
  const [activeTab, setActiveTab] = useState('fields');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showImportConfirm, setShowImportConfirm] = useState(false);

  const handleFieldToggle = (module: keyof typeof settings.fieldConfig, fieldKey: string) => {
    const currentFields = settings.fieldConfig[module];
    let newFields: string[];
    if (currentFields.includes(fieldKey)) {
      newFields = currentFields.filter((f) => f !== fieldKey);
    } else {
      newFields = [...currentFields, fieldKey];
    }
    updateFieldConfig(module, newFields);
  };

  return (
    <div className="max-w-4xl">
      <PageHeader
        title="系统设置"
        description="配置演示系统参数"
      />

      <div className="flex gap-1 border-b border-slate-200 mb-6">
        <button
          onClick={() => setActiveTab('fields')}
          className={`px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors flex items-center gap-2 ${
            activeTab === 'fields'
              ? 'text-primary-600 border-primary-600'
              : 'text-slate-500 border-transparent hover:text-slate-700'
          }`}
        >
          <ListChecks className="w-4 h-4" />
          字段显示配置
        </button>
        <button
          onClick={() => setActiveTab('data')}
          className={`px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors flex items-center gap-2 ${
            activeTab === 'data'
              ? 'text-primary-600 border-primary-600'
              : 'text-slate-500 border-transparent hover:text-slate-700'
          }`}
        >
          <Database className="w-4 h-4" />
          数据管理
        </button>
      </div>

      {activeTab === 'fields' && (
        <div className="space-y-6">
          {Object.entries(FIELD_CONFIG_OPTIONS).map(([module, fields]) => (
            <div key={module} className="card p-5">
              <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Settings className="w-4 h-4 text-primary-600" />
                {getModuleLabel(module)}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {fields.map((field) => {
                  const isChecked = settings.fieldConfig[module as keyof typeof settings.fieldConfig].includes(field.key);
                  return (
                    <label
                      key={field.key}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        isChecked
                          ? 'border-primary-300 bg-primary-50'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        isChecked ? 'bg-primary-600 border-primary-600' : 'border-slate-300'
                      }`}>
                        {isChecked && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleFieldToggle(module as keyof typeof settings.fieldConfig, field.key)}
                        className="sr-only"
                      />
                      <span className="text-sm text-slate-700">{field.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'data' && (
        <div className="space-y-4">
          <div className="card p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <Download className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">导入示例数据</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    一键导入预设的示例数据，用于演示和培训场景。包含线索、客户、商机、合同等完整数据。
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowImportConfirm(true)}
                className="btn-primary"
              >
                导入数据
              </button>
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center">
                  <RefreshCw className="w-6 h-6 text-rose-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">重置演示环境</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    清空所有数据，将系统恢复到初始空状态。此操作不可撤销。
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowResetConfirm(true)}
                className="btn-danger"
              >
                重置环境
              </button>
            </div>
          </div>

          <div className="card p-5 bg-amber-50 border-amber-200">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-800">温馨提示</h3>
                <ul className="text-sm text-amber-700 mt-2 space-y-1">
                  <li>• 本系统为演示用途，所有数据存储在浏览器本地</li>
                  <li>• 清除浏览器缓存会导致数据丢失</li>
                  <li>• 建议定期使用"导入示例数据"恢复标准演示数据</li>
                  <li>• 培训结束后可使用"重置演示环境"清空数据</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={showImportConfirm}
        onClose={() => setShowImportConfirm(false)}
        onConfirm={() => {
          importSampleData();
          setShowImportConfirm(false);
        }}
        title="导入示例数据"
        message="确定要导入示例数据吗？现有数据将被覆盖。"
        confirmText="确认导入"
        type="warning"
      />

      <ConfirmDialog
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={() => {
          resetData();
          setShowResetConfirm(false);
        }}
        title="重置演示环境"
        message="确定要重置演示环境吗？所有数据将被清空且无法恢复。"
        confirmText="确认重置"
        type="danger"
      />
    </div>
  );
}

function getModuleLabel(module: string): string {
  const labels: Record<string, string> = {
    leads: '线索池字段',
    customers: '客户档案字段',
    opportunities: '商机管理字段',
    contracts: '合同管理字段',
  };
  return labels[module] || module;
}
