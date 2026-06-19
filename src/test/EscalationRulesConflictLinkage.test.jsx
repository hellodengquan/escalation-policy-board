import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EscalationRules from '../components/EscalationRules';
import PriorityConflictHint from '../components/PriorityConflictHint';
import App from '../App';
import { rules, ruleConflicts } from '../data/escalationData';

function getFilteredConflicts(timeScope) {
  if (timeScope === 'all') return ruleConflicts;
  return ruleConflicts.filter((conflict) =>
    conflict.ruleIds.some((ruleId) => {
      const rule = rules.find((r) => r.id === ruleId);
      return rule && (rule.timeScope === timeScope || rule.timeScope === 'all');
    })
  );
}

function findConflictCountText(timeScope) {
  const conflicts = getFilteredConflicts(timeScope);
  const text = screen.getByText((content, element) => {
    return element?.tagName === 'DIV' && content.includes('个相关冲突') && content.includes(String(conflicts.length));
  });
  return text;
}

describe('时间筛选联动与优先级冲突', () => {
  describe('EscalationRules 时间维度筛选', () => {
    it('默认显示全部时段的规则', () => {
      const setScope = vi.fn();
      render(<EscalationRules filterTimeScope="all" setFilterTimeScope={setScope} />);
      const allBtn = screen.getByRole('button', { name: /全部时段/ });
      expect(allBtn.className).toContain('ring-2');
    });

    it('切换到工作日时段过滤规则', async () => {
      const setScope = vi.fn();
      render(<EscalationRules filterTimeScope="all" setFilterTimeScope={setScope} />);
      const workdayBtn = screen.getByRole('button', { name: /工作日/ });
      await userEvent.click(workdayBtn);
      expect(setScope).toHaveBeenCalledWith('workday');
    });

    it('workday 时段下只显示 workday 和 all 的规则', () => {
      const setScope = vi.fn();
      render(<EscalationRules filterTimeScope="workday" setFilterTimeScope={setScope} />);
      const workdayRules = rules.filter(
        (r) => r.timeScope === 'workday' || r.timeScope === 'all'
      );
      workdayRules.forEach((rule) => {
        expect(screen.getByRole('heading', { name: rule.title })).toBeInTheDocument();
      });
      const filteredOut = rules.filter(
        (r) => r.timeScope !== 'workday' && r.timeScope !== 'all'
      );
      filteredOut.forEach((rule) => {
        expect(screen.queryByRole('heading', { name: rule.title })).not.toBeInTheDocument();
      });
    });

    it('night 时段下只显示夜间和通用规则', () => {
      const setScope = vi.fn();
      render(<EscalationRules filterTimeScope="night" setFilterTimeScope={setScope} />);
      const nightRules = rules.filter(
        (r) => r.timeScope === 'night' || r.timeScope === 'all'
      );
      nightRules.forEach((rule) => {
        expect(screen.getByRole('heading', { name: rule.title })).toBeInTheDocument();
      });
      expect(screen.queryByRole('heading', { name: '节假日快速响应' })).not.toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: '大促期间特殊升级' })).not.toBeInTheDocument();
    });

    it('promotion 时段下只显示大促和通用规则', () => {
      const setScope = vi.fn();
      render(<EscalationRules filterTimeScope="promotion" setFilterTimeScope={setScope} />);
      const promoRules = rules.filter(
        (r) => r.timeScope === 'promotion' || r.timeScope === 'all'
      );
      promoRules.forEach((rule) => {
        expect(screen.getByRole('heading', { name: rule.title })).toBeInTheDocument();
      });
      expect(screen.queryByRole('heading', { name: '夜间简化升级流程' })).not.toBeInTheDocument();
    });

    it('时段按钮显示匹配规则数', () => {
      const setScope = vi.fn();
      render(<EscalationRules filterTimeScope="all" setFilterTimeScope={setScope} />);
      const nightBtn = screen.getByRole('button', { name: /夜间/ });
      const nightCount = rules.filter(
        (r) => r.timeScope === 'night' || r.timeScope === 'all'
      ).length;
      expect(nightBtn.textContent).toContain(String(nightCount));
    });

    it('严重度筛选与时间维度叠加', async () => {
      const setScope = vi.fn();
      render(<EscalationRules filterTimeScope="promotion" setFilterTimeScope={setScope} />);
      const selects = screen.getAllByRole('combobox');
      const severitySelect = selects.find((s) =>
        within(s).getAllByRole('option').some((o) => o.textContent === '关键')
      );
      await userEvent.selectOptions(severitySelect, 'critical');
      const visibleCritical = rules.filter(
        (r) =>
          (r.timeScope === 'promotion' || r.timeScope === 'all') &&
          r.severity === 'critical'
      );
      visibleCritical.forEach((rule) => {
        expect(screen.getByRole('heading', { name: rule.title })).toBeInTheDocument();
      });
      const notVisible = rules.filter(
        (r) =>
          (r.timeScope === 'promotion' || r.timeScope === 'all') &&
          r.severity !== 'critical'
      );
      notVisible.forEach((rule) => {
        expect(screen.queryByRole('heading', { name: rule.title })).not.toBeInTheDocument();
      });
    });
  });

  describe('PriorityConflictHint 时间联动', () => {
    it('all 时段显示全部 5 个冲突', () => {
      render(<PriorityConflictHint filterTimeScope="all" />);
      const viewAllBtn = screen.getByRole('button', { name: /查看全部 5 个冲突/ });
      expect(viewAllBtn).toBeInTheDocument();
    });

    it('night 时段过滤冲突并显示正确数量', () => {
      render(<PriorityConflictHint filterTimeScope="night" />);
      const nightConflicts = getFilteredConflicts('night');
      expect(findConflictCountText('night')).toBeInTheDocument();
      expect(nightConflicts.length).toBeGreaterThan(0);
    });

    it('holiday 时段过滤冲突并显示正确数量', () => {
      render(<PriorityConflictHint filterTimeScope="holiday" />);
      const holidayConflicts = getFilteredConflicts('holiday');
      if (holidayConflicts.length > 0) {
        expect(findConflictCountText('holiday')).toBeInTheDocument();
      } else {
        expect(screen.getByText(/当前时段无策略冲突/)).toBeInTheDocument();
      }
    });

    it('非 all 时段显示联动状态栏', () => {
      render(<PriorityConflictHint filterTimeScope="night" />);
      expect(screen.getByText(/与时间筛选联动/)).toBeInTheDocument();
      expect(screen.getByText(/当前时段：夜间/)).toBeInTheDocument();
    });

    it('all 时段不显示联动状态栏', () => {
      render(<PriorityConflictHint filterTimeScope="all" />);
      expect(screen.queryByText(/与时间筛选联动/)).not.toBeInTheDocument();
    });

    it('无冲突时段显示绿色提示', () => {
      render(<PriorityConflictHint filterTimeScope="holiday" />);
      const holidayConflicts = getFilteredConflicts('holiday');
      if (holidayConflicts.length === 0) {
        expect(screen.getByText(/当前时段无策略冲突/)).toBeInTheDocument();
      } else {
        expect(findConflictCountText('holiday')).toBeInTheDocument();
      }
    });

    it('高优先级冲突数随时段过滤变化', () => {
      const { rerender } = render(<PriorityConflictHint filterTimeScope="all" />);
      const allHighCount = ruleConflicts.filter((c) => c.priority === 'high').length;
      expect(screen.getByText(new RegExp(`${allHighCount} 个高优`))).toBeInTheDocument();

      const nightConflicts = getFilteredConflicts('night');
      const nightHighCount = nightConflicts.filter((c) => c.priority === 'high').length;
      rerender(<PriorityConflictHint filterTimeScope="night" />);
      expect(screen.getByText(new RegExp(`${nightHighCount} 个高优`))).toBeInTheDocument();
    });

    it('冲突数显示正确', () => {
      render(<PriorityConflictHint filterTimeScope="night" />);
      expect(findConflictCountText('night')).toBeInTheDocument();
    });
  });

  describe('App 级联动：EscalationRules + PriorityConflictHint', () => {
    it('点击规则的时间筛选同步影响冲突提示', async () => {
      render(<App />);
      const nightBtn = screen.getByRole('button', { name: /^夜间/ });
      await userEvent.click(nightBtn);

      const nightRuleCount = rules.filter(
        (r) => r.timeScope === 'night' || r.timeScope === 'all'
      ).length;
      expect(nightBtn.textContent).toContain(String(nightRuleCount));
      expect(screen.getByText(/与时间筛选联动/)).toBeInTheDocument();
    });

    it('切换回全部时段恢复所有规则和冲突', async () => {
      render(<App />);
      const nightBtn = screen.getByRole('button', { name: /^夜间/ });
      await userEvent.click(nightBtn);

      const allBtn = screen.getByRole('button', { name: /全部时段/ });
      await userEvent.click(allBtn);

      const viewAllBtn = screen.getByRole('button', { name: /查看全部 5 个冲突/ });
      expect(viewAllBtn).toBeInTheDocument();
      rules.forEach((rule) => {
        expect(screen.getByRole('heading', { name: rule.title })).toBeInTheDocument();
      });
    });

    it('promotion 时段联动：规则和冲突同时过滤', async () => {
      render(<App />);
      const promoBtn = screen.getByRole('button', { name: /^大促期间/ });
      await userEvent.click(promoBtn);

      const promoRules = rules.filter(
        (r) => r.timeScope === 'promotion' || r.timeScope === 'all'
      );
      promoRules.forEach((rule) => {
        expect(screen.getByRole('heading', { name: rule.title })).toBeInTheDocument();
      });

      expect(screen.getByText(/与时间筛选联动/)).toBeInTheDocument();
      expect(screen.getByText(/当前时段：大促期间/)).toBeInTheDocument();
    });

    it('holiday 时段联动：可能显示无冲突', async () => {
      render(<App />);
      const holidayBtn = screen.getByRole('button', { name: /^节假日/ });
      await userEvent.click(holidayBtn);

      const holidayConflicts = getFilteredConflicts('holiday');
      if (holidayConflicts.length === 0) {
        expect(screen.getByText(/当前时段无策略冲突/)).toBeInTheDocument();
      } else {
        expect(screen.getByText(/与时间筛选联动/)).toBeInTheDocument();
      }
    });
  });
});
