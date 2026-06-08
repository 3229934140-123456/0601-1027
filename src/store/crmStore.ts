import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Lead, Customer, Contact, Opportunity, QuoteItem,
  Followup, Contract, Payment, AppSettings,
} from '../types';
import {
  mockLeads, mockCustomers, mockContacts, mockOpportunities,
  mockQuoteItems, mockFollowups, mockContracts, mockPayments,
} from '../data/mockData';
import { DEFAULT_FIELD_CONFIG } from '../constants';
import { generateId, getTodayString } from '../utils';

interface CRMState {
  leads: Lead[];
  customers: Customer[];
  contacts: Contact[];
  opportunities: Opportunity[];
  quoteItems: QuoteItem[];
  followups: Followup[];
  contracts: Contract[];
  payments: Payment[];
  settings: AppSettings;
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;

  addLead: (lead: Omit<Lead, 'id' | 'createdAt'>) => void;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  convertLeadToCustomer: (leadId: string) => { customerId: string; opportunityId: string } | null;

  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => string;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  mergeCustomers: (targetId: string, sourceIds: string[]) => void;
  markCustomerLost: (id: string, reason: string) => void;

  addContact: (contact: Omit<Contact, 'id'>) => void;
  updateContact: (id: string, updates: Partial<Contact>) => void;
  deleteContact: (id: string) => void;

  addOpportunity: (opp: Omit<Opportunity, 'id' | 'createdAt'>) => string;
  updateOpportunity: (id: string, updates: Partial<Opportunity>) => void;
  updateOpportunityStage: (id: string, stage: Opportunity['stage']) => void;
  deleteOpportunity: (id: string) => void;

  addQuoteItem: (item: Omit<QuoteItem, 'id'>) => void;
  updateQuoteItem: (id: string, updates: Partial<QuoteItem>) => void;
  deleteQuoteItem: (id: string) => void;

  addFollowup: (followup: Omit<Followup, 'id'>) => void;
  updateFollowup: (id: string, updates: Partial<Followup>) => void;
  deleteFollowup: (id: string) => void;

  addContract: (contract: Omit<Contract, 'id'>) => string;
  updateContract: (id: string, updates: Partial<Contract>) => void;
  deleteContract: (id: string) => void;
  createContractFromOpportunity: (opportunityId: string) => string | null;

  addPayment: (payment: Omit<Payment, 'id'>) => void;
  updatePayment: (id: string, updates: Partial<Payment>) => void;
  markPaymentPaid: (id: string) => void;
  deletePayment: (id: string) => void;

  updateSettings: (settings: Partial<AppSettings>) => void;
  updateFieldConfig: (module: keyof AppSettings['fieldConfig'], fields: string[]) => void;

  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  hideToast: () => void;

  importSampleData: () => void;
  resetData: () => void;
}

const initialSettings: AppSettings = {
  fieldConfig: { ...DEFAULT_FIELD_CONFIG },
};

