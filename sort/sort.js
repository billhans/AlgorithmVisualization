/* 排序算法可视化：预生成数组快照、操作行与计数，所有控制都回放同一条步骤序列。 */
(() => {
  'use strict';

  const configs = {
    bubble:{name:'冒泡排序',complexity:'O(n²) / 最好 O(n)',space:'O(1)',stable:'稳定',
      note:'相邻元素逆序时交换。每一趟结束后，当前未排序区间的最大值到达末尾；若一趟没有交换，数组已经有序。',
      timeTeaching:'<div class="case-block"><span class="case-tag best">最好情况：已经有序</span><p>第一趟仍要比较 <code>n−1</code> 对相邻元素，但一次都不交换。<code>swapped</code> 仍为 false，算法提前结束，所以总工作量和 n 成正比：<strong>Θ(n)</strong>。</p></div><div class="case-block"><span class="case-tag worst">最坏情况：完全逆序</span><p>每一趟都要把一个最大值“冒”到右端。比较次数是 <code>(n−1)+(n−2)+…+1 = n(n−1)/2</code>，因此增长量级是 <strong>Θ(n²)</strong>。</p></div><p class="why-note">最好与最坏不同，是因为有序输入会触发“无交换就退出”；逆序输入则几乎每次比较都要交换。</p>',
      spaceTeaching:'<p>只用到 <code>i、j、end</code> 和一个 <code>swapped</code> 标记；交换时临时保存一个数。无论数组有多长，这些变量的数量都不随 n 增长，所以额外空间是 <strong>Θ(1)</strong>。</p><p class="why-note">排序直接改动原数组，没有另建一份随 n 增长的数组。</p>',
      stabilityTeaching:'只在左边<strong>严格大于</strong>右边时才交换。两个相等元素不会互相跨越；相邻交换也不会让它们绕过彼此，所以原先谁在前，排完仍谁在前。',
      demoBefore:[['2','A'],['2','B'],['1','C']],demoAfter:[['1','C'],['2','A'],['2','B']],demoReason:'A、B 的值相同，排序后仍是 A 在 B 前。',isStable:true,
      legend:[['#38bdf8','正在比较'],['#a855f7','刚发生交换'],['#22c55e','已排好位置']],
      code:['for end 从 n−1 到 1','swapped = false','for j 从 0 到 end−1','比较 a[j] 与 a[j+1]','若 a[j] > a[j+1]，交换','标记本趟末尾已就位']},
    selection:{name:'选择排序',complexity:'O(n²)',space:'O(1)',stable:'不稳定',
      note:'每一趟在未排序区间中找到最小值，放到区间最左端。比较次数固定，交换次数通常较少。',
      timeTeaching:'<div class="case-block"><span class="case-tag best">最好情况：已经有序</span><p>即使最小值正好就在区间开头，算法仍要扫描整个剩余区间，确认没有更小的数。</p></div><div class="case-block"><span class="case-tag worst">最坏情况：逆序也一样</span><p>第 1 趟看 <code>n−1</code> 个数，第 2 趟看 <code>n−2</code> 个数，直到最后：<code>(n−1)+…+1=n(n−1)/2</code>。输入顺序不会减少扫描量，所以最好、最坏都是 <strong>Θ(n²)</strong>。</p></div><p class="why-note">不同输入会改变交换次数，却不会改变“每趟必须找遍剩余区间”的比较次数。</p>',
      spaceTeaching:'<p>只保存当前区间左端 <code>i</code>、扫描位置 <code>j</code>、最小值位置 <code>min</code>，以及交换时的一个临时值。它们都是固定数量的变量，因此额外空间是 <strong>Θ(1)</strong>。</p><p class="why-note">选择排序原地交换，不需要复制数组。</p>',
      stabilityTeaching:'每趟把找到的最小值直接和区间首元素交换。这个远距离交换可能让两个相等元素彼此越过，因此相同值的原始先后顺序没有保证。',
      demoBefore:[['2','A'],['2','B'],['1','C']],demoAfter:[['1','C'],['2','B'],['2','A']],demoReason:'选出 1 并与首位的 2(A) 交换后，2(B) 留在前面，A、B 次序反转。',isStable:false,
      legend:[['#38bdf8','正在比较'],['#f59e0b','当前最小值'],['#22c55e','已排好位置']],
      code:['for i 从 0 到 n−2','min = i','for j 从 i+1 到 n−1','比较 a[j] 与 a[min]','若 a[j] 更小，更新 min','交换 a[i] 与 a[min]','标记区间左端已就位']},
    insertion:{name:'插入排序',complexity:'O(n²) / 最好 O(n)',space:'O(1)',stable:'稳定',
      note:'左侧始终保持有序。每次拿起一个 key，把比它大的元素右移，再把 key 插入空位；接近有序时效率较高。',
      timeTeaching:'<div class="case-block"><span class="case-tag best">最好情况：已经有序</span><p>每次取出 key，只需和它左边最近的元素比一次，就知道不用移动。总共约 <code>n−1</code> 次比较：<strong>Θ(n)</strong>。</p></div><div class="case-block"><span class="case-tag worst">最坏情况：完全逆序</span><p>插入第 2 个元素时要右移 1 个数，第 3 个要右移 2 个……总移动数为 <code>1+2+…+(n−1)=n(n−1)/2</code>，所以是 <strong>Θ(n²)</strong>。</p></div><p class="why-note">已排好序时每个新元素很快找到位置；逆序时每个新元素都要穿过整个有序前缀。</p>',
      spaceTeaching:'<p>一次只暂存一个 <code>key</code>，再用 <code>i、j</code> 记录当前位置。元素在原数组内右移，不创建新数组，因此额外空间是 <strong>Θ(1)</strong>。</p><p class="why-note">图中的“空位”只是把 key 暂存到变量后，为了讲解右移而画出的可视化标记。</p>',
      stabilityTeaching:'移动条件是左侧元素<strong>大于</strong> key 才右移。遇到相等值时停止，新的相等元素会插在旧元素后面，所以相同值保持原有先后顺序。',
      demoBefore:[['2','A'],['2','B'],['1','C']],demoAfter:[['1','C'],['2','A'],['2','B']],demoReason:'插入 1 时两个 2 一起右移，但相互之间不交换，A 仍在 B 前。',isStable:true,
      legend:[['#38bdf8','正在比较'],['#a855f7','手中的 key'],['#22c55e','已排好位置']],
      code:['for i 从 1 到 n−1','key = a[i]，暂存 key','当 j≥0 且 a[j] > key','将 a[j] 右移到 a[j+1]','j = j−1','将 key 放入 a[j+1]']},
    quick:{name:'快速排序',complexity:'平均 O(n log n) / 最坏 O(n²)',space:'平均 O(log n) / 最坏 O(n)',stable:'不稳定',
      note:'这里采用 Lomuto 分区并选区间末尾为 pivot。分区后 pivot 到达最终位置，再递归处理左右两段。',
      timeTeaching:'<div class="case-block"><span class="case-tag best">平均 / 较好：分区比较均衡</span><p>若 pivot 大致把数组分成两半，递归层数约为 <code>log₂ n</code>。每层所有分区合计扫描约 n 个元素，于是是 <strong>Θ(n log n)</strong>。</p></div><div class="case-block"><span class="case-tag worst">最坏情况：每次都极不均衡</span><p>本演示固定选末尾作 pivot。对已排序数组，pivot 常是最大值，分成 <code>n−1</code> 个和 0 个；下一轮只少一个元素。比较数变成 <code>(n−1)+…+1</code>，即 <strong>Θ(n²)</strong>。</p></div><p class="why-note">所以快排的时间取决于 pivot 把问题切得多均匀；随机选 pivot 或三数取中能降低遇到坏分区的机会。</p>',
      spaceTeaching:'<p>分区本身在原数组中交换，只需固定几个下标和 pivot，除递归外是 <code>Θ(1)</code>。递归调用需要保存尚未处理的区间：</p><ul><li>均衡分区：递归深度约 <code>log₂ n</code>，调用栈 <strong>Θ(log n)</strong>。</li><li>极端分区：递归深度可到 <code>n</code>，调用栈 <strong>Θ(n)</strong>。</li></ul><p class="why-note">这里的空间复杂度把递归调用栈也算进去。</p>',
      stabilityTeaching:'分区时会把元素跨位置交换。相等值也可能被 pivot 的交换隔开并反转，因此快排不能保证相同值按原顺序出现。',
      demoBefore:[['2','A'],['2','B'],['1','C']],demoAfter:[['1','C'],['2','B'],['2','A']],demoReason:'pivot=1 最终与首元素 2(A) 交换，2(B) 留在前面，A、B 次序反转。',isStable:false,
      legend:[['#fb7185','pivot 基准值'],['#38bdf8','正在比较'],['#a855f7','分区交换'],['#22c55e','已确定位置']],
      code:['选 a[high] 作为 pivot','i = low−1','扫描 j = low … high−1','比较 a[j] 与 pivot','若 a[j] ≤ pivot，移入左区','把 pivot 放到分界位置','递归处理左右区间']},
    merge:{name:'归并排序',complexity:'O(n log n)',space:'O(n)',stable:'稳定',
      note:'先递归拆分区间，再比较两个有序子数组的首元素，把较小值写回原数组。归并时会使用临时空间。',
      timeTeaching:'<div class="case-block"><span class="case-tag best">最好情况</span><span class="case-tag worst">最坏情况</span><p>不论原数组是否有序，都要递归拆到单个元素，再逐层合并。共有约 <code>log₂ n</code> 层；每层写回的元素总数是 n，所以总工作量是 <strong>Θ(n log n)</strong>。</p></div><p class="why-note">有序输入有时会减少“比较”次数，但仍要把元素写进合并结果，因此总体量级不会降到线性。</p>',
      spaceTeaching:'<p>合并长度为 k 的区间时，左右两段会被复制到临时数组中，合计 k 个元素。顶层合并最多暂存 n 个元素，所以辅助数组需要 <strong>Θ(n)</strong>；递归栈另需 <code>Θ(log n)</code>，合起来仍是 <strong>Θ(n)</strong>。</p><p class="why-note">与原地排序不同，归并排序用额外内存换取稳定的 <code>n log n</code> 时间。</p>',
      stabilityTeaching:'合并时若左右两边的值相等，代码用 <code>左值 ≤ 右值</code> 先取左边。左半段来自原数组中更靠前的位置，因此相等元素始终先取原来靠前的那个。',
      demoBefore:[['2','A'],['2','B'],['1','C']],demoAfter:[['1','C'],['2','A'],['2','B']],demoReason:'合并两段时遇到相等的 2，先取左段中的 A，再取右段中的 B。',isStable:true,
      legend:[['#f59e0b','当前归并区间'],['#38bdf8','正在比较'],['#a855f7','写入结果'],['#22c55e','已完成的有序段']],
      code:['把区间拆成左右两半','比较左右子数组当前元素','把较小值写回原数组','复制左侧或右侧剩余元素','区间归并完成']}
  };

  const $=id=>document.getElementById(id);
  const state={algorithm:'bubble',values:[42,18,63,27,51,9,36],steps:[],step:-1,playing:false,timer:null,speed:1};
  const ui={facts:$('algorithmFacts'),note:$('algorithmNote'),legend:$('legend'),input:$('arrayInput'),error:$('inputError'),
    stage:$('arrayStage'),caption:$('arrayCaption'),subtitle:$('arraySubtitle'),code:$('codeList'),codeTitle:$('codeTitle'),metrics:$('metrics'),
    timeExplanation:$('timeExplanation'),spaceExplanation:$('spaceExplanation'),stabilityExplanation:$('stabilityExplanation'),
    stabilityBefore:$('stabilityBefore'),stabilityAfter:$('stabilityAfter'),stabilityResult:$('stabilityResult'),
    counter:$('stepCounter'),explainCounter:$('explainCounter'),explain:$('explainBody'),progress:$('progressFill'),
    prev:$('btnPrev'),next:$('btnNext'),play:$('btnPlay'),reset:$('btnReset'),speed:$('speed'),speedVal:$('speedVal')};

  function sortedAll(n){return Array.from({length:n},(_,i)=>i);}
  function buildSteps(){
    const a=[...state.values],steps=[];let comparisons=0,swaps=0,writes=0;
    const add=(type,message,extra={})=>steps.push({type,message,array:[...a],comparisons,swaps,writes,...extra});
    const doSwap=(i,j)=>{if(i===j)return false;[a[i],a[j]]=[a[j],a[i]];swaps++;writes+=2;return true;};
    add('start',`准备对 ${a.length} 个数排序。每个快照记录当前数组、活动位置与累计操作次数。`,{line:null});

    if(state.algorithm==='bubble'){
      const fixed=new Set();
      for(let end=a.length-1;end>0;end--){
        let swapped=false;
        for(let j=0;j<end;j++){
          comparisons++;
          add('compare',`比较下标 ${j} 和 ${j+1}：${a[j]} 与 ${a[j+1]}。${a[j]>a[j+1]?'左边更大，需要交换。':'顺序正确，保持不动。'}`,{line:3,compare:[j,j+1],sorted:[...fixed]});
          if(a[j]>a[j+1]){doSwap(j,j+1);swapped=true;add('swap',`交换 ${a[j+1]} 和 ${a[j]}。较大的元素继续向右移动。`,{line:4,swap:[j,j+1],sorted:[...fixed]});}
        }
        fixed.add(end);add('pass',`第 ${a.length-end} 趟结束：${a[end]} 已到达最终位置。`,{line:5,sorted:[...fixed]});
        if(!swapped){for(let i=0;i<end;i++)fixed.add(i);add('early',`本趟没有发生交换，数组已经有序，可以提前结束。`,{line:5,sorted:[...fixed]});break;}
      }
    }else if(state.algorithm==='selection'){
      const fixed=new Set();
      for(let i=0;i<a.length-1;i++){
        let min=i;add('scan',`从下标 ${i} 开始扫描未排序区间，先把 ${a[min]} 当作当前最小值。`,{line:1,min,sorted:[...fixed]});
        for(let j=i+1;j<a.length;j++){
          comparisons++;const isSmaller=a[j]<a[min];
          add('compare',`比较 ${a[j]}（下标 ${j}）和当前最小值 ${a[min]}（下标 ${min}）：${isSmaller?'找到更小值，更新最小值位置。':'当前最小值不变。'}`,{line:3,compare:[j,min],min,sorted:[...fixed]});
          if(isSmaller){min=j;add('minimum',`${a[min]} 成为当前最小值。`,{line:4,min,sorted:[...fixed]});}
        }
        if(min!==i){const left=a[i],right=a[min];doSwap(i,min);add('swap',`把最小值 ${right} 与区间首元素 ${left} 交换。`,{line:5,swap:[i,min],min:null,sorted:[...fixed]});}
        fixed.add(i);add('pass',`下标 ${i} 已放入未排序区间的最左端，前缀长度为 ${fixed.size}。`,{line:6,sorted:[...fixed]});
      }
    }else if(state.algorithm==='insertion'){
      const fixed=new Set([0]);
      for(let i=1;i<a.length;i++){
        const key=a[i];a[i]=null;let hole=i,j=i-1;
        add('key',`取出下标 ${i} 的 ${key} 作为 key，左侧区间保持有序。`,{line:1,key,hole,sorted:[...fixed]});
        while(j>=0){
          comparisons++;const shift=a[j]>key;
          add('compare',`比较左侧 ${a[j]} 与 key ${key}：${shift?'左侧元素更大，需要右移。':'左侧元素不大于 key，停止移动。'}`,{line:2,compare:[j],key,hole,sorted:[...fixed]});
          if(!shift)break;
          a[j+1]=a[j];a[j]=null;writes++;hole=j;
          add('shift',`将 ${a[j+1]} 从下标 ${j} 右移到 ${j+1}，空位移到下标 ${j}。`,{line:3,compare:[j,j+1],key,hole,sorted:[...fixed]});j--;
        }
        a[j+1]=key;writes++;fixed.add(i);
        add('insert',`把 key=${key} 放入下标 ${j+1}。现在下标 0 到 ${i} 构成有序前缀。`,{line:5,key:null,hole:null,writeIndex:j+1,sorted:[...fixed]});
      }
    }else if(state.algorithm==='quick'){
      const fixed=new Set();
      function quickSort(low,high){
        if(low>high)return;
        if(low===high){fixed.add(low);add('base',`区间只有一个元素 ${a[low]}，无需比较，位置已经确定。`,{line:6,range:[low,high],sorted:[...fixed]});return;}
        const pivot=a[high];let i=low-1;
        add('pivot',`处理区间 [${low}, ${high}]，选择末尾的 ${pivot} 作为 pivot。`,{line:0,pivotIndex:high,range:[low,high],sorted:[...fixed]});
        for(let j=low;j<high;j++){
          comparisons++;const goesLeft=a[j]<=pivot;
          add('compare',`比较 ${a[j]} 与 pivot ${pivot}：${goesLeft?'放入左分区（≤ pivot）。':'留在右分区（> pivot）。'}`,{line:3,compare:[j,high],pivotIndex:high,range:[low,high],divider:i,sorted:[...fixed]});
          if(goesLeft){i++;if(i!==j){const x=a[i],y=a[j];doSwap(i,j);add('swap',`交换 ${x} 和 ${y}，把较小值移到 pivot 左侧。`,{line:4,swap:[i,j],pivotIndex:high,range:[low,high],divider:i,sorted:[...fixed]});}else add('place',`${a[j]} 已在左分区边界内，不需要交换。`,{line:4,compare:[j],pivotIndex:high,range:[low,high],divider:i,sorted:[...fixed]});}
        }
        const pivotPos=i+1;
        if(pivotPos!==high){const x=a[pivotPos],y=a[high];doSwap(pivotPos,high);add('pivotPlace',`分区结束：将 pivot ${y} 与 ${x} 交换，pivot 落在最终下标 ${pivotPos}。`,{line:5,swap:[pivotPos,high],pivotIndex:pivotPos,range:[low,high],sorted:[...fixed]});}
        else add('pivotPlace',`分区结束：pivot 已在最终下标 ${pivotPos}，不需要交换。`,{line:5,pivotIndex:pivotPos,range:[low,high],sorted:[...fixed]});
        fixed.add(pivotPos);add('partition',`pivot=${pivot} 已就位。接下来分别处理它左侧和右侧的区间。`,{line:6,pivotIndex:pivotPos,range:[low,high],sorted:[...fixed]});
        quickSort(low,pivotPos-1);quickSort(pivotPos+1,high);
      }
      quickSort(0,a.length-1);
    }else{
      const fixed=new Set();
      function mergeSort(left,right){
        if(left>=right){fixed.add(left);add('base',`区间 [${left}, ${right}] 只有一个元素，视为有序。`,{line:0,range:[left,right],sorted:[...fixed]});return;}
        const mid=Math.floor((left+right)/2);
        add('split',`把区间 [${left}, ${right}] 从中点 ${mid} 拆成左右两半。`,{line:0,range:[left,right],mid,sorted:[...fixed]});
        mergeSort(left,mid);mergeSort(mid+1,right);
        const l=a.slice(left,mid+1),r=a.slice(mid+1,right+1);let i=0,j=0,k=left;
        add('mergeStart',`左右子数组已经分别有序，现在合并区间 [${left}, ${right}]。`,{line:1,range:[left,right],mid,sorted:[...fixed]});
        while(i<l.length&&j<r.length){
          comparisons++;const chooseLeft=l[i]<=r[j];
          add('compare',`比较两段首元素 ${l[i]} 和 ${r[j]}：${chooseLeft?'左边较小（相等时也先取左边，保证稳定）。':'右边较小。'}`,{line:1,compare:[left+i,mid+1+j],range:[left,right],writeIndex:k,mid,sorted:[...fixed]});
          a[k]=chooseLeft?l[i++]:r[j++];writes++;
          add('write',`把 ${a[k]} 写入结果下标 ${k}。`,{line:2,writeIndex:k,range:[left,right],mid,sorted:[...fixed]});k++;
        }
        while(i<l.length){a[k]=l[i++];writes++;add('write',`左段仍有元素，把 ${a[k]} 写入下标 ${k}。`,{line:3,writeIndex:k,range:[left,right],mid,sorted:[...fixed]});k++;}
        while(j<r.length){a[k]=r[j++];writes++;add('write',`右段仍有元素，把 ${a[k]} 写入下标 ${k}。`,{line:3,writeIndex:k,range:[left,right],mid,sorted:[...fixed]});k++;}
        for(let p=left;p<=right;p++)fixed.add(p);
        add('mergeDone',`区间 [${left}, ${right}] 合并完成，形成有序段。`,{line:4,range:[left,right],sorted:[...fixed]});
      }
      mergeSort(0,a.length-1);
    }
    add('done',`排序完成：${a.join('，')}。`,{line:null,sorted:sortedAll(a.length)});
    state.steps=steps;state.step=-1;
  }

  function renderShell(){
    const cfg=configs[state.algorithm];
    document.querySelectorAll('.algorithm-tab').forEach(tab=>{const active=tab.dataset.algorithm===state.algorithm;tab.classList.toggle('active',active);tab.setAttribute('aria-selected',String(active));});
    ui.facts.innerHTML=`<span class="fact-label">复杂度</span><span class="fact">${cfg.complexity}</span><span class="fact-label">额外空间</span><span class="fact">${cfg.space}</span><span class="fact-label">稳定性</span><span class="fact">${cfg.stable}</span>`;
    ui.note.innerHTML=`<strong>${cfg.name}：</strong>${cfg.note}`;
    ui.legend.innerHTML=cfg.legend.map(([color,label])=>`<div class="legend-item"><span class="legend-swatch" style="color:${color};background:${color}22"></span>${label}</div>`).join('');
    ui.codeTitle.textContent=`${cfg.name} · 伪代码`;
    ui.code.innerHTML=cfg.code.map(line=>`<li>${line}</li>`).join('');
    ui.timeExplanation.innerHTML=cfg.timeTeaching;
    ui.spaceExplanation.innerHTML=cfg.spaceTeaching;
    ui.stabilityExplanation.innerHTML=cfg.stabilityTeaching;
    const renderRecords=records=>records.map(([value,id])=>`<span class="record"><b>${value}</b><small>${id}</small></span>`).join('');
    ui.stabilityBefore.innerHTML=renderRecords(cfg.demoBefore);
    ui.stabilityAfter.innerHTML=renderRecords(cfg.demoAfter);
    ui.stabilityResult.className=`demo-result ${cfg.isStable?'stable':'unstable'}`;
    ui.stabilityResult.innerHTML=`<strong>${cfg.stable}：</strong>${cfg.demoReason}`;
    ui.input.value=state.values.join(', ');
    ui.subtitle.textContent=`${state.values.length} 个元素 · 下标从 0 开始`;
    ui.error.textContent='';
  }

  function render(){
    const frame=state.step>=0?state.steps[state.step]:null;
    const values=frame?frame.array:state.values;
    const n=values.length,max=Math.max(1,...values.filter(Number.isFinite));
    const sorted=new Set(frame?.sorted||[]),compare=new Set(frame?.compare||[]),swap=new Set(frame?.swap||[]),range=frame?.range;
    ui.stage.innerHTML=values.map((value,index)=>{
      const classes=['bar-slot'];if(sorted.has(index))classes.push('sorted');if(range&&index>=range[0]&&index<=range[1])classes.push('in-range');else if(range)classes.push('dimmed');
      if(compare.has(index))classes.push('compare');if(swap.has(index))classes.push('swap');if(frame?.writeIndex===index)classes.push('write');if(frame?.min===index)classes.push('minimum');if(frame?.pivotIndex===index)classes.push('pivot');if(value===null)classes.push('hole');
      const height=value===null?3:Math.max(8,Math.round((value/max)*190));
      const valueText=value===null?'空位':String(value);
      return `<div class="${classes.join(' ')}" aria-label="下标 ${index}，${valueText}"><div class="bar" style="height:${height}px">${value===null?'':`<span class="bar-value">${value}</span>`}</div><span class="bar-index">${index}</span></div>`;
    }).join('');
    ui.stage.setAttribute('aria-label',values.map((v,i)=>`下标${i}:${v===null?'空位':v}`).join('，'));
    ui.caption.textContent=frame?.range?`当前处理区间：${frame.range[0]}–${frame.range[1]}${frame.pivotIndex!==undefined?` · pivot 下标 ${frame.pivotIndex}`:''}`:frame?.hole!==undefined&&frame.hole!==null?`插入空位：下标 ${frame.hole}`:'';
    let tray=document.getElementById('keyTray');
    if(frame?.key!==undefined&&frame.key!==null){
      if(!tray){tray=document.createElement('div');tray.id='keyTray';tray.className='key-tray';ui.stage.after(tray);}
      tray.innerHTML=`手持 key <span class="key-chip">${frame.key}</span>`;
    }else if(tray){tray.remove();}
    [...ui.code.children].forEach((li,index)=>li.classList.toggle('active',frame?.line===index));
    const comparisons=frame?.comparisons??0,swaps=frame?.swaps??0,writes=frame?.writes??0;
    ui.metrics.innerHTML=`<div class="metric"><div class="metric-value">${comparisons}</div><div class="metric-label">比较次数</div></div><div class="metric"><div class="metric-value">${swaps}</div><div class="metric-label">交换次数</div></div><div class="metric"><div class="metric-value">${writes}</div><div class="metric-label">数组写入</div></div><div class="metrics-note">统计随当前步骤累计；数组写入按每次赋值计数。</div>`;
    const total=state.steps.length;
    ui.counter.textContent=frame?`${state.step+1} / ${total}`:`准备 / ${total} 步`;
    ui.explainCounter.textContent=frame?`第 ${state.step+1} 步 / 共 ${total} 步`:'准备';
    ui.explain.textContent=frame?frame.message:'点击「下一步」开始，也可以播放完整排序过程。';
    ui.progress.style.width=frame?`${((state.step+1)/total)*100}%`:'0%';
    ui.prev.disabled=state.step<0;ui.next.disabled=state.step>=total-1;
    ui.play.textContent=state.playing?'⏸ 暂停':state.step>=total-1?'✓ 已完成':'▶ 播放';
    ui.play.disabled=!state.playing&&state.step>=total-1;
  }

  function stop(){if(state.timer!==null){clearInterval(state.timer);state.timer=null;}state.playing=false;}
  function tick(){if(state.step>=state.steps.length-1){stop();render();return;}state.step++;render();}
  function play(){if(state.playing){stop();render();return;}if(state.step>=state.steps.length-1)return;state.playing=true;render();state.timer=setInterval(tick,Math.round(900/state.speed));}
  function reset(){stop();buildSteps();render();}
  function setAlgorithm(name){stop();state.algorithm=name;renderShell();reset();}
  function parseArray(){
    const raw=ui.input.value.trim();
    const parts=raw.split(/[\s,，;；]+/).filter(Boolean);
    if(parts.length<2||parts.length>18){ui.error.textContent='请输入 2–18 个整数。';return null;}
    const values=parts.map(part=>/^-?\d+$/.test(part)?Number(part):NaN);
    if(values.some(value=>!Number.isInteger(value)||value<1||value>99)){ui.error.textContent='每个元素都必须是 1–99 的整数。';return null;}
    ui.error.textContent='';return values;
  }
  function applyInput(){const values=parseArray();if(!values)return;state.values=values;ui.subtitle.textContent=`${values.length} 个元素 · 下标从 0 开始`;reset();}
  function randomArray(){const length=6+Math.floor(Math.random()*7);state.values=Array.from({length},()=>5+Math.floor(Math.random()*95));renderShell();reset();}

  $('btnPrev').addEventListener('click',()=>{stop();if(state.step>=0)state.step--;render();});
  $('btnNext').addEventListener('click',()=>{stop();tick();});
  $('btnPlay').addEventListener('click',play);$('btnReset').addEventListener('click',reset);
  $('btnApply').addEventListener('click',applyInput);$('btnRandom').addEventListener('click',randomArray);
  $('speed').addEventListener('input',()=>{state.speed=Number(ui.speed.value);ui.speedVal.textContent=`${state.speed.toFixed(1)}×`;if(state.playing){stop();play();}});
  document.querySelectorAll('.algorithm-tab').forEach(tab=>tab.addEventListener('click',()=>setAlgorithm(tab.dataset.algorithm)));
  document.addEventListener('keydown',event=>{
    if(event.target.matches('input,textarea,select,button'))return;
    if(event.key==='ArrowLeft'){event.preventDefault();ui.prev.click();}
    else if(event.key==='ArrowRight'){event.preventDefault();ui.next.click();}
    else if(event.code==='Space'){event.preventDefault();if(!ui.play.disabled)ui.play.click();}
    else if(event.key.toLowerCase()==='r')reset();
  });

  renderShell();reset();
})();
