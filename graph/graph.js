/* 图论算法可视化：预计算每一步，再通过快照进行稳定回放。 */
(() => {
  'use strict';

  const nodes = [
    {id:'A', x:105, y:82}, {id:'B', x:310, y:55}, {id:'C', x:555, y:88},
    {id:'D', x:165, y:285}, {id:'E', x:405, y:300}, {id:'F', x:645, y:278}
  ];
  const weightedEdges = [
    {u:'A',v:'B',w:4}, {u:'A',v:'D',w:2}, {u:'B',v:'C',w:3},
    {u:'B',v:'D',w:1}, {u:'B',v:'E',w:5}, {u:'C',v:'E',w:2},
    {u:'C',v:'F',w:6}, {u:'D',v:'E',w:8}, {u:'E',v:'F',w:1}
  ];
  const directedEdges = [
    {u:'A',v:'C'}, {u:'B',v:'C'}, {u:'B',v:'D'},
    {u:'C',v:'E'}, {u:'D',v:'E'}, {u:'D',v:'F'}, {u:'E',v:'F'}
  ];
  const algorithms = {
    dijkstra: {
      title:'Dijkstra 最短路径', graph:'加权无向图',
      description:'从起点开始，每次确定当前距离最小的未访问节点，再尝试用它缩短邻居的距离。要求边权非负。',
      formula:'dist[v] = min(dist[v], dist[u] + w(u,v))',
      note:'<strong>边权均非负。</strong>若存在负权边，应使用 Bellman–Ford 等算法。',
      legend:[['#a855f7','当前正在扩展的节点'],['#22c55e','已确定最短距离'],['#f59e0b','正在检查的边'],['#4ade80','当前最短路树中的边']]
    },
    kruskal: {
      title:'Kruskal 最小生成树', graph:'加权无向图',
      description:'先按边权从小到大排序。依次检查每条边：连接不同连通分量就收下，否则跳过以避免成环。',
      formula:'按 w 升序选边；若 find(u) ≠ find(v)，则合并',
      note:'<strong>目标：</strong>用 n−1 条边连通所有节点，并让边权总和最小。并查集负责判断是否成环。',
      legend:[['#f59e0b','当前检查的边'],['#22c55e','已加入生成树'],['#f87171','会形成环，跳过'],['#94a3b8','尚未检查']]
    },
    topo: {
      title:'Kahn 拓扑排序', graph:'有向无环图（DAG）',
      description:'把所有入度为 0 的节点放入队列。每次取出一个节点加入序列，并删除它发出的边、更新邻居入度。',
      formula:'入度为 0 → 入队；出队 u → indegree[v]--',
      note:'<strong>拓扑序只对 DAG 存在。</strong>如果最终处理的节点数少于图中节点数，图中含有环。',
      legend:[['#a855f7','当前取出的节点'],['#38bdf8','队列中的零入度节点'],['#f59e0b','正在处理的有向边'],['#64748b','已移除的边']]
    }
  };

  const $ = id => document.getElementById(id);
  const state = {algorithm:'dijkstra', steps:[], step:-1, playing:false, speed:1, timer:null, source:'A'};
  const ui = {
    formula:$('formulaBox'), description:$('algorithmDescription'), sourceSection:$('sourceSection'), source:$('sourceSelect'),
    legend:$('legend'), note:$('graphNote'), title:$('graphTitle'), subtitle:$('graphSubtitle'), svg:$('graphSvg'),
    dataTitle:$('dataTitle'), dataSubtitle:$('dataSubtitle'), data:$('dataView'), counter:$('stepCounter'),
    explainCounter:$('explainCounter'), explain:$('explainBody'), progress:$('progressFill'),
    prev:$('btnPrev'), next:$('btnNext'), play:$('btnPlay'), reset:$('btnReset'), speed:$('speed'), speedVal:$('speedVal')
  };

  function clone(value){return JSON.parse(JSON.stringify(value));}
  function edgeKey(edge){return `${edge.u}-${edge.v}`;}
  function adjacency(){
    const adj = Object.fromEntries(nodes.map(node => [node.id, []]));
    weightedEdges.forEach(edge => {
      adj[edge.u].push({to:edge.v, edge});
      adj[edge.v].push({to:edge.u, edge});
    });
    return adj;
  }

  function buildDijkstra(){
    const dist = Object.fromEntries(nodes.map(node => [node.id, Infinity]));
    const parent = Object.fromEntries(nodes.map(node => [node.id, null]));
    const settled = [];
    const steps = [];
    const adj = adjacency();
    dist[state.source] = 0;
    const frame = (type, detail={}) => steps.push({type, dist:{...dist}, parent:{...parent}, settled:[...settled], ...detail});
    frame('init',{message:`初始化距离表：起点 ${state.source} 的距离设为 0，其余节点暂时不可达。`});
    while(settled.length < nodes.length){
      const current = nodes.map(n=>n.id).filter(id=>!settled.includes(id)).sort((a,b)=>dist[a]-dist[b])[0];
      if(dist[current] === Infinity) break;
      frame('choose',{current,message:`选择未确定节点 ${current}：当前暂定距离为 ${dist[current]}，这是所有未确定节点中的最小值。`});
      for(const {to,edge} of adj[current]){
        if(settled.includes(to)){
          frame('check',{current,edge:edgeKey(edge),message:`检查边 ${current}—${to}（权重 ${edge.w}）：${to} 已确定最短距离，不再更新。`});
          continue;
        }
        const candidate = dist[current] + edge.w;
        const improved = candidate < dist[to];
        if(improved){dist[to]=candidate;parent[to]=current;}
        frame('relax',{current,neighbor:to,edge:edgeKey(edge),candidate,improved,message:improved
          ? `沿 ${current}—${to} 到达 ${to} 的新距离是 ${dist[current]} + ${edge.w} = ${candidate}，小于原距离，更新。`
          : `沿 ${current}—${to} 得到候选距离 ${dist[current]} + ${edge.w} = ${candidate}，不小于原距离 ${dist[to]}，保持不变。`});
      }
      settled.push(current);
      frame('settled',{current,message:`节点 ${current} 的最短距离已确定为 ${dist[current]}。`});
    }
    frame('done',{message:`完成：从 ${state.source} 出发的所有可达节点最短距离已经确定。`});
    return steps;
  }

  function buildKruskal(){
    const parent = Object.fromEntries(nodes.map(n=>[n.id,n.id]));
    const rank = Object.fromEntries(nodes.map(n=>[n.id,0]));
    const accepted = [];
    const steps = [];
    let total = 0;
    const find = x => {while(parent[x]!==x){parent[x]=parent[parent[x]];x=parent[x];}return x;};
    const frame = (type, detail={}) => steps.push({type, accepted:[...accepted], parent:{...parent}, total, ...detail});
    const sorted = [...weightedEdges].sort((a,b)=>a.w-b.w || a.u.localeCompare(b.u) || a.v.localeCompare(b.v));
    frame('init',{message:'将全部边按权重从小到大排列，开始逐条检查。'});
    for(const edge of sorted){
      if(accepted.length === nodes.length-1) break;
      const a=find(edge.u), b=find(edge.v);
      if(a===b){frame('reject',{edge:edgeKey(edge),message:`检查 ${edge.u}—${edge.v}（权重 ${edge.w}）：两端已在同一连通分量，加入会形成环，跳过。`});continue;}
      if(rank[a]<rank[b]) parent[a]=b;
      else if(rank[a]>rank[b]) parent[b]=a;
      else {parent[b]=a;rank[a]++;}
      accepted.push(edgeKey(edge));total+=edge.w;
      frame('accept',{edge:edgeKey(edge),message:`检查 ${edge.u}—${edge.v}（权重 ${edge.w}）：连接两个不同分量，加入生成树。当前总权重为 ${total}。`});
    }
    frame('done',{message:accepted.length===nodes.length-1
      ? `完成：最小生成树共选 ${accepted.length} 条边，总权重为 ${total}。`
      : `图不连通：只能选出 ${accepted.length} 条边，无法连接全部节点。`});
    return steps;
  }

  function buildTopo(){
    const indegree = Object.fromEntries(nodes.map(n=>[n.id,0]));
    const outgoing = Object.fromEntries(nodes.map(n=>[n.id,[]]));
    directedEdges.forEach(edge=>{indegree[edge.v]++;outgoing[edge.u].push(edge);});
    const queue = nodes.map(n=>n.id).filter(id=>indegree[id]===0);
    const order = [];
    const processed = [];
    const steps = [];
    const frame = (type,detail={}) => steps.push({type,indegree:{...indegree},queue:[...queue],order:[...order],processed:[...processed],...detail});
    frame('init',{message:`统计每个节点的入度。入度为 0 的节点 ${queue.join('、')} 先进入队列。`});
    while(queue.length){
      const current=queue.shift();order.push(current);
      frame('pop',{current,message:`从队列取出 ${current}，加入拓扑序列。接下来删除它发出的边。`});
      for(const edge of outgoing[current]){
        indegree[edge.v]--;
        const ready=indegree[edge.v]===0;
        if(ready) queue.push(edge.v);
        processed.push(edgeKey(edge));
        frame('remove',{current,edge:edgeKey(edge),neighbor:edge.v,ready,message:ready
          ? `删除 ${edge.u}→${edge.v}，${edge.v} 的入度降为 0，将它加入队列。`
          : `删除 ${edge.u}→${edge.v}，${edge.v} 的入度减为 ${indegree[edge.v]}，继续等待其他前置节点。`});
      }
    }
    const hasCycle=order.length<nodes.length;
    frame('done',{hasCycle,message:hasCycle
      ? `处理结束：只得到 ${order.length} 个节点，仍有节点入度不为 0，因此图中存在环。`
      : `完成：得到一个合法拓扑序列 ${order.join(' → ')}。`});
    return steps;
  }

  function buildSteps(){
    state.steps = state.algorithm==='dijkstra' ? buildDijkstra() : state.algorithm==='kruskal' ? buildKruskal() : buildTopo();
    state.step=-1;
  }

  function renderShell(){
    const cfg=algorithms[state.algorithm];
    ui.title.textContent=cfg.graph;
    ui.subtitle.textContent=state.algorithm==='topo'?'箭头表示边的方向；右侧显示入度、队列与输出序列。':'节点位置固定，边上的数字表示权重。';
    ui.description.textContent=cfg.description;
    ui.formula.innerHTML=`<div class="formula-label">核心规则</div><div class="formula">${cfg.formula}</div>`;
    ui.note.innerHTML=cfg.note;
    ui.legend.innerHTML=cfg.legend.map(([color,label])=>`<div class="legend-item"><span class="legend-swatch" style="color:${color};background:${color}22"></span>${label}</div>`).join('');
    ui.sourceSection.hidden=state.algorithm!=='dijkstra';
    ui.dataTitle.textContent=state.algorithm==='dijkstra'?'距离与前驱':state.algorithm==='kruskal'?'边的检查顺序':'入度、队列与拓扑序';
    ui.dataSubtitle.textContent=state.algorithm==='dijkstra'?'∞ 表示目前还没有找到到达路径':'每一步更新的算法状态';
    drawGraph(null);
    renderData(null);
  }

  function renderData(step){
    if(state.algorithm==='dijkstra'){
      const dist=step?.dist ?? Object.fromEntries(nodes.map(n=>[n.id,Infinity]));
      const parent=step?.parent ?? Object.fromEntries(nodes.map(n=>[n.id,null]));
      const settled=step?.settled ?? [];
      const focus=step?.current;
      ui.data.innerHTML=`<table class="data-table"><thead><tr><th>节点</th><th>最短距离</th><th>前驱</th><th>状态</th></tr></thead><tbody>${nodes.map(n=>{
        const status=settled.includes(n.id)?'<span class="chip good">已确定</span>':n.id===focus?'<span class="chip active">处理中</span>':Number.isFinite(dist[n.id])?'<span class="chip blue">暂定</span>':'<span class="chip">未发现</span>';
        const rowClass=n.id===focus?'focus':settled.includes(n.id)?'good':'';
        return `<tr class="${rowClass}"><td><strong>${n.id}</strong></td><td class="mono">${Number.isFinite(dist[n.id])?dist[n.id]:'∞'}</td><td>${parent[n.id]||'—'}</td><td>${status}</td></tr>`;
      }).join('')}</tbody></table>`;
    }else if(state.algorithm==='kruskal'){
      const accepted=step?.accepted??[];const checked=step?.edge;
      const sorted=[...weightedEdges].sort((a,b)=>a.w-b.w||a.u.localeCompare(b.u)||a.v.localeCompare(b.v));
      const acceptedEdges=accepted.map(k=>weightedEdges.find(e=>edgeKey(e)===k));
      ui.data.innerHTML=`<div class="sequence-strip">${acceptedEdges.length?acceptedEdges.map(e=>`<span class="sequence-node done">${e.u}—${e.v} <small>(${e.w})</small></span>`).join('<span class="sequence-arrow">+</span>'):'<span class="empty-state">生成树尚未选边</span>'}</div><table class="data-table"><thead><tr><th>顺序</th><th>边</th><th>权重</th><th>处理结果</th></tr></thead><tbody>${sorted.map((e,i)=>{
        const key=edgeKey(e),chosen=accepted.includes(key),active=key===checked;
        const result=chosen?'<span class="chip good">加入树</span>':active&&step?.type==='reject'?'<span class="chip" style="color:#fca5a5">形成环，跳过</span>':active?'<span class="chip active">当前选中</span>':'<span class="chip">待检查</span>';
        return `<tr class="${chosen?'good':active?'focus':''}"><td>${i+1}</td><td><strong>${e.u}—${e.v}</strong></td><td class="mono">${e.w}</td><td>${result}</td></tr>`;
      }).join('')}</tbody></table><p class="table-foot">当前生成树权重：<strong>${step?.total??0}</strong>　·　已选 ${accepted.length}/${nodes.length-1} 条边</p>`;
    }else{
      const indegree=step?.indegree??Object.fromEntries(nodes.map(n=>[n.id,directedEdges.filter(e=>e.v===n.id).length]));
      const queue=step?.queue??[];const order=step?.order??[];const processed=step?.processed??[];
      ui.data.innerHTML=`<table class="data-table"><thead><tr><th>节点</th><th>当前入度</th><th>状态</th></tr></thead><tbody>${nodes.map(n=>{
        const inQueue=queue.includes(n.id),inOrder=order.includes(n.id),focus=n.id===step?.current;
        const status=inOrder?'<span class="chip good">已输出</span>':inQueue?'<span class="chip blue">队列中</span>':focus?'<span class="chip active">当前</span>':'<span class="chip">等待中</span>';
        return `<tr class="${focus?'focus':inOrder?'good':''}"><td><strong>${n.id}</strong></td><td class="mono">${indegree[n.id]}</td><td>${status}</td></tr>`;
      }).join('')}</tbody></table><div class="queue-label">队列（先进先出）</div><div class="sequence-strip">${queue.length?queue.map(id=>`<span class="sequence-node">${id}</span>`).join('<span class="sequence-arrow">←</span>'):'<span class="value-muted">空</span>'}</div><div class="queue-label">拓扑序列</div><div class="sequence-strip">${order.length?order.map(id=>`<span class="sequence-node done">${id}</span>`).join('<span class="sequence-arrow">→</span>'):'<span class="value-muted">尚未输出节点</span>'}</div><div class="queue-label">已删除有向边：${processed.length}/${directedEdges.length}</div>`;
    }
  }

  function drawGraph(step){
    const isTopo=state.algorithm==='topo';
    const edges=isTopo?directedEdges:weightedEdges;
    const edgeClass=edge=>{
      const key=edgeKey(edge);
      if(state.algorithm==='dijkstra'){
        if(step?.edge===key)return 'active';
        if(step?.parent?.[edge.v]===edge.u||step?.parent?.[edge.u]===edge.v)return 'path';
        return '';
      }
      if(state.algorithm==='kruskal'){
        if(step?.edge===key)return step.type==='reject'?'rejected':'active';
        if(step?.accepted?.includes(key))return 'accepted';
        return '';
      }
      if(step?.edge===key)return 'active';
      if(step?.processed?.includes(key))return 'processed';
      return '';
    };
    let svg='<defs><marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8"/></marker><marker id="arrow-active" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b"/></marker></defs>';
    for(const edge of edges){
      const a=nodes.find(n=>n.id===edge.u),b=nodes.find(n=>n.id===edge.v);
      const dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy),ux=dx/len,uy=dy/len;
      const startX=a.x+ux*26,startY=a.y+uy*26,endX=b.x-ux*(isTopo?34:26),endY=b.y-uy*(isTopo?34:26);
      const klass=edgeClass(edge),marker=isTopo?(klass==='active'?'url(#arrow-active)':'url(#arrow)'):'';
      svg+=`<line class="edge ${klass} ${isTopo?'directed':''}" x1="${startX}" y1="${startY}" x2="${endX}" y2="${endY}" ${marker?`marker-end="${marker}"`:''}/>`;
      if(!isTopo){const mx=(a.x+b.x)/2,my=(a.y+b.y)/2;svg+=`<g><rect class="edge-label-bg" x="${mx-14}" y="${my-11}" width="28" height="22" rx="7"/><text class="edge-label" x="${mx}" y="${my}">${edge.w}</text></g>`;}
    }
    for(const node of nodes){
      let klass='node';
      if(state.algorithm==='dijkstra'){
        if(step?.settled?.includes(node.id))klass+=' settled';
        if(step?.current===node.id)klass+=' current';
        if(node.id===state.source)klass+=' source';
      }else if(state.algorithm==='kruskal'){
        if(step?.accepted?.length)klass+=' done';
      }else{
        if(step?.order?.includes(node.id))klass+=' done';
        if(step?.queue?.includes(node.id))klass+=' queued';
        if(step?.current===node.id)klass+=' current';
      }
      const extra=state.algorithm==='dijkstra'&&step?Number.isFinite(step.dist[node.id])?step.dist[node.id]:'∞':state.algorithm==='topo'&&step?`入度 ${step.indegree[node.id]}`:'';
      svg+=`<g class="${klass}" transform="translate(${node.x} ${node.y})"><circle r="25"/><text y="1">${node.id}</text>${extra?`<text class="node-extra" y="42">${extra}</text>`:''}</g>`;
    }
    ui.svg.innerHTML=svg;
    ui.svg.setAttribute('aria-label',`${algorithms[state.algorithm].title}，第 ${Math.max(0,state.step+1)} 步`);
  }

  function render(){
    const step=state.step>=0?state.steps[state.step]:null;
    drawGraph(step);renderData(step);
    const total=state.steps.length;
    ui.counter.textContent=step?`${state.step+1} / ${total}`:`准备 / ${total} 步`;
    ui.explainCounter.textContent=step?`第 ${state.step+1} 步 / 共 ${total} 步`:'准备';
    ui.explain.textContent=step?step.message:'点击「下一步」开始演示，也可以播放完整过程。';
    ui.progress.style.width=step?`${((state.step+1)/total)*100}%`:'0%';
    ui.prev.disabled=state.step<0;ui.next.disabled=state.step>=total-1;
    ui.play.textContent=state.playing?'⏸ 暂停':'▶ 播放';
    if(!state.playing&&state.step>=total-1)ui.play.textContent='✓ 已完成';
    ui.play.disabled=!state.playing&&state.step>=total-1;
  }

  function stop(){if(state.timer){clearInterval(state.timer);state.timer=null;}state.playing=false;}
  function tick(){if(state.step>=state.steps.length-1){stop();render();return;}state.step++;render();}
  function play(){
    if(state.playing){stop();render();return;}
    if(state.step>=state.steps.length-1)return;
    state.playing=true;render();state.timer=setInterval(tick,Math.round(900/state.speed));
  }
  function reset(){stop();buildSteps();render();}
  function selectAlgorithm(name){stop();state.algorithm=name;document.querySelectorAll('.algorithm-tab').forEach(tab=>{const active=tab.dataset.algorithm===name;tab.classList.toggle('active',active);tab.setAttribute('aria-selected',String(active));});renderShell();reset();}

  $('btnPrev').addEventListener('click',()=>{stop();if(state.step>=0)state.step--;render();});
  $('btnNext').addEventListener('click',()=>{stop();tick();});
  $('btnPlay').addEventListener('click',play);
  $('btnReset').addEventListener('click',reset);
  $('speed').addEventListener('input',()=>{state.speed=Number(ui.speed.value);ui.speedVal.textContent=`${state.speed.toFixed(1)}×`;if(state.playing){stop();play();}});
  $('sourceSelect').innerHTML=nodes.map(n=>`<option value="${n.id}">${n.id}</option>`).join('');
  $('sourceSelect').addEventListener('change',()=>{state.source=ui.source.value;reset();});
  document.querySelectorAll('.algorithm-tab').forEach(tab=>tab.addEventListener('click',()=>selectAlgorithm(tab.dataset.algorithm)));
  document.addEventListener('keydown',event=>{
    if(event.target.matches('input,select,textarea,button'))return;
    if(event.key==='ArrowLeft'){event.preventDefault();ui.prev.click();}
    else if(event.key==='ArrowRight'){event.preventDefault();ui.next.click();}
    else if(event.code==='Space'){event.preventDefault();if(!ui.play.disabled)ui.play.click();}
    else if(event.key.toLowerCase()==='r')reset();
  });

  renderShell();reset();
})();
