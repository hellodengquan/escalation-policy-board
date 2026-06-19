import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, within, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HandlingRecords from '../components/HandlingRecords';

describe('HandlingRecords', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  function getDateInputs(container) {
    return container.querySelectorAll('input[type="date"]');
  }

  describe('搜索复合过滤', () => {
    it('单关键词搜索：按标题匹配', async () => {
      render(<HandlingRecords />);
      const input = screen.getByPlaceholderText(/多关键词搜索/);
      await userEvent.type(input, '支付');
      expect(screen.getByRole('heading', { name: '支付网关响应超时' })).toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: '数据库主从延迟告警' })).not.toBeInTheDocument();
    });

    it('单关键词搜索：按工单 ID 匹配', async () => {
      render(<HandlingRecords />);
      const input = screen.getByPlaceholderText(/多关键词搜索/);
      await userEvent.type(input, '015');
      expect(screen.getByRole('heading', { name: '核心交易系统数据不一致' })).toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: '支付网关响应超时' })).not.toBeInTheDocument();
    });

    it('单关键词搜索：按处理人匹配', async () => {
      render(<HandlingRecords />);
      const input = screen.getByPlaceholderText(/多关键词搜索/);
      await userEvent.type(input, '赵工');
      expect(screen.getByRole('heading', { name: '数据库主从延迟告警' })).toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: 'CDN 部分节点异常' })).not.toBeInTheDocument();
    });

    it('单关键词搜索：按操作记录匹配', async () => {
      render(<HandlingRecords />);
      const input = screen.getByPlaceholderText(/多关键词搜索/);
      await userEvent.type(input, '短信');
      expect(screen.getByRole('heading', { name: '用户登录验证码发送失败' })).toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: '支付网关响应超时' })).not.toBeInTheDocument();
    });

    it('多关键词 AND 匹配：空格分隔', async () => {
      render(<HandlingRecords />);
      const input = screen.getByPlaceholderText(/多关键词搜索/);
      await userEvent.type(input, '支付 超时');
      expect(screen.getByRole('heading', { name: '支付网关响应超时' })).toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: 'CDN 部分节点异常' })).not.toBeInTheDocument();
    });

    it('多关键词 AND 匹配：两个关键词同时存在于同一条记录', async () => {
      render(<HandlingRecords />);
      const input = screen.getByPlaceholderText(/多关键词搜索/);
      await userEvent.type(input, '张三 告警');
      expect(screen.getByRole('heading', { name: 'CDN 部分节点异常' })).toBeInTheDocument();
    });

    it('多关键词 AND 匹配：不匹配只包含部分关键词的记录', async () => {
      render(<HandlingRecords />);
      const input = screen.getByPlaceholderText(/多关键词搜索/);
      await userEvent.type(input, '支付 数据库');
      expect(screen.getByText(/暂无符合条件的记录/)).toBeInTheDocument();
    });

    it('关键词标签展示与单独删除', async () => {
      render(<HandlingRecords />);
      const input = screen.getByPlaceholderText(/多关键词搜索/);
      await userEvent.type(input, '支付 超时');
      const tags = screen.getAllByText(/^(支付|超时)$/);
      expect(tags.length).toBe(2);
      const firstTag = tags[0];
      const deleteBtn = firstTag.parentElement.querySelector('button');
      await userEvent.click(deleteBtn);
      const remainingTags = screen.getAllByText(/^(支付|超时)$/);
      expect(remainingTags.length).toBe(1);
    });

    it('搜索 + 状态筛选组合过滤', async () => {
      render(<HandlingRecords />);
      const input = screen.getByPlaceholderText(/多关键词搜索/);
      await userEvent.type(input, '张三');
      const selects = screen.getAllByRole('combobox');
      const statusSelect = selects.find((s) =>
        within(s).getAllByRole('option').some((o) => o.textContent === '处理中')
      );
      await userEvent.selectOptions(statusSelect, 'resolved');
      expect(screen.queryByRole('heading', { name: 'CDN 部分节点异常' })).not.toBeInTheDocument();
      expect(screen.getByRole('heading', { name: '数据库主从延迟告警' })).toBeInTheDocument();
    });

    it('搜索 + 等级组合过滤', async () => {
      render(<HandlingRecords />);
      const input = screen.getByPlaceholderText(/多关键词搜索/);
      await userEvent.type(input, '张三');
      const selects = screen.getAllByRole('combobox');
      const severitySelect = selects.find((s) =>
        within(s).getAllByRole('option').some((o) => o.textContent === 'P3 一般')
      );
      await userEvent.selectOptions(severitySelect, 'P3');
      expect(screen.getByRole('heading', { name: 'CDN 部分节点异常' })).toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: '支付网关响应超时' })).not.toBeInTheDocument();
    });

    it('高级搜索展开后显示日期范围输入框', async () => {
      const { container } = render(<HandlingRecords />);
      const advancedBtn = screen.getByRole('button', { name: /高级搜索/ });
      await userEvent.click(advancedBtn);
      const dateInputs = getDateInputs(container);
      expect(dateInputs.length).toBe(2);
    });

    it('日期范围筛选：起始日期', async () => {
      const { container } = render(<HandlingRecords />);
      const advancedBtn = screen.getByRole('button', { name: /高级搜索/ });
      await userEvent.click(advancedBtn);
      const dateInputs = getDateInputs(container);
      await userEvent.type(dateInputs[0], '2026-06-19');
      const headings = screen.getAllByRole('heading').filter((h) =>
        h.textContent.match(/支付网关|用户登录|数据库|CDN/)
      );
      expect(headings.length).toBe(4);
    });

    it('日期范围筛选：结束日期排除更晚记录', async () => {
      const { container } = render(<HandlingRecords />);
      const advancedBtn = screen.getByRole('button', { name: /高级搜索/ });
      await userEvent.click(advancedBtn);
      const dateInputs = getDateInputs(container);
      await userEvent.type(dateInputs[1], '2026-06-18');
      expect(screen.queryByRole('heading', { name: '支付网关响应超时' })).not.toBeInTheDocument();
      expect(screen.getByRole('heading', { name: '核心交易系统数据不一致' })).toBeInTheDocument();
    });

    it('日期范围 + 关键词组合筛选', async () => {
      const { container } = render(<HandlingRecords />);
      const input = screen.getByPlaceholderText(/多关键词搜索/);
      await userEvent.type(input, '张三');
      const advancedBtn = screen.getByRole('button', { name: /高级搜索/ });
      await userEvent.click(advancedBtn);
      const dateInputs = getDateInputs(container);
      await userEvent.type(dateInputs[1], '2026-06-18');
      expect(screen.queryByRole('heading', { name: 'CDN 部分节点异常' })).not.toBeInTheDocument();
    });
  });

  describe('CSV 导出', () => {
    it('导出按钮存在并显示当前记录数', () => {
      render(<HandlingRecords />);
      const exportBtn = screen.getByRole('button', { name: /导出 CSV/ });
      expect(exportBtn).toBeInTheDocument();
      expect(exportBtn.textContent).toContain('5');
    });

    it('筛选后导出数量随筛选结果变化', async () => {
      render(<HandlingRecords />);
      const input = screen.getByPlaceholderText(/多关键词搜索/);
      await userEvent.type(input, '支付');
      const exportBtn = screen.getByRole('button', { name: /导出 CSV/ });
      expect(exportBtn.textContent).toContain('1');
    });

    it('导出按钮点击后触发 Blob 创建与下载', async () => {
      render(<HandlingRecords />);

      const createObjectURLSpy = vi.fn(() => 'blob:export-test-url');
      const revokeObjectURLSpy = vi.fn();
      vi.stubGlobal('URL', {
        createObjectURL: createObjectURLSpy,
        revokeObjectURL: revokeObjectURLSpy,
      });

      let capturedLink = null;
      const appendSpy = vi.spyOn(document.body, 'appendChild').mockImplementation((el) => {
        capturedLink = el;
        return el;
      });
      const removeSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => null);

      await userEvent.click(screen.getByRole('button', { name: /导出 CSV/ }));

      expect(createObjectURLSpy).toHaveBeenCalledTimes(1);
      expect(appendSpy).toHaveBeenCalledTimes(1);
      expect(removeSpy).toHaveBeenCalledTimes(1);
      expect(capturedLink).not.toBeNull();
      expect(capturedLink.href).toBe('blob:export-test-url');
      expect(capturedLink.download).toMatch(/升级处理记录_.*\.csv/);

      appendSpy.mockRestore();
      removeSpy.mockRestore();
      vi.unstubAllGlobals();
    });

    it('CSV 导出内容包含原始触发链和解决时间字段', async () => {
      render(<HandlingRecords />);

      let capturedParts = null;
      let capturedOptions = null;
      const origBlob = global.Blob;
      vi.stubGlobal('Blob', class MockBlob {
        constructor(parts, options) {
          capturedParts = parts;
          capturedOptions = options;
        }
      });
      vi.stubGlobal('URL', {
        createObjectURL: vi.fn(() => 'blob:test-url'),
        revokeObjectURL: vi.fn(),
      });
      vi.spyOn(document.body, 'appendChild').mockImplementation((el) => {
        if (el.click) el.click();
        return el;
      });
      vi.spyOn(document.body, 'removeChild').mockImplementation(() => null);

      await userEvent.click(screen.getByRole('button', { name: /导出 CSV/ }));

      expect(capturedParts).not.toBeNull();
      expect(capturedOptions.type).toBe('text/csv;charset=utf-8;');
      const csvContent = capturedParts[0];
      expect(csvContent.charCodeAt(0)).toBe(0xFEFF);
      const headerLine = csvContent.split('\n')[0];
      expect(headerLine).toContain('原始触发链');
      expect(headerLine).toContain('解决时间');
      expect(headerLine).toContain('下一步建议');

      vi.stubGlobal('Blob', origBlob);
      vi.unstubAllGlobals();
      document.body.appendChild.mockRestore();
      document.body.removeChild.mockRestore();
    });

    it('CSV 触发链包含完整的操作步骤信息', async () => {
      render(<HandlingRecords />);

      let capturedParts = null;
      const origBlob = global.Blob;
      vi.stubGlobal('Blob', class MockBlob {
        constructor(parts) {
          capturedParts = parts;
        }
      });
      vi.stubGlobal('URL', {
        createObjectURL: vi.fn(() => 'blob:test'),
        revokeObjectURL: vi.fn(),
      });
      vi.spyOn(document.body, 'appendChild').mockImplementation((el) => {
        if (el.click) el.click();
        return el;
      });
      vi.spyOn(document.body, 'removeChild').mockImplementation(() => null);

      await userEvent.click(screen.getByRole('button', { name: /导出 CSV/ }));

      const csvContent = capturedParts[0];
      const lines = csvContent.split('\n');
      const dataLine = lines.find((l) => l.includes('INC-20260619-001'));
      expect(dataLine).toBeDefined();
      expect(dataLine).toContain('张三');
      expect(dataLine).toContain('L1');
      expect(dataLine).toContain('L2');

      vi.stubGlobal('Blob', origBlob);
      vi.unstubAllGlobals();
      document.body.appendChild.mockRestore();
      document.body.removeChild.mockRestore();
    });
  });

  describe('边界场景', () => {
    it('空搜索结果：显示空状态提示', async () => {
      render(<HandlingRecords />);
      const input = screen.getByPlaceholderText(/多关键词搜索/);
      await userEvent.type(input, '不存在的关键词xyz');
      expect(screen.getByText(/暂无符合条件的记录/)).toBeInTheDocument();
    });

    it('空搜索结果：提供清除筛选链接', async () => {
      render(<HandlingRecords />);
      const input = screen.getByPlaceholderText(/多关键词搜索/);
      await userEvent.type(input, '不存在的关键词xyz');
      expect(screen.getByRole('button', { name: /清除所有筛选条件/ })).toBeInTheDocument();
    });

    it('清除筛选按钮：一键重置所有筛选条件', async () => {
      render(<HandlingRecords />);
      const input = screen.getByPlaceholderText(/多关键词搜索/);
      await userEvent.type(input, '支付');
      const clearBtn = screen.getByRole('button', { name: /清除筛选/ });
      await userEvent.click(clearBtn);
      expect(screen.getByRole('heading', { name: '数据库主从延迟告警' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'CDN 部分节点异常' })).toBeInTheDocument();
    });

    it('多条件叠加：等级 + 状态 + 关键词同时过滤', async () => {
      render(<HandlingRecords />);
      const input = screen.getByPlaceholderText(/多关键词搜索/);
      await userEvent.type(input, '张三');

      const selects = screen.getAllByRole('combobox');
      const severitySelect = selects.find((s) =>
        within(s).getAllByRole('option').some((o) => o.textContent === 'P2 重要')
      );
      await userEvent.selectOptions(severitySelect, 'P2');
      const statusSelect = selects.find((s) =>
        within(s).getAllByRole('option').some((o) => o.textContent === '处理中')
      );
      await userEvent.selectOptions(statusSelect, 'resolved');

      expect(screen.getByRole('heading', { name: '数据库主从延迟告警' })).toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: '支付网关响应超时' })).not.toBeInTheDocument();
    });

    it('多条件叠加至空集', async () => {
      render(<HandlingRecords />);
      const selects = screen.getAllByRole('combobox');
      const severitySelect = selects.find((s) =>
        within(s).getAllByRole('option').some((o) => o.textContent === 'P0 致命')
      );
      await userEvent.selectOptions(severitySelect, 'P0');
      const statusSelect = selects.find((s) =>
        within(s).getAllByRole('option').some((o) => o.textContent === '处理中')
      );
      await userEvent.selectOptions(statusSelect, 'handling');
      expect(screen.getByText(/暂无符合条件的记录/)).toBeInTheDocument();
    });

    it('所有筛选条件恢复默认后记录完整', async () => {
      render(<HandlingRecords />);
      const selects = screen.getAllByRole('combobox');
      const severitySelect = selects.find((s) =>
        within(s).getAllByRole('option').some((o) => o.textContent === 'P0 致命')
      );
      await userEvent.selectOptions(severitySelect, 'P0');
      expect(screen.queryByRole('heading', { name: '支付网关响应超时' })).not.toBeInTheDocument();
      await userEvent.selectOptions(severitySelect, 'all');
      expect(screen.getByRole('heading', { name: '支付网关响应超时' })).toBeInTheDocument();
    });

    it('搜索匹配记录数正确显示', async () => {
      render(<HandlingRecords />);
      const input = screen.getByPlaceholderText(/多关键词搜索/);
      await userEvent.type(input, '支付');
      const matchText = screen.getByText(/找到/);
      expect(matchText.textContent).toContain('1');
      expect(matchText.textContent).toContain('条匹配记录');
    });

    it('高级搜索面板可收起展开', async () => {
      const { container } = render(<HandlingRecords />);
      const advancedBtn = screen.getByRole('button', { name: /高级搜索/ });
      await userEvent.click(advancedBtn);
      expect(getDateInputs(container).length).toBe(2);
      await userEvent.click(advancedBtn);
      expect(getDateInputs(container).length).toBe(0);
    });

    it('空关键词搜索不过滤任何记录', async () => {
      render(<HandlingRecords />);
      const input = screen.getByPlaceholderText(/多关键词搜索/);
      await userEvent.type(input, '   ');
      expect(screen.getByRole('heading', { name: '支付网关响应超时' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: '数据库主从延迟告警' })).toBeInTheDocument();
    });
  });
});
