import { useState } from 'react';
import { layers } from '../data/escalationData';

export default function EscalationLayers() {
  const [selectedLayer, setSelectedLayer] = useState(null);

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-1 h-6 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full"></span>
            策略分层
          </h2>
          <p className="text-slate-400 text-sm mt-1">四级升级体系，明确各层级职责和响应时效</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {layers.map((layer) => (
          <div
            key={layer.id}
            onClick={() => setSelectedLayer(selectedLayer === layer.id ? null : layer.id)}
            className={`relative cursor-pointer rounded-xl border-2 transition-all duration-300 overflow-hidden ${layer.bgColor} ${layer.borderColor} ${
              selectedLayer === layer.id ? 'ring-2 ring-offset-2 ring-offset-slate-900 scale-[1.02]' : 'hover:scale-[1.02] hover:shadow-lg'
            }`}
            style={selectedLayer === layer.id ? { boxShadow: `0 0 30px -5px var(--tw-ring-color)` } : {}}
          >
            <div className={`absolute top-0 left-0 right-0 h-1 ${layer.color === 'layer-1' ? 'bg-emerald-500' : layer.color === 'layer-2' ? 'bg-amber-500' : layer.color === 'layer-3' ? 'bg-red-500' : 'bg-violet-500'}`}></div>

            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className={`text-xs font-medium ${layer.textColor} mb-1`}>{layer.level}</div>
                  <h3 className="text-lg font-bold text-white">{layer.name}</h3>
                </div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold ${layer.bgColor} ${layer.textColor} border ${layer.borderColor}`}>
                  L{layer.id}
                </div>
              </div>

              <p className="text-slate-300 text-sm mb-4 leading-relaxed">{layer.description}</p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <svg className={`w-4 h-4 ${layer.textColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-slate-400">响应时效：</span>
                  <span className="text-white font-medium">{layer.responseTime}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <svg className={`w-4 h-4 ${layer.textColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-slate-400">处理时效：</span>
                  <span className="text-white font-medium">{layer.resolveTime}</span>
                </div>
              </div>

              {selectedLayer === layer.id && (
                <div className="pt-4 border-t border-slate-600/50 space-y-3 animate-fadeIn">
                  <div>
                    <div className="text-xs text-slate-400 mb-1.5">负责人</div>
                    <div className="text-white font-medium">{layer.owner}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 mb-1.5">团队成员</div>
                    <div className="flex flex-wrap gap-1.5">
                      {layer.members.map((member, idx) => (
                        <span key={idx} className={`text-xs px-2 py-1 rounded-md ${layer.bgColor} ${layer.textColor} border ${layer.borderColor}`}>
                          {member}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 mb-1.5">联系方式</div>
                    <div className="text-sm text-slate-200">{layer.contact}</div>
                  </div>
                </div>
              )}

              <div className={`text-center mt-4 text-xs ${layer.textColor}`}>
                {selectedLayer === layer.id ? '点击收起详情 ▲' : '点击展开详情 ▼'}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-400">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        点击卡片查看各层级详细联系方式和团队信息
      </div>
    </div>
  );
}
