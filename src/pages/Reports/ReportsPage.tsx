import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, Legend
} from 'recharts';
import { Users, UserSquare2, Target, FileText, TrendingUp, DollarSign, Award } from 'lucide-react';
import { useCRMStore } from '../../store/crmStore';
import { OPPORTUNITY_STAGES, SALES_REPS, LEAD_SOURCES, INDUSTRIES } from '../../constants';
import { formatCurrency, getLabelByValue } from '../../utils';
import PageHeader from '../../components/UI/PageHeader';
import StatCard from '../../components/UI/StatCard';

export default function ReportsPage() {
  const { leads, customers, opportunities, contracts } = useCRMStore();

  const funnelData = useMemo(() => {
    return OPPORTUNITY_STAGES
      .filter(s => s.value !== 'won' && s.value !== 'lost')
      .map((stage) => {
        const stageOpps = opportunities.filter((o) => o.stage === stage.value);
        const totalAmount = stageOpps.reduce((sum, o) => sum + o.amount, 0);
        return {
          name: stage.label,
          value: stageOpps.length,
          amount: totalAmount,
          winRate: stage.winRate,
        };
      });
  }, [opportunities]);

  const salesRepData = useMemo(() => {
    return SALES_REPS.map((rep) => {
      const repOpps = opportunities.filter((o) => o.owner === rep.id);
      const wonOpps = repOpps.filter((o) => o.stage === 'won');
      const wonAmount = wonOpps.reduce((sum, o) => sum + o.amount, 0);
      const repContracts = contracts.filter((c) => c.owner === rep.id);
      const contractAmount = repContracts.reduce((sum, c) => sum + c.amount, 0);

      return {
        name: rep.name,
        wonAmount,
        contractAmount,
        opportunityCount: repOpps.length,
        wonCount: wonOpps.length,
      };
    }).sort((a, b) => b.wonAmount - a.wonAmount);
  }, [opportunities, contracts]);

  const leadSourceData = useMemo(() => {
    return LEAD_SOURCES.map((source) => ({
      name: source.label,
      value: leads.filter((l) => l.source === source.value).length,
    })).filter((d) => d.value > 0);
  }, [leads]);

  const industryData = useMemo(() => {
    return INDUSTRIES.map((industry) => {
      const custCount = customers.filter((c) => c.industry === industry.value).length;
      const oppCount = opportunities.filter((o) => {
        const customer = customers.find((c) => c.id === o.customerId);
        return customer?.industry === industry.value;
      }).length;
      return {
        name: industry.label,
        customers: custCount,
        opportunities: oppCount,
      };
    }).filter((d) => d.customers > 0 || d.opportunities > 0);
  }, [customers, opportunities]);

  const totalLeads = leads.length;
  const totalCustomers = customers.length;
  const totalOpportunities = opportunities.filter(o => o.stage !== 'won' && o.stage !== 'lost').length;
  const totalContracts = contracts.length;
  const wonAmount = opportunities.filter(o => o.stage === 'won').reduce((s, o) => s + o.amount, 0);
  const pipelineAmount = opportunities.filter(o => o.stage !== 'won' && o.stage !== 'lost').reduce((s, o) => s + o.amount, 0);

  const BAR_COLORS = ['#2563eb', '#059669', '#d97706', '#7c3aed', '#e11d48', '#0891b2', '#65a30d'];

  return (
    <div>
      <PageHeader
        title="报表分析"
        description="销售数据统计与分析"
      />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <StatCard
          title="线索总数"
          value={totalLeads}
          icon={<Users className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          title="客户总数"
          value={totalCustomers}
          icon={<UserSquare2 className="w-5 h-5" />}
          color="green"
        />
        <StatCard
          title="活跃商机"
          value={totalOpportunities}
          icon={<Target className="w-5 h-5" />}
          color="purple"
        />
        <StatCard
          title="合同总数"
          value={totalContracts}
          icon={<FileText className="w-5 h-5" />}
          color="amber"
        />
        <StatCard
          title="已赢单金额"
          value={formatCurrency(wonAmount)}
          icon={<DollarSign className="w-5 h-5" />}
          color="green"
        />
        <StatCard
          title="管道金额"
          value={formatCurrency(pipelineAmount)}
          icon={<TrendingUp className="w-5 h-5" />}
          color="blue"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary-600" />
            销售漏斗
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={funnelData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={80} />
                <Tooltip
                  formatter={(value: any, name: any, props: any) => [
                    <div key="tooltip">
                      <p>数量：{props.payload.value} 个</p>
                      <p>金额：{formatCurrency(props.payload.amount)}</p>
                      <p>赢率：{props.payload.winRate}%</p>
                    </div>,
                    props.payload.name,
                  ]}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            销售业绩排行
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={salesRepData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="wonAmount" name="赢单金额" fill="#059669" radius={[4, 4, 0, 0]} />
                <Bar dataKey="contractAmount" name="合同金额" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="font-semibold text-slate-800 mb-4">线索来源分布</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={leadSourceData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" name="线索数" fill="#7c3aed" radius={[4, 4, 0, 0]}>
                  {leadSourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-slate-800 mb-4">行业分布</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={industryData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="customers" name="客户数" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="opportunities" name="商机数" fill="#059669" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card p-5 mt-6">
        <h3 className="font-semibold text-slate-800 mb-4">销售员工业绩详情</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">排名</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">销售</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-slate-500 uppercase">商机数</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-slate-500 uppercase">赢单数</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-slate-500 uppercase">赢单金额</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-slate-500 uppercase">合同金额</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-slate-500 uppercase">赢率</th>
              </tr>
            </thead>
            <tbody>
              {salesRepData.map((rep, index) => (
                <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4">
                    {index === 0 && <span className="text-amber-500 font-bold">🥇</span>}
                    {index === 1 && <span className="text-slate-400 font-bold">🥈</span>}
                    {index === 2 && <span className="text-amber-700 font-bold">🥉</span>}
                    {index > 2 && <span className="text-slate-400">{index + 1}</span>}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-800">{rep.name}</td>
                  <td className="py-3 px-4 text-right text-slate-600">{rep.opportunityCount}</td>
                  <td className="py-3 px-4 text-right text-slate-600">{rep.wonCount}</td>
                  <td className="py-3 px-4 text-right font-medium text-emerald-600">
                    {formatCurrency(rep.wonAmount)}
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-primary-600">
                    {formatCurrency(rep.contractAmount)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-slate-600">
                      {rep.opportunityCount > 0
                        ? Math.round((rep.wonCount / rep.opportunityCount) * 100)
                        : 0}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
