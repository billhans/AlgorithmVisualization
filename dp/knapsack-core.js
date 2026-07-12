/* ============================================================
   背包可视化教学 —— 公共逻辑核心
   思路：先把整个 DP 过程跑一遍，把每一步的「快照」存成数组，
        之后播放/步进都只是回放快照，逻辑稳定、跳转可靠。

   用法：在每个背包页面调用 initKnapsack({ mode: 'complete' | 'zeroOne' })
   独立页固定模式，不再有 tab 切换。
   ============================================================ */

function initKnapsack(config){
  'use strict';

  // ---------- 全局状态 ----------
  const state = {
    mode: config.mode,           // 'complete' | 'zeroOne' —— 由页面固定
    items: [                     // 默认数据
      {w:2, v:3},
      {w:3, v:4},
      {w:4, v:5},
    ],
    capacity: 7,
    steps: [],                   // 预计算的步骤序列
    stepIdx: -1,                 // 当前步索引；-1 表示初始状态
    playing: false,
    speed: 1,
    timer: null,
  };

  // ---------- DOM 引用 ----------
  const $ = id => document.getElementById(id);
  const table2d = $('table2d');
  const table1d = $('table1d');
  const arrows2d = $('arrows2d').querySelector('svg');
  const arrows1d = $('arrows1d').querySelector('svg');
  const scanBar  = $('scanBar');
  const dirBadge = $('dirBadge');
  const explainBody = $('explainBody');
  const stepCounter = $('stepCounter');
  const progressFill = $('progressFill');
  const f2d = $('f2d'), f1d = $('f1d'), fDir = $('fDir'), fLabel = $('fLabel');

  /* ============================================================
     1. 预计算步骤序列
     每一步记录：当前物品 i、容量 j、被读取与被写入的依赖、写前写后值、说明文字
     同时维护二维表与一维表的快照
     ============================================================ */
  function buildSteps(){
    const steps = [];
    const n = state.items.length;
    const W = state.capacity;
    const isC = state.mode === 'complete';

    // 二维 dp（含第 0 行/列占位）
    const dp2 = Array.from({length:n+1}, ()=>new Array(W+1).fill(0));
    // 一维 dp（滚动数组）
    const dp1 = new Array(W+1).fill(0);

    // 初始快照（全 0）
    steps.push({
      type:'init',
      dp2: snapshot(dp2),
      dp1: [...dp1],
      explain:`初始化：二维 <span class="mono">dp[0..${n}][0..${W}]</span> 与一维 <span class="mono">dp[0..${W}]</span> 全部为 0。物品编号从 1 开始。`
    });

    for(let i=1;i<=n;i++){
      const item = state.items[i-1];
      const w = item.w, v = item.v;

      // 跳过容量放不下的部分，但仍记录处理过程
      // 内层 j 的方向是核心区别：
      //   完全背包：正序 j=0..W  （读 dp[j-w] 已是本物品更新后的值 → 可重复选）
      //   0/1 背包：逆序 j=W..0  （读 dp[j-w] 仍是上一物品的值 → 每物只选一次）
      const jOrder = isC
        ? Array.from({length:W+1},(_,j)=>j)
        : Array.from({length:W+1},(_,k)=>W-k);

      // 物品开始
      steps.push({
        type:'itemStart', i, w, v,
        dp2: snapshot(dp2),
        dp1: [...dp1],
        explain:`<b>物品 ${i}</b>（重量 <span class="mono">w=${w}</span>，价值 <span class="mono">v=${v}</span>）开始处理。一维内层 j 将按 <b>${isC?'正序 0→'+W+'（←→）':'逆序 '+W+'→0（→←）'}</b> 遍历。`
      });

      for(const j of jOrder){
        if(j < w){
          // 放不下：dp 值不变（二维=继承上一行，一维=本来就继承）
          dp2[i][j] = dp2[i-1][j];
          // 一维：dp1[j] 不变
          steps.push({
            type:'step', i, j, w, v,
            skip: {i:i-1, j},            // 不选依赖：上一行同列
            pick: null,                   // 放不下，没有「选」
            before2: dp2[i-1][j], after2: dp2[i][j],
            before1: dp1[j], after1: dp1[j],
            decided: 'cant',
            dp2: snapshot(dp2),
            dp1: [...dp1],
            explain:`物品 ${i}，容量 <span class="mono">j=${j}</span>：放不下（<span class="mono">${j} < w=${w}</span>），直接继承，<span class="mono">dp[${i}][${j}] = dp[${i-1}][${j}] = ${dp2[i][j]}</span>。`
          });
          continue;
        }

        // 二维依赖
        //   完全：选 = dp[i][j-w]   （同行左侧，可能已含本物品）
        //   0/1  ：选 = dp[i-1][j-w]（左上，上一物品的值）
        const pick2_i = isC ? i : i-1;
        const pick2_j = j - w;
        const skip2_val = dp2[i-1][j];
        const pick2_val = dp2[pick2_i][pick2_j];
        const new2 = Math.max(skip2_val, pick2_val + v);
        dp2[i][j] = new2;

        // 一维依赖（同一时刻更新）
        //   无论哪种模式，一维读的都是 dp1[j-w]，但因为 j 的遍历方向不同：
        //     完全(正序)：dp1[j-w] 刚被本物品更新 → 等价二维的 dp[i][j-w]
        //     0/1(逆序)：dp1[j-w] 还是上一物品的值 → 等价二维的 dp[i-1][j-w]
        const pick1_val = dp1[j-w];
        const skip1_val = dp1[j];        // 不选 = 保持当前值（一维里继承就是不动）
        const new1 = Math.max(skip1_val, pick1_val + v);
        const before1 = dp1[j];
        dp1[j] = new1;

        // 决策结果（以二维为准，二者一致）
        const chosePick = (pick2_val + v) >= skip2_val;

        // 标注依赖坐标（供高亮）
        // 二维
        const dep2 = {
          pick: {i:pick2_i, j:pick2_j},
          skip: {i:i-1, j},
        };
        // 一维：不选依赖在一维里其实就是「当前格保持」，但我们仍高亮「选」依赖 dp[j-w]
        const dep1 = {
          pick: {j:j-w},
          // skip 在一维不指向别处，留 null（当前格自身参与 max）
        };

        steps.push({
          type:'step', i, j, w, v,
          dep2, dep1,
          before2: skip2_val, after2: new2,
          before1, after1: new1,
          pick2_val, skip2_val,
          pick1_val, skip1_val,
          decided: chosePick ? 'pick' : 'skip',
          dp2: snapshot(dp2),
          dp1: [...dp1],
          explain:
            `<b>物品 ${i}</b>，容量 <span class="mono">j=${j}</span>：<br>` +
            (isC
              ? `<span class="pick-c">选</span>：读同行左侧 <span class="mono">dp[${i}][${j-w}] = ${pick2_val}</span>，+${v} = <span class="mono">${pick2_val+v}</span><br>`
              : `<span class="pick-c">选</span>：读左上 <span class="mono">dp[${i-1}][${j-w}] = ${pick2_val}</span>，+${v} = <span class="mono">${pick2_val+v}</span><br>`) +
            `<span class="skip-c">不选</span>：读正上方 <span class="mono">dp[${i-1}][${j}] = ${skip2_val}</span><br>` +
            `取较大者 → <span class="mono">dp[${i}][${j}] = ${new2}</span> ` +
            (chosePick ? `<span class="chosen">（选，可${isC?'重复':''}使用本物品）</span>` : `<span class="rejected">（不选）</span>`) +
            `<br><span style="color:var(--text-mute);font-size:12px">一维同步：dp[${j}] 由 ${before1} → <span class="mono">${new1}</span></span>`
        });
      }
    }

    // 结束
    steps.push({
      type:'done',
      dp2: snapshot(dp2),
      dp1: [...dp1],
      answer2: dp2[n][W],
      answer1: dp1[W],
      explain:`🎉 全部完成！最大价值 = <span class="mono">${dp1[W]}</span>。二维 <span class="mono">dp[${n}][${W}]</span> 与一维 <span class="mono">dp[${W}]</span> 结果一致，验证了一维滚动数组的正确性。`
    });

    state.steps = steps;
    state.stepIdx = -1;
  }

  // 深拷贝二维表快照
  function snapshot(dp2){
    return dp2.map(row=>[...row]);
  }

  /* ============================================================
     2. 渲染表格结构（随物品/容量变化时重建）
     ============================================================ */
  function buildTables(){
    const n = state.items.length;
    const W = state.capacity;
    const isC = state.mode === 'complete';

    // ---- 二维表 ----
    let h = '<thead><tr><th class="row-h">i ╲ j</th>';
    for(let j=0;j<=W;j++) h += `<th>${j}</th>`;
    h += '</tr></thead><tbody>';
    // i=0..n
    for(let i=0;i<=n;i++){
      h += `<tr><th class="row-h">i=${i}${i>0?'<br><span style="font-size:9px;color:var(--text-mute)">物品'+i+'</span>':''}</th>`;
      for(let j=0;j<=W;j++){
        h += `<td id="c2-${i}-${j}" class="dim">0</td>`;
      }
      h += '</tr>';
    }
    h += '</tbody>';
    table2d.innerHTML = h;

    // ---- 一维表 ----
    let h1 = '<thead><tr>';
    for(let j=0;j<=W;j++) h1 += `<th>j=${j}</th>`;
    h1 += '</tr></thead><tbody><tr>';
    for(let j=0;j<=W;j++){
      h1 += `<td id="c1-${j}" class="dim">0</td>`;
    }
    h1 += '</tr></tbody>';
    table1d.innerHTML = h1;

    // ---- 方向标签 ----
    dirBadge.innerHTML = isC
      ? '<span class="badge-dir forward">j 正序 0 → '+W+'</span>'
      : '<span class="badge-dir backward">j 逆序 '+W+' → 0</span>';

    // ---- 公式 ----
    if(isC){
      fLabel.textContent = '二维状态转移（完全背包）';
      f2d.innerHTML = 'dp[<span class="h-cur">i</span>][<span class="h-cur">j</span>] = max( dp[i-1][j] , <span class="h-pick">dp[i][j-w]</span> + v )';
      f1d.innerHTML = 'dp[<span class="h-cur">j</span>] = max( dp[j] , <span class="h-pick">dp[j-w]</span> + v )';
      fDir.innerHTML = '<span style="color:#fbbf24">j 正序 0 → W</span>（使 dp[j-w] 为本物品已更新的新值 → 可重复选）';
    }else{
      fLabel.textContent = '二维状态转移（0/1 背包）';
      f2d.innerHTML = 'dp[<span class="h-cur">i</span>][<span class="h-cur">j</span>] = max( dp[i-1][j] , <span class="h-pick">dp[i-1][j-w]</span> + v )';
      f1d.innerHTML = 'dp[<span class="h-cur">j</span>] = max( dp[j] , <span class="h-pick">dp[j-w]</span> + v )';
      fDir.innerHTML = '<span style="color:#7dd3fc">j 逆序 W → 0</span>（保证 dp[j-w] 仍是上一物品的旧值 → 每物只选一次）';
    }
  }

  /* ============================================================
     3. 渲染某一步（核心：把快照画到表上 + 高亮依赖）
     ============================================================ */
  function renderStep(){
    const steps = state.steps;
    const idx = state.stepIdx;
    const cur = idx >= 0 ? steps[idx] : null;
    const n = state.items.length;
    const W = state.capacity;

    // 清空所有高亮 & 重置值
    for(let i=0;i<=n;i++){
      for(let j=0;j<=W;j++){
        const cell = $('c2-'+i+'-'+j);
        if(cell){
          cell.className='dim';
          cell.textContent='0';
        }
      }
    }
    for(let j=0;j<=W;j++){
      const cell = $('c1-'+j);
      if(cell){cell.className='dim';cell.textContent='0';}
    }
    clearArrows();
    scanBar.style.display='none';

    if(!cur){
      explainBody.innerHTML = '点击「播放」或「下一步」开始演示。';
      stepCounter.textContent = '准备 / ' + (steps.length-1) + ' 步';
      progressFill.style.width = '0%';
      return;
    }

    // 画快照值
    for(let i=0;i<=n;i++){
      for(let j=0;j<=W;j++){
        const cell = $('c2-'+i+'-'+j);
        if(cell){
          const val = cur.dp2[i][j];
          cell.textContent = val;
          if(val!==0) cell.classList.remove('dim');
        }
      }
    }
    for(let j=0;j<=W;j++){
      const cell = $('c1-'+j);
      if(cell){
        const val = cur.dp1[j];
        cell.textContent = val;
        if(val!==0) cell.classList.remove('dim');
      }
    }

    // 高亮当前步
    if(cur.type==='step'){
      // 二维：当前格、选依赖、不选依赖
      const ci = cur.i, cj = cur.j;
      const curCell2 = $('c2-'+ci+'-'+cj);
      if(curCell2){
        curCell2.classList.add('cur');
        curCell2.textContent = cur.after2;
      }
      if(cur.dep2 && cur.dep2.pick){
        const p = cur.dep2.pick;
        const pc = $('c2-'+p.i+'-'+p.j);
        if(pc && !(p.i===ci&&p.j===cj)) pc.classList.add('pick');
      }
      if(cur.dep2 && cur.dep2.skip){
        const s = cur.dep2.skip;
        const sc = $('c2-'+s.i+'-'+s.j);
        if(sc && !(s.i===ci&&s.j===cj)) sc.classList.add('skip');
      }

      // 一维：当前格、选依赖
      const curCell1 = $('c1-'+cj);
      if(curCell1){
        curCell1.classList.add('cur');
        curCell1.textContent = cur.after1;
      }
      if(cur.dep1 && cur.dep1.pick){
        const pc = $('c1-'+cur.dep1.pick.j);
        if(pc && cur.dep1.pick.j!==cj) pc.classList.add('pick');
      }

      // 移动扫描条到当前 j（一维表）
      moveScanBar(cj);

      // 画箭头
      drawArrows(cur);
    }else if(cur.type==='done'){
      // 高亮最终答案
      const a2 = $('c2-'+n+'-'+W);
      const a1 = $('c1-'+W);
      if(a2) a2.classList.add('done');
      if(a1) a1.classList.add('done');
    }else if(cur.type==='itemStart' || cur.type==='init'){
      // 物品开始：高亮对应行
      if(cur.type==='itemStart'){
        for(let j=0;j<=W;j++){
          const c = $('c2-'+cur.i+'-'+j);
          if(c) c.style.boxShadow='inset 0 0 0 1px rgba(168,85,247,.25)';
        }
      }
    }

    explainBody.innerHTML = cur.explain || '';
    stepCounter.textContent = (idx) + ' / ' + (steps.length-1) + ' 步';
    progressFill.style.width = (idx/(steps.length-1)*100)+'%';
  }

  // 移动一维扫描条到列 j
  function moveScanBar(j){
    const cell = $('c1-'+j);
    if(!cell){scanBar.style.display='none';return;}
    const wrap = $('scroll1d');
    const cellRect = cell.getBoundingClientRect();
    const wrapRect = wrap.getBoundingClientRect();
    const left = (cellRect.left - wrapRect.left) + wrap.scrollLeft - 3;
    scanBar.style.left = left + 'px';
    scanBar.style.width = (cellRect.width + 6) + 'px';
    scanBar.style.display = 'block';
  }

  // 画箭头：依赖 → 当前格
  function drawArrows(cur){
    if(cur.type!=='step') return;
    // 二维
    if(cur.dep2){
      const target = $('c2-'+cur.i+'-'+cur.j);
      if(target){
        if(cur.dep2.pick){
          const p = cur.dep2.pick;
          if(!(p.i===cur.i&&p.j===cur.j))
            addArrow(arrows2d, $('c2-'+p.i+'-'+p.j), target, 'var(--pick)');
        }
        if(cur.dep2.skip){
          const s = cur.dep2.skip;
          if(!(s.i===cur.i&&s.j===cur.j))
            addArrow(arrows2d, $('c2-'+s.i+'-'+s.j), target, 'var(--skip)');
        }
      }
    }
    // 一维
    if(cur.dep1 && cur.dep1.pick){
      const target = $('c1-'+cur.j);
      const src = $('c1-'+cur.dep1.pick.j);
      if(target && src && cur.dep1.pick.j!==cur.j)
        addArrow(arrows1d, src, target, 'var(--pick)');
    }
  }

  function addArrow(svgEl, srcEl, dstEl, color){
    if(!srcEl||!dstEl) return;
    const card = svgEl.parentElement;
    const cardRect = card.getBoundingClientRect();
    const s = srcEl.getBoundingClientRect();
    const d = dstEl.getBoundingClientRect();
    const x1 = s.left+s.width/2 - cardRect.left;
    const y1 = s.top+s.height/2 - cardRect.top;
    const x2 = d.left+d.width/2 - cardRect.left;
    const y2 = d.top+d.height/2 - cardRect.top;
    // 画一条带圆点的线
    const ns='http://www.w3.org/2000/svg';
    const line=document.createElementNS(ns,'line');
    line.setAttribute('x1',x1);line.setAttribute('y1',y1);
    line.setAttribute('x2',x2);line.setAttribute('y2',y2);
    line.setAttribute('stroke',color);line.setAttribute('stroke-width',2);
    line.setAttribute('stroke-dasharray','4 3');line.setAttribute('opacity','.8');
    // 终点小圆
    const dot=document.createElementNS(ns,'circle');
    dot.setAttribute('cx',x2);dot.setAttribute('cy',y2);dot.setAttribute('r',3);
    dot.setAttribute('fill',color);
    svgEl.appendChild(line);svgEl.appendChild(dot);
  }
  function clearArrows(){
    arrows2d.innerHTML='';arrows1d.innerHTML='';
  }

  /* ============================================================
     4. 播放控制
     ============================================================ */
  function next(){ if(state.stepIdx < state.steps.length-1){state.stepIdx++;renderStep();} else pause(); }
  function prev(){ if(state.stepIdx >= 0){state.stepIdx--;renderStep();} }
  function play(){
    if(state.stepIdx>=state.steps.length-1) state.stepIdx=-1; // 到头则重来
    state.playing=true;
    $('btnPlay').textContent='⏸ 暂停';
    scheduleNext();
  }
  function pause(){
    state.playing=false;
    if(state.timer){clearTimeout(state.timer);state.timer=null;}
    $('btnPlay').textContent='▶ 播放';
  }
  function scheduleNext(){
    if(!state.playing) return;
    const interval = 1100 / state.speed;
    state.timer = setTimeout(()=>{
      if(state.stepIdx>=state.steps.length-1){pause();return;}
      next();
      scheduleNext();
    }, interval);
  }
  function reset(){
    pause();
    state.stepIdx=-1;
    renderStep();
  }

  /* ============================================================
     5. 数据编辑
     ============================================================ */
  function renderItemsList(){
    const list = $('itemsList');
    list.innerHTML='';
    state.items.forEach((it,idx)=>{
      const row=document.createElement('div');
      row.className='item-row';
      row.innerHTML=`
        <span class="item-idx">#${idx+1}</span>
        <input type="number" class="item-input" data-idx="${idx}" data-field="w" value="${it.w}" min="1" max="20">
        <input type="number" class="item-input" data-idx="${idx}" data-field="v" value="${it.v}" min="1" max="99">
        <button class="item-del" data-idx="${idx}" title="删除">×</button>
      `;
      list.appendChild(row);
    });
  }
  function rebuild(){
    // 校验数据
    state.items = state.items.map(it=>({
      w: Math.max(1, parseInt(it.w)||1),
      v: Math.max(1, parseInt(it.v)||1),
    }));
    state.capacity = Math.max(1, Math.min(20, parseInt(state.capacity)||1));
    pause();
    buildTables();
    buildSteps();
    renderStep();
  }

  /* ============================================================
     6. 事件绑定（独立页：无 tab 切换、无 M 快捷键）
     ============================================================ */
  // 播放按钮
  $('btnPlay').addEventListener('click',()=>{ state.playing ? pause() : play(); });
  $('btnNext').addEventListener('click',()=>{pause();next();});
  $('btnPrev').addEventListener('click',()=>{pause();prev();});
  $('btnReset').addEventListener('click',reset);
  $('speed').addEventListener('input',e=>{
    state.speed = parseFloat(e.target.value);
    $('speedVal').textContent = state.speed.toFixed(1)+'×';
    if(state.playing){ clearTimeout(state.timer); scheduleNext(); }
  });

  // 物品编辑（事件委托）
  $('itemsList').addEventListener('input',e=>{
    const t=e.target;
    if(t.classList.contains('item-input')){
      const idx=+t.dataset.idx, field=t.dataset.field;
      state.items[idx][field]=parseInt(t.value)||0;
    }
  });
  $('itemsList').addEventListener('change',rebuild);
  $('itemsList').addEventListener('click',e=>{
    const b=e.target.closest('.item-del');
    if(b){
      const idx=+b.dataset.idx;
      if(state.items.length<=1) return;
      state.items.splice(idx,1);
      renderItemsList();
      rebuild();
    }
  });
  $('btnAddItem').addEventListener('click',()=>{
    if(state.items.length>=8) return;
    state.items.push({w:1,v:1});
    renderItemsList();
    rebuild();
  });

  // 容量
  $('capacityInput').addEventListener('change',e=>{
    state.capacity=parseInt(e.target.value)||1;
    rebuild();
  });

  // 键盘快捷键（独立页无 M 切换模式）
  document.addEventListener('keydown',e=>{
    if(e.target.tagName==='INPUT') return;
    if(e.key==='ArrowRight'){e.preventDefault();pause();next();}
    else if(e.key==='ArrowLeft'){e.preventDefault();pause();prev();}
    else if(e.key===' '){e.preventDefault();state.playing?pause():play();}
    else if(e.key==='r'||e.key==='R'){reset();}
  });

  // 窗口缩放时重画箭头与扫描条
  window.addEventListener('resize',()=>{ if(state.stepIdx>=0) renderStep(); });

  /* ============================================================
     启动
     ============================================================ */
  renderItemsList();
  buildTables();
  buildSteps();
  renderStep();
}
