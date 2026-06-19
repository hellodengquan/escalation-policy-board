import { useState, useMemo } from 'react';
import { ruleConflicts, rules, timeScopes } from '../data/escalationData';

const priorityStyles = {
  high: {
    label: '高优先级',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    dot: 'bg-red-500',
  },
  medium: {
    label: '中优先级',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    dot: 'bg-amber-500',
  },
  low: {
    label: '低优先级',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    dot: 'bg-blue-500',
  },
};

const timeScopeStyles = {
  all: { label: '全部时段', color: 'text-slate-300', bg: 'bg-slate-500/10', border: 'border-slate-500/30' },
  workday: { label: '工作日', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  night: { label: '夜间', color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/30' },
  holiday: { label: '节假日', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  promotion: { label: '大促期间', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30' },
};

export default function PriorityConflictHint({ filterTimeScope = 'all' }) {
  const [expandedId, setExpandedId] = useState(null);
  const [showAll, setShowAll] = useState(false);

  const filteredConflicts = useMemo(() => {
    if (filterTimeScope === 'all') return ruleConflicts;
    return ruleConflicts.filter((conflict) => {
      return conflict.ruleIds.some((ruleId) => {
        const rule = rules.find((r) => r.id === ruleId);
        return rule && (rule.timeScope === filterTimeScope || rule.timeScope === 'all');
      });
    });
  }, [filterTimeScope]);

  const displayConflicts = showAll ? filteredConflicts : filteredConflicts.slice(0, 3);
  const highPriorityCount = filteredConflicts.filter((c) => c.priority === 'high').length;
  const currentTimeScope = timeScopes.find((s) => s.value === filterTimeScope);
  const tsStyle = timeScopeStyles[filterTimeScope];

  const getRuleInfo = (ruleId) => {
    return rules.find((r) => r.id === ruleId);
  };

  return (
    <div className="bg-gradient-to-br from-amber-500/5 to-orange-500/5 backdrop-blur-sm rounded-2xl p-6 border border-amber-500/20">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2 flex-wrap">
              策略优先级冲突提示
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 font-medium">
                {highPriorityCount} 个高优
              </span>
            </h2>
            <p className="text-slate-400 text-sm mt-0.5">多条规则同时触发时，按此表判断优先执行哪条</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {Object.entries(priorityStyles).map(([key, style]) => (
            <div key={key} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${style.dot}`}></span>
              <span className={`text-xs ${style.color}`}>{style.label}</span>
            </div>
          ))}
        </div>
      </div>

      {filterTimeScope !== 'all' && (
        <div className={`mb-5 p-3 rounded-xl border ${tsStyle.bg} ${tsStyle.border}`}>
          <div className="flex items-center gap-3">
            <div className={`w-7 h-7 rounded-full ${tsStyle.bg} flex items-center justify-center border ${tsStyle.border} flex-shrink-0`}>
              <svg className={`w-3.5 h-3.5 ${tsStyle.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <div className="flex-1">
              <span className={`text-xs font-medium ${tsStyle.color}`}>
                与时间筛选联动 · 当前时段：{currentTimeScope?.label}
              </span>
              <div className="text-xs text-slate-400 mt-0.5">
                显示 <span className="text-white font-medium">{filteredConflicts.length}</span> 个相关冲突（共 {ruleConflicts.length} 个）
                {filteredConflicts.length === 0 && <span className="text-emerald-400 ml-2">✓ 当前时段无冲突规则</span>}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {displayConflicts.length === 0 ? (
          <div className="text-center py-10">
            <svg className="w-10 h-10 text-emerald-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-emerald-400 font-medium">当前时段无策略冲突</div>
            <div className="text-xs text-slate-500 mt-1">该时段内的规则互相独立，不会产生优先级冲突</div>
          </div>
        ) : (
          displayConflicts.map((conflict) => {
            const style = priorityStyles[conflict.priority];
            const ruleA = getRuleInfo(conflict.ruleIds[0]);
            const ruleB = getRuleInfo(conflict.ruleIds[1]);
            const winnerRule = getRuleInfo(conflict.winnerRuleId);
            const isExpanded = expandedId === conflict.id;

            return (
              <div
                key={conflict.id}
                className={`rounded-xl border transition-all overflow-hidden ${style.bgColor} ${style.borderColor}`}
              >
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : conflict.id)}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${style.dot} ${conflict.priority === 'high' ? 'animate-pulse' : ''}`}></span>
                      <span className={`text-xs px-2 py-0.5 rounded-md flex-shrink-0 ${style.bgColor} ${style.color} border ${style.borderColor} font-medium`}>
                        {style.label}
                      </span>
                      <h3 className="text-sm font-bold text-white truncate">{conflict.title}</h3>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-slate-400">
                        {isExpanded ? '收起' : '展开详情'}
                      </span>
                      <svg
                        className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium flex-1 min-w-[120px] text-center ${
                          winnerRule && winnerRule.id === ruleA?.id
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-slate-700/50 text-slate-300'
                        }`}
                      >
                        {winnerRule && winnerRule.id === ruleA?.id && (
                          <span className="inline-block mr-1">✓</span>
                        )}
                        规则 {conflict.ruleIds[0]}
                        {ruleA && (
                          <span className="block text-[10px] text-slate-400 mt-0.5 font-normal">{ruleA.title}</span>
                        )}
                      </div>
                      <div className="text-slate-500 text-xs flex-shrink-0">VS</div>
                      <div
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium flex-1 min-w-[120px] text-center ${
                          winnerRule && winnerRule.id === ruleB?.id
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-slate-700/50 text-slate-300'
                        }`}
                      >
                        {winnerRule && winnerRule.id === ruleB?.id && (
                          <span className="inline-block mr-1">✓</span>
                        )}
                        规则 {conflict.ruleIds[1]}
                        {ruleB && (
                          <span className="block text-[10px] text-slate-400 mt-0.5 font-normal">{ruleB.title}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 border-t border-slate-600/30 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-slate-900/40 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                          <span className="text-xs font-medium text-cyan-300">冲突点</span>
                        </div>
                        <p className="text-sm text-slate-300">{conflict.conflictPoint}</p>
                      </div>
                      <div className="bg-slate-900/40 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                          <span className="text-xs font-medium text-green-300">解决方案</span>
                        </div>
                        <p className="text-sm text-slate-300">{conflict.resolution}</p>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg p-3 border border-green-500/20">
                      <div className="flex items-start gap-2">
                        <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div>
                          <span className="text-xs text-green-400 font-medium">优先执行：</span>
                          <span className="text-sm text-white font-medium ml-1">
                            {winnerRule?.title || `规则 ${conflict.winnerRuleId}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {filteredConflicts.length > 3 && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-sm text-amber-400 hover:text-amber-300 font-medium transition-colors"
          >
            {showAll ? '收起部分冲突 ▲' : `查看全部 ${filteredConflicts.length} 个冲突 ▼`}
          </button>
        </div>
      )}

      <div className="mt-5 pt-4 border-t border-slate-700/50">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-bold text-cyan-300 mb-1">值班同学快速判断口诀</div>
            <div className="text-xs text-slate-300 leading-relaxed">
              <strong>严重故障排第一，客户投诉不能等；夜间跳级找研发，大促期间全动员。</strong>
              <br />
              拿不准时记住：优先级数字越小越优先（1 → 2 → 3），严重级别越高越优先（critical → high → medium）。
              <br />
              <span className="text-amber-300">联动提示：切换上方时间维度筛选，此处会自动过滤对应时段的冲突规则。</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
