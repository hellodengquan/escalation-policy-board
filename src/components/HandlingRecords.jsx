import { useState, useMemo } from 'react';
import { records, severityConfig, statusConfig, layers } from '../data/escalationData';

const layerColorMap = {
  1: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/40', dot: 'bg-emerald-500' },
  2: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/40', dot: 'bg-amber-500' },
  3: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/40', dot: 'bg-red-500' },
  4: { bg: 'bg-violet-500/20', text: 'text-violet-400', border: 'border-violet-500/40', dot: 'bg-violet-500' },
};

function RecordDetail({ record, onClose }) {
  const sev = severityConfig[record.severity];
  const stat = statusConfig[record.status];

  const getNextLayerInfo = () => {
    if (record.status === 'resolved') return null;
    if (record.currentLayer >= 4) return null;
    return layers.find((l) => l.id === record.currentLayer + 1);
  };

  const nextLayer = getNextLayerInfo();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-700 flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-slate-400 text-sm font-mono">{record.id}</span>
              <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${sev.color} text-white`}>
                {record.severity} · {sev.label}
              </span>
              <span className={`px-2 py-0.5 rounded-md text-xs font-medium flex items-center gap-1 ${stat.color} ${stat.textColor}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${stat.dot} ${record.status === 'handling' ? 'animate-pulse' : ''}`}></span>
                {stat.label}
              </span>
              <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${layerColorMap[record.currentLayer].bg} ${layerColorMap[record.currentLayer].text} border ${layerColorMap[record.currentLayer].border}`}>
                {record.layerName}
              </span>
            </div>
            <h3 className="text-xl font-bold text-white">{record.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-700/50 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors flex-shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {nextLayer && (
            <div className={`rounded-xl p-4 border-2 ${nextLayer.borderColor} ${nextLayer.bgColor} relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-24 h-24 opacity-10">
                <svg viewBox="0 0 100 100" fill="currentColor" className={nextLayer.textColor}>
                  <circle cx="50" cy="50" r="50" />
                </svg>
              </div>
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-8 h-8 rounded-lg ${nextLayer.bgColor} flex items-center justify-center border ${nextLayer.borderColor}`}>
                    <svg className={`w-4 h-4 ${nextLayer.textColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                  <span className={`text-sm font-bold ${nextLayer.textColor}`}>下一步操作建议</span>
                </div>
                <div className="text-white font-medium mb-3">{record.nextAction}</div>
                <div className="bg-slate-900/40 rounded-lg p-3">
                  <div className="text-xs text-slate-400 mb-2">如需升级，请联系：</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-slate-400">层级：</span>
                      <span className={`font-bold ${nextLayer.textColor}`}>{nextLayer.name}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">负责人：</span>
                      <span className="text-white">{nextLayer.owner}</span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-slate-400">联系方式：</span>
                      <span className="text-white">{nextLayer.contact}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-900/40 rounded-lg p-3">
              <div className="text-xs text-slate-400 mb-1">当前处理人</div>
              <div className="text-sm text-white font-medium">{record.assignee}</div>
            </div>
            <div className="bg-slate-900/40 rounded-lg p-3">
              <div className="text-xs text-slate-400 mb-1">创建时间</div>
              <div className="text-sm text-white font-medium">{record.createdAt.split(' ')[1]}</div>
            </div>
            <div className="bg-slate-900/40 rounded-lg p-3">
              <div className="text-xs text-slate-400 mb-1">最后更新</div>
              <div className="text-sm text-white font-medium">{record.updatedAt.split(' ')[1]}</div>
            </div>
            <div className="bg-slate-900/40 rounded-lg p-3">
              <div className="text-xs text-slate-400 mb-1">处理节点</div>
              <div className="text-sm text-white font-medium">{record.history.length} 步</div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h4 className="text-base font-bold text-white">升级处理时间线</h4>
            </div>

            <div className="relative">
              <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-slate-700"></div>
              <div className="space-y-4">
                {record.history.map((step, idx) => {
                  const lc = layerColorMap[step.layer] || layerColorMap[1];
                  const isLast = idx === record.history.length - 1;
                  return (
                    <div key={idx} className="relative flex gap-4">
                      <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${lc.bg} ${lc.text} border-2 ${lc.border} flex-shrink-0 ${isLast ? 'ring-4 ring-slate-800' : ''}`}>
                        L{step.layer}
                      </div>
                      <div className={`flex-1 rounded-xl p-4 ${isLast ? lc.bg + ' border ' + lc.border : 'bg-slate-900/40 border border-slate-700/50'}`}>
                        <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                          <span className={`font-bold ${isLast ? lc.text : 'text-white'}`}>{step.action}</span>
                          <span className="text-xs text-slate-400 font-mono">{step.time}</span>
                        </div>
                        <div className="text-sm text-slate-300 mb-1">{step.note}</div>
                        <div className="text-xs text-slate-500">操作人：{step.operator}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-700 flex items-center justify-between gap-4 bg-slate-900/30">
          <div className="text-xs text-slate-400">
            值班同学：根据时间线和下一步建议，及时判断是否需要升级
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium transition-colors"
          >
            我知道了
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HandlingRecords() {
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterLayer, setFilterLayer] = useState('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

  const searchTags = useMemo(() => {
    return searchKeyword
      .trim()
      .split(/\s+/)
      .filter((k) => k.length > 0);
  }, [searchKeyword]);

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (filterStatus !== 'all' && r.status !== filterStatus) return false;
      if (filterSeverity !== 'all' && r.severity !== filterSeverity) return false;
      if (filterLayer !== 'all' && r.currentLayer !== parseInt(filterLayer)) return false;

      if (dateStart) {
        const start = new Date(dateStart + ' 00:00:00').getTime();
        const created = new Date(r.createdAt).getTime();
        if (created < start) return false;
      }
      if (dateEnd) {
        const end = new Date(dateEnd + ' 23:59:59').getTime();
        const created = new Date(r.createdAt).getTime();
        if (created > end) return false;
      }

      if (searchTags.length > 0) {
        const searchableText = [
          r.title,
          r.id,
          r.assignee,
          r.nextAction,
          r.layerName,
          ...r.history.map((h) => `${h.action} ${h.note} ${h.operator}`),
        ]
          .join(' ')
          .toLowerCase();

        const allMatch = searchTags.every((tag) => searchableText.includes(tag.toLowerCase()));
        if (!allMatch) return false;
      }

      return true;
    });
  }, [filterStatus, filterSeverity, filterLayer, dateStart, dateEnd, searchTags]);

  const stats = {
    total: records.length,
    handling: records.filter((r) => r.status === 'handling').length,
    resolved: records.filter((r) => r.status === 'resolved').length,
    p0p1: records.filter((r) => r.severity === 'P0' || r.severity === 'P1').length,
  };

  const exportCSV = () => {
    const headers = [
      '工单ID',
      '标题',
      '严重等级',
      '状态',
      '当前层级',
      '处理人',
      '创建时间',
      '更新时间',
      '解决时间',
      '处理节点数',
      '下一步建议',
      '原始触发链',
    ];

    const rows = filteredRecords.map((r) => {
      const triggerChain = r.history
        .map((h, idx) => `${idx + 1}.[${h.time}] L${h.layer} ${h.operator}: ${h.action} - ${h.note}`)
        .join(' | ');

      return [
        r.id,
        r.title,
        `${r.severity}(${severityConfig[r.severity]?.label || ''})`,
        statusConfig[r.status]?.label || r.status,
        r.layerName,
        r.assignee,
        r.createdAt,
        r.updatedAt,
        r.resolvedAt || '-',
        r.history.length,
        r.nextAction,
        triggerChain,
      ];
    });

    const csvContent = [headers, ...rows]
      .map((row) =>
        row
          .map((cell) => {
            const cellStr = String(cell);
            if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
              return `"${cellStr.replace(/"/g, '""')}"`;
            }
            return cellStr;
          })
          .join(',')
      )
      .join('\n');

    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `升级处理记录_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const hasActiveFilters =
    filterStatus !== 'all' ||
    filterSeverity !== 'all' ||
    filterLayer !== 'all' ||
    dateStart !== '' ||
    dateEnd !== '' ||
    searchKeyword !== '';

  const clearAllFilters = () => {
    setFilterStatus('all');
    setFilterSeverity('all');
    setFilterLayer('all');
    setSearchKeyword('');
    setDateStart('');
    setDateEnd('');
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-1 h-6 bg-gradient-to-b from-rose-400 to-pink-500 rounded-full"></span>
            处理记录看板
          </h2>
          <p className="text-slate-400 text-sm mt-1">实时跟踪故障处理进度，快速判断下一步找谁</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors border border-slate-600/50"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              清除筛选
            </button>
          )}
          <button
            onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
              showAdvancedSearch
                ? 'bg-cyan-600/20 text-cyan-300 border-cyan-500/30'
                : 'bg-slate-700/50 hover:bg-slate-700 text-slate-300 border-slate-600/50'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            高级搜索
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            导出 CSV
            <span className="text-xs bg-emerald-800/50 px-1.5 py-0.5 rounded">{filteredRecords.length}</span>
          </button>
        </div>
      </div>

      <div className="mb-5 space-y-3">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="多关键词搜索（空格分隔），例如：支付 超时 张三"
            className="w-full pl-10 pr-10 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
          />
          {searchKeyword && (
            <button
              onClick={() => setSearchKeyword('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-600 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-500 transition-colors"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {searchTags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-400">搜索关键词：</span>
            {searchTags.map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/30"
              >
                {tag}
                <button
                  onClick={() => {
                    const newTags = searchTags.filter((_, i) => i !== idx);
                    setSearchKeyword(newTags.join(' '));
                  }}
                  className="hover:text-white"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        {showAdvancedSearch && (
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-700/50 space-y-3 animate-fadeIn">
            <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              日期范围筛选
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1.5">起始日期</label>
                <input
                  type="date"
                  value={dateStart}
                  onChange={(e) => setDateStart(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  style={{ colorScheme: 'dark' }}
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1.5">结束日期</label>
                <input
                  type="date"
                  value={dateEnd}
                  onChange={(e) => setDateEnd(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  style={{ colorScheme: 'dark' }}
                />
              </div>
            </div>
            {(dateStart || dateEnd) && (
              <div className="text-xs text-slate-400">
                当前筛选：
                <span className="text-white ml-1">
                  {dateStart || '不限'} 至 {dateEnd || '不限'}
                </span>
              </div>
            )}
          </div>
        )}

        {(searchKeyword || hasActiveFilters) && (
          <div className="text-xs text-slate-400">
            找到 <span className="text-cyan-400 font-medium">{filteredRecords.length}</span> 条匹配记录
            {searchTags.length > 1 && (
              <span className="text-slate-500 ml-2">（{searchTags.length} 个关键词 AND 匹配）</span>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 flex-wrap mb-5">
        <select
          value={filterSeverity}
          onChange={(e) => setFilterSeverity(e.target.value)}
          className="bg-slate-700 border border-slate-600 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        >
          <option value="all">全部等级</option>
          <option value="P0">P0 致命</option>
          <option value="P1">P1 严重</option>
          <option value="P2">P2 重要</option>
          <option value="P3">P3 一般</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-slate-700 border border-slate-600 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        >
          <option value="all">全部状态</option>
          <option value="handling">处理中</option>
          <option value="resolved">已解决</option>
        </select>
        <select
          value={filterLayer}
          onChange={(e) => setFilterLayer(e.target.value)}
          className="bg-slate-700 border border-slate-600 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        >
          <option value="all">全部层级</option>
          <option value="1">L1 值班值守</option>
          <option value="2">L2 技术支持</option>
          <option value="3">L3 研发团队</option>
          <option value="4">L4 管理层决策</option>
        </select>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-xl p-4 border border-cyan-500/20">
          <div className="text-2xl font-bold text-cyan-300">{stats.total}</div>
          <div className="text-xs text-slate-400 mt-1">故障总数</div>
        </div>
        <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-xl p-4 border border-amber-500/20">
          <div className="text-2xl font-bold text-amber-300">{stats.handling}</div>
          <div className="text-xs text-slate-400 mt-1">处理中</div>
        </div>
        <div className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 rounded-xl p-4 border border-emerald-500/20">
          <div className="text-2xl font-bold text-emerald-300">{stats.resolved}</div>
          <div className="text-xs text-slate-400 mt-1">已解决</div>
        </div>
        <div className="bg-gradient-to-br from-red-500/10 to-rose-500/10 rounded-xl p-4 border border-red-500/20">
          <div className="text-2xl font-bold text-red-300">{stats.p0p1}</div>
          <div className="text-xs text-slate-400 mt-1">P0/P1 严重</div>
        </div>
      </div>

      <div className="space-y-3">
        {filteredRecords.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-12 h-12 text-slate-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <div className="text-slate-500 text-sm">暂无符合条件的记录</div>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="mt-3 text-xs text-cyan-400 hover:text-cyan-300"
              >
                清除所有筛选条件
              </button>
            )}
          </div>
        ) : (
          filteredRecords.map((record) => {
            const sev = severityConfig[record.severity];
            const stat = statusConfig[record.status];
            const lc = layerColorMap[record.currentLayer];

            return (
              <div
                key={record.id}
                onClick={() => setSelectedRecord(record)}
                className={`rounded-xl border transition-all cursor-pointer hover:scale-[1.01] ${
                  record.status === 'handling'
                    ? `${lc.bg} border ${lc.border} hover:shadow-lg`
                    : 'bg-slate-900/30 border border-slate-700/50 hover:border-slate-600'
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${sev.color} text-white`}>
                          {record.severity}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1 ${stat.color} ${stat.textColor}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${stat.dot} ${record.status === 'handling' ? 'animate-pulse' : ''}`}></span>
                          {stat.label}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${lc.bg} ${lc.text} border ${lc.border}`}>
                          {record.layerName}
                        </span>
                        <span className="text-slate-500 text-xs font-mono">{record.id}</span>
                      </div>
                      <h3 className="text-base font-bold text-white mb-2 truncate">{record.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-slate-400 flex-wrap">
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {record.assignee}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {record.createdAt.split(' ')[0]}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          更新于 {record.updatedAt.split(' ')[1]}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          {record.history.length} 个处理节点
                        </span>
                      </div>
                    </div>

                    <div className="flex-shrink-0 flex flex-col items-end gap-2">
                      {record.status === 'handling' && (
                        <div className="text-right">
                          <div className="text-xs text-slate-400 mb-1">下一步建议</div>
                          <div className={`text-xs font-medium ${lc.text} max-w-[200px] text-right`}>
                            {record.nextAction}
                          </div>
                        </div>
                      )}
                      <div className="text-xs text-cyan-400 flex items-center gap-1">
                        查看详情
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {selectedRecord && <RecordDetail record={selectedRecord} onClose={() => setSelectedRecord(null)} />}
    </div>
  );
}
