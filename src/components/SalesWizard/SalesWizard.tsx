import { useState } from 'react';
import {
  X, ChevronRight, ChevronLeft, Check, UserPlus, Users,
  Target, FileText, DollarSign, TrendingUp, Play, RotateCcw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface WizardStep {
  id: string;
  title: string;
  description: string;
  path: string;
  icon: React.ReactNode;
  tip: string;
}

interface SalesWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

const wizardSteps: WizardStep[] = [
  {
    id: 'lead',
    title: '第1步：选择线索',
    description: '从线索池中选择一条线索开始销售流程',
    path: '/leads',
    icon: <UserPlus className="w-5 h-5" />,
    tip: '提示：点击线索列表中的"转为客户"按钮可将线索转化为客户',
  },
  {
    id: 'convert',
    title: '第2步：线索转客户',
    description: '将线索转化为客户，系统自动创建关联商和联系人',
    path: '/leads',
    icon: <Users className="w-5 h-5" />,
    tip: '提示：转化后会自动跳转到客户档案页面，可查看新创建的客户',
  },
  {
    id: 'contact',
    title: '第3步：补充联系人',
    description: '在客户档案中完善联系人信息，标记决策人',
    path: '/customers',
    icon: <Users className="w-5 h-5" />,
    tip: '提示：在客户详情的"联系人"标签页中可以添加和管理联系人',
  },
  {
    id: 'opportunity',
    title: '第4步：创建商机',
    description: '为客户创建新的销售商机，填写预计金额和赢率',
    path: '/opportunities',
    icon: <Target className="w-5 h-5" />,
    tip: '提示：商机阶段从"初步接触"开始，可逐步推进到"赢单"或"输单"',
  },
  {
    id: 'quote',
    title: '第5步：添加报价清单',
    description: '在商机详情中添加产品报价，形成完整的报价方案',
    path: '/opportunities',
    icon: <FileText className="w-5 h-5" />,
    tip: '提示：在商机详情的"报价清单"标签页中添加报价项',
  },
  {
    id: 'win',
    title: '第6步：赢单生成合同',
    description: '将商机推进到"赢单"阶段，一键生成合同草稿',
    path: '/opportunities',
    icon: <TrendingUp className="w-5 h-5" />,
    tip: '提示：赢单后点击"生成合同"按钮，可快速从商机创建合同草稿',
  },
  {
    id: 'payment',
    title: '第7步：登记回款',
    description: '在合同中添加回款计划，登记实际回款情况',
    path: '/contracts',
    icon: <DollarSign className="w-5 h-5" />,
    tip: '提示：点击"标记回款"可记录已收到的款项，实时更新回款进度',
  },
];

export default function SalesWizard({ isOpen, onClose }: SalesWizardProps) {
  const navigate = useNavigate();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const currentStep = wizardSteps[currentStepIndex];
  const isLastStep = currentStepIndex === wizardSteps.length - 1;
  const isFirstStep = currentStepIndex === 0;

  const handleGoToPage = () => {
    navigate(currentStep.path);
  };

  const handleNext = () => {
    if (!completedSteps.includes(currentStep.id)) {
      setCompletedSteps([...completedSteps, currentStep.id]);
    }
    if (!isLastStep) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleStepClick = (index: number) => {
    setCurrentStepIndex(index);
  };

  const handleReset = () => {
    setCurrentStepIndex(0);
    setCompletedSteps([]);
  };

  const handleMarkComplete = () => {
    if (!completedSteps.includes(currentStep.id)) {
      setCompletedSteps([...completedSteps, currentStep.id]);
    }
    if (!isLastStep) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-white shadow-2xl overflow-hidden animate-slide-in-right flex flex-col h-full">
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Play className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">销售流程演示向导</h2>
                <p className="text-primary-100 text-sm">按步骤学习完整销售流程</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-4 flex items-center gap-2">
            {wizardSteps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => handleStepClick(index)}
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                    index === currentStepIndex
                      ? 'bg-white text-primary-600 scale-110'
                      : completedSteps.includes(step.id)
                      ? 'bg-emerald-400 text-white'
                      : 'bg-white/30 text-white/70'
                  }`}
                >
                  {completedSteps.includes(step.id) ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </button>
                {index < wizardSteps.length - 1 && (
                  <div
                    className={`w-6 h-0.5 mx-1 ${
                      completedSteps.includes(step.id)
                        ? 'bg-emerald-400'
                        : 'bg-white/30'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600">
                {currentStep.icon}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800">
                  {currentStep.title}
                </h3>
                <p className="text-sm text-slate-500">
                  进度：{completedSteps.length} / {wizardSteps.length} 步
                </p>
              </div>
            </div>

            <p className="text-slate-600 mb-4">{currentStep.description}</p>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <p className="text-sm text-blue-700">{currentStep.tip}</p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium text-slate-700 mb-3">全部步骤</h4>
            {wizardSteps.map((step, index) => {
              const isCompleted = completedSteps.includes(step.id);
              const isCurrent = index === currentStepIndex;
              return (
                <button
                  key={step.id}
                  onClick={() => handleStepClick(index)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                    isCurrent
                      ? 'bg-primary-50 border border-primary-200'
                      : 'hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
                      isCompleted
                        ? 'bg-emerald-500 text-white'
                        : isCurrent
                        ? 'bg-primary-500 text-white'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium ${
                        isCurrent ? 'text-primary-700' : 'text-slate-700'
                      }`}
                    >
                      {step.title.replace(/第\d+步：/, '')}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {step.description}
                    </p>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 flex-shrink-0 ${
                      isCurrent ? 'text-primary-400' : 'text-slate-300'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="btn-secondary flex-1"
            >
              <RotateCcw className="w-4 h-4 mr-1.5" />
              重置
            </button>
            {!isLastStep ? (
              <button
                onClick={handleMarkComplete}
                className="btn-primary flex-1"
              >
                标记完成 <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="btn-primary flex-1"
              >
                <Check className="w-4 h-4 mr-1.5" />
                完成演示
              </button>
            )}
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handlePrev}
              disabled={isFirstStep}
              className="btn-secondary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              上一步
            </button>
            <button
              onClick={handleGoToPage}
              className="btn-primary flex-1"
            >
              前往操作
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