export const useCRMStore = create<CRMState>()(
  persist(
    (set, get) => ({
      leads: mockLeads,
      customers: mockCustomers,
      contacts: mockContacts,
      opportunities: mockOpportunities,
      quoteItems: mockQuoteItems,
      followups: mockFollowups,
      contracts: mockContracts,
      payments: mockPayments,
      settings: initialSettings,
      toast: null,

      addLead: (lead) => {
        const newLead: Lead = {
          ...lead,
          id: generateId(),
          createdAt: getTodayString(),
        };
        set((state) => ({ leads: [newLead, ...state.leads] }));
        get().showToast('线索创建成功');
      },

      updateLead: (id, updates) => {
        set((state) => ({
          leads: state.leads.map((l) => (l.id === id ? { ...l, ...updates } : l)),
        }));
      },

      deleteLead: (id) => {
        set((state) => ({ leads: state.leads.filter((l) => l.id !== id) }));
        get().showToast('线索已删除');
      },

      convertLeadToCustomer: (leadId) => {
        const lead = get().leads.find((l) => l.id === leadId);
        if (!lead) return null;

        const customerId = generateId();
        const opportunityId = generateId();

        const newCustomer: Customer = {
          id: customerId,
          name: lead.companyName,
          industry: lead.industry,
          scale: 'small',
          address: '',
          status: 'active',
          owner: 'rep1',
          createdAt: getTodayString(),
        };

        const newContact: Contact = {
          id: generateId(),
          customerId,
          name: lead.contactName,
          position: '',
          phone: lead.phone,
          email: lead.email,
          isDecisionMaker: false,
        };

        const newOpportunity: Opportunity = {
          id: opportunityId,
          customerId,
          name: `${lead.companyName} - 初次合作`,
          stage: 'initial',
          amount: 0,
          winRate: 10,
          expectedCloseDate: '',
          owner: 'rep1',
          createdAt: getTodayString(),
        };

        const newFollowup: Followup = {
          id: generateId(),
          customerId,
          opportunityId,
          type: 'call',
          content: '线索转化，首次跟进',
          followDate: getTodayString(),
          owner: 'rep1',
        };

        set((state) => ({
          customers: [newCustomer, ...state.customers],
          contacts: [...state.contacts, newContact],
          opportunities: [newOpportunity, ...state.opportunities],
          followups: [newFollowup, ...state.followups],
          leads: state.leads.map((l) =>
            l.id === leadId ? { ...l, status: 'converted' } : l
          ),
        }));

        get().showToast('线索已转为客户');
        return { customerId, opportunityId };
      },

      addCustomer: (customer) => {
        const newCustomer: Customer = {
          ...customer,
          id: generateId(),
          createdAt: getTodayString(),
        };
        set((state) => ({ customers: [newCustomer, ...state.customers] }));
        get().showToast('客户创建成功');
        return newCustomer.id;
      },

      updateCustomer: (id, updates) => {
        set((state) => ({
          customers: state.customers.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        }));
      },

      deleteCustomer: (id) => {
        set((state) => ({
          customers: state.customers.filter((c) => c.id !== id),
          contacts: state.contacts.filter((c) => c.customerId !== id),
          opportunities: state.opportunities.filter((o) => o.customerId !== id),
          contracts: state.contracts.filter((c) => c.customerId !== id),
          followups: state.followups.filter((f) => f.customerId !== id),
        }));
        get().showToast('客户已删除');
      },

      mergeCustomers: (targetId, sourceIds) => {
        const { customers, contacts, opportunities, contracts, followups } = get();
        const targetCustomer = customers.find((c) => c.id === targetId);
        if (!targetCustomer) return;

        set((state) => ({
          contacts: state.contacts.map((c) =>
            sourceIds.includes(c.customerId) ? { ...c, customerId: targetId } : c
          ),
          opportunities: state.opportunities.map((o) =>
            sourceIds.includes(o.customerId) ? { ...o, customerId: targetId } : o
          ),
          contracts: state.contracts.map((c) =>
            sourceIds.includes(c.customerId) ? { ...c, customerId: targetId } : c
          ),
          followups: state.followups.map((f) =>
            sourceIds.includes(f.customerId) ? { ...f, customerId: targetId } : f
          ),
          customers: state.customers.filter((c) => !sourceIds.includes(c.id)),
        }));
        get().showToast(`已合并 ${sourceIds.length} 个客户`);
      },

      markCustomerLost: (id, reason) => {
        set((state) => ({
          customers: state.customers.map((c) =>
            c.id === id ? { ...c, status: 'lost', lostReason: reason, lostAt: getTodayString() } : c
          ),
        }));
        get().showToast('已标记客户流失');
      },

      addContact: (contact) => {
        const newContact: Contact = { ...contact, id: generateId() };
        set((state) => ({ contacts: [...state.contacts, newContact] }));
      },

      updateContact: (id, updates) => {
        set((state) => ({
          contacts: state.contacts.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        }));
      },

      deleteContact: (id) => {
        set((state) => ({ contacts: state.contacts.filter((c) => c.id !== id) }));
      },

      addOpportunity: (opp) => {
        const newOpp: Opportunity = {
          ...opp,
          id: generateId(),
          createdAt: getTodayString(),
        };
        set((state) => ({ opportunities: [newOpp, ...state.opportunities] }));
        get().showToast('商机创建成功');
        return newOpp.id;
      },

      updateOpportunity: (id, updates) => {
        set((state) => ({
          opportunities: state.opportunities.map((o) => (o.id === id ? { ...o, ...updates } : o)),
        }));
      },

      updateOpportunityStage: (id, stage) => {
        const stages = ['initial', 'requirement', 'proposal', 'negotiation', 'won', 'lost'];
        const stageIndex = stages.indexOf(stage);
        const winRates = [10, 25, 50, 75, 100, 0];
        
        set((state) => ({
          opportunities: state.opportunities.map((o) =>
            o.id === id ? { ...o, stage, winRate: winRates[stageIndex] } : o
          ),
        }));
        get().showToast('阶段已更新');
      },

      deleteOpportunity: (id) => {
        set((state) => ({
          opportunities: state.opportunities.filter((o) => o.id !== id),
          quoteItems: state.quoteItems.filter((q) => q.opportunityId !== id),
        }));
        get().showToast('商机已删除');
      },

      addQuoteItem: (item) => {
        const newItem: QuoteItem = { ...item, id: generateId() };
        set((state) => ({ quoteItems: [...state.quoteItems, newItem] }));
      },

      updateQuoteItem: (id, updates) => {
        set((state) => ({
          quoteItems: state.quoteItems.map((q) => (q.id === id ? { ...q, ...updates } : q)),
        }));
      },

      deleteQuoteItem: (id) => {
        set((state) => ({ quoteItems: state.quoteItems.filter((q) => q.id !== id) }));
      },

      addFollowup: (followup) => {
        const newFollowup: Followup = { ...followup, id: generateId() };
        set((state) => ({ followups: [newFollowup, ...state.followups] }));
        get().showToast('跟进记录已添加');
      },

      updateFollowup: (id, updates) => {
        set((state) => ({
          followups: state.followups.map((f) => (f.id === id ? { ...f, ...updates } : f)),
        }));
      },

      deleteFollowup: (id) => {
        set((state) => ({ followups: state.followups.filter((f) => f.id !== id) }));
      },

      addContract: (contract) => {
        const newContract: Contract = { ...contract, id: generateId() };
        set((state) => ({ contracts: [newContract, ...state.contracts] }));
        get().showToast('合同创建成功');
        return newContract.id;
      },

      createContractFromOpportunity: (opportunityId) => {
        const { opportunities, customers, quoteItems } = get();
        const opportunity = opportunities.find((o) => o.id === opportunityId);
        if (!opportunity) return null;

        const customer = customers.find((c) => c.id === opportunity.customerId);
        if (!customer) return null;

        const oppQuoteItems = quoteItems.filter((q) => q.opportunityId === opportunityId);
        const quoteTotal = oppQuoteItems.reduce(
          (sum, item) => sum + item.quantity * item.unitPrice,
          0
        );

        const contractNo = `HT${new Date().getFullYear()}${String(
          new Date().getMonth() + 1
        ).padStart(2, '0')}${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;

        const newContract: Contract = {
          id: generateId(),
          customerId: opportunity.customerId,
          opportunityId: opportunityId,
          contractNo,
          name: `${opportunity.name} - 销售合同`,
          amount: quoteTotal > 0 ? quoteTotal : opportunity.amount,
          signDate: getTodayString(),
          status: 'pending',
          owner: opportunity.owner,
          remarks: `由商机「${opportunity.name}」生成的合同草稿`,
        };

        set((state) => ({ contracts: [newContract, ...state.contracts] }));
        get().showToast('合同草稿已生成');
        return newContract.id;
      },

      updateContract: (id, updates) => {
        set((state) => ({
          contracts: state.contracts.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        }));
      },

      deleteContract: (id) => {
        set((state) => ({
          contracts: state.contracts.filter((c) => c.id !== id),
          payments: state.payments.filter((p) => p.contractId !== id),
        }));
        get().showToast('合同已删除');
      },

      addPayment: (payment) => {
        const newPayment: Payment = { ...payment, id: generateId() };
        set((state) => ({ payments: [...state.payments, newPayment] }));
      },

      updatePayment: (id, updates) => {
        set((state) => ({
          payments: state.payments.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        }));
      },

      markPaymentPaid: (id) => {
        set((state) => ({
          payments: state.payments.map((p) =>
            p.id === id ? { ...p, status: 'paid', paidDate: getTodayString() } : p
          ),
        }));
        get().showToast('已标记回款');
      },

      deletePayment: (id) => {
        set((state) => ({ payments: state.payments.filter((p) => p.id !== id) }));
      },

      updateSettings: (settings) => {
        set((state) => ({ settings: { ...state.settings, ...settings } }));
      },

      updateFieldConfig: (module, fields) => {
        set((state) => ({
          settings: {
            ...state.settings,
            fieldConfig: { ...state.settings.fieldConfig, [module]: fields },
          },
        }));
        get().showToast('字段配置已保存');
      },

      showToast: (message, type = 'success') => {
        set({ toast: { message, type } });
        setTimeout(() => set({ toast: null }), 3000);
      },

      hideToast: () => set({ toast: null }),

      importSampleData: () => {
        set({
          leads: mockLeads,
          customers: mockCustomers,
          contacts: mockContacts,
          opportunities: mockOpportunities,
          quoteItems: mockQuoteItems,
          followups: mockFollowups,
          contracts: mockContracts,
          payments: mockPayments,
        });
        get().showToast('示例数据导入成功');
      },

      resetData: () => {
        set({
          leads: [],
          customers: [],
          contacts: [],
          opportunities: [],
          quoteItems: [],
          followups: [],
          contracts: [],
          payments: [],
          settings: initialSettings,
        });
        get().showToast('演示环境已重置');
      },
    }),
    {
      name: 'crm-demo-storage',
    }
  )
);
