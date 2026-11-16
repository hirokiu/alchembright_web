function select(node){const r=document.createRange();r.selectNodeContents(node);const s=getSelection();s.removeAllRanges();s.addRange(r);}
for(const b of document.querySelectorAll('.prompt button')){
 b.addEventListener('click',async()=>{
  const c=b.parentElement.querySelector('code');
  try{await navigator.clipboard.writeText(c.textContent);b.textContent='コピー済み';document.querySelector('#status').textContent='プロンプトをコピーしました。';setTimeout(()=>b.textContent='コピー',1600);}
  catch{select(c);b.textContent='選択済み：長押ししてコピー';document.querySelector('#status').textContent='コピーできない場合は、選択した文章を長押ししてコピーしてください。';}
 });
}
