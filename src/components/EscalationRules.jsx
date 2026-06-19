import { useState } from 'react';
import { rules, timeScopes } from '../data/escalationData';

const severityStyles = {
  critical: {
    label: '关键',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    dot: 'bg-red-500',
  },
  high: {
    label: '高',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
    dot: 'bg-orange-500',
  },
  medium: {
    label: '中',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
    dot: 'bg-yellow-500',
  },
};

const timeScopeStyles = {
  all: { label: '全部时段', color: 'text-slate-300', bg: 'bg-slate-500/10', border: 'border-slate-500/30' },
  workday: { label: '工作日', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  night: { label: '夜间', color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/30' },
  holiday: { label: '节假日', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  promotion: { label: '大促期间', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30' },
};

export default function EscalationRules({ filterTimeScope, setFilterTimeScope }) {
  const [expandedRule, setExpandedRule] = useState(null);
  const [filterSeverity, setFilterSeverity] = useState('all');

  const filteredRules = rules.filter((rule) => {
    if (filterTimeScope !== 'all' && rule.timeScope !== filterTimeScope && rule.timeScope !== 'all') {
      return false;
    }
    if (filterSeverity !== 'all' && rule.severity !== filterSeverity) {
      return false;
    }
    return true;
  });

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-1 h-6 bg-gradient-to-b from-amber-400 to-orange-500 rounded-full"></span>
            升级规则预览
          </h2>
          <p className="text-slate-400 text-sm mt-1">明确何时需要升级、升级到哪一层 · 与策略冲突提示联动</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400">严重度：</label>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="bg-slate-700 border border-slate-600 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">全部</option>
              <option value="critical">关键</option>
              <option value="high">高</option>
              <option value="medium">中</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mb-5">
        <div className="text-xs text-slate-400 mb-2 flex items-center gap-2">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          时间维度筛选（与策略冲突提示联动）
        </div>
        <div className="flex flex-wrap gap-2">
          {timeScopes.map((scope) => {
            const style = timeScopeStyles[scope.value];
            const isActive = filterTimeScope === scope.value;
            const count = rules.filter((r) =>
              scope.value === 'all' ? true : r.timeScope === scope.value || r.timeScope === 'all'
            ).length;

            return (
              <button
                key={scope.value}
                onClick={() => setFilterTimeScope(scope.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  isActive
                    ? `${style.bg} ${style.color} border ${style.border} ring-2 ring-offset-1 ring-offset-slate-900`
                    : 'bg-slate-700/30 text-slate-400 border border-slate-600/30 hover:bg-slate-700/50 hover:text-slate-300'
                }`}
              >
                {scope.label}
                <span className={`px-1.5 py-0.5 rounded text-xs ${isActive ? style.bg : 'bg-slate-600/30'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4 text-xs">
        <span className="text-slate-500">严重度图例：</span>
        {Object.entries(severityStyles).map(([key, style]) => (
          <div key={key} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${style.dot}`}></span>
            <span className={`text-xs ${style.color}`}>{style.label}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRules.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-500">暂无符合条件的规则</div>
        ) : (
          filteredRules.map((rule) => {
            const style = severityStyles[rule.severity];
            const tsStyle = timeScopeStyles[rule.timeScope];
            const isExpanded = expandedRule === rule.id;

            return (
              <div
                key={rule.id}
                className={`rounded-xl border transition-all duration-300 overflow-hidden ${style.bgColor} ${style.borderColor} ${
                  isExpanded ? 'ring-2 ring-offset-2 ring-offset-slate-900' : 'hover:border-opacity-60'
                }`}
              >
                <div
                  className="p-5 cursor-pointer"
                  onClick={() => setExpandedRule(isExpanded ? null : rule.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${style.dot} animate-pulse`}></span>
                      <h3 className="text-base font-bold text-white">{rule.title}</h3>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className={`text-xs px-2 py-0.5 rounded-md ${style.bgColor} ${style.color} border ${style.borderColor} font-medium`}>
                        {style.label}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-xs px-2 py-0.5 rounded-md ${tsStyle.bg} ${tsStyle.color} border ${tsStyle.border}`}>
                      {tsStyle.label}适用
                    </span>
                    <span className="text-xs text-slate-500">
                      优先级 <span className="font-mono text-slate-300">P{rule.priority}</span>
                    </span>
                  </div>

                  <p className="text-slate-300 text-sm leading-relaxed mb-4">{rule.description}</p>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-900/40 rounded-lg p-3">
                      <div className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        触发条件
                      </div>
                      <div className="text-sm text-white font-medium">{rule.condition}</div>
                    </div>
                    <div className="bg-slate-900/40 rounded-lg p-3">
                      <div className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                        升级目标
                      </div>
                      <div className={`text-sm font-medium ${style.color}`}>{rule.target}</div>
                    </div>
                  </div>

                  <div className={`mt-4 text-center text-xs ${style.color} transition-all`}>
                    {isExpanded ? '收起示例 ▲' : '查看典型示例 ▼'}
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-slate-600/30 pt-4">
                    <div className="text-xs text-slate-400 mb-3 font-medium">📋 典型场景示例</div>
                    <div className="space-y-2">
                      {rule.examples.map((example, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2 text-sm bg-slate-900/40 rounded-lg p-3"
                        >
                          <span className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${style.bgColor} ${style.color} border ${style.borderColor}`}>
                            {idx + 1}
                          </span>
                          <span className="text-slate-200">{example}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="mt-6 p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl border border-cyan-500/20">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-bold text-cyan-300 mb-1">值班同学快速判断指南</div>
            <div className="text-xs text-slate-300 leading-relaxed">
              遇到问题时，先看<strong>「当前层级 + 已处理时间」</strong>判断是否超时；再对照<strong>「触发条件」</strong>看是否符合升级场景；
              最后根据<strong>「升级目标」</strong>联系对应层级人员。P0/P1 故障直接通知 L3+L4，不要犹豫！
              <br />
              <span className="text-amber-300">提示：时间维度筛选器与下方策略冲突提示联动，筛选时段后冲突提示会同步显示该时段的规则冲突。</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
