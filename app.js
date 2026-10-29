(function(){
  const D = window.GSTAR, $ = s => document.querySelector(s);
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
  const host = u => { try { return new URL(u).hostname.replace(/^www\./,""); } catch(e){ return "출처"; } };
  $("#upd").textContent = D.updated;
  $("#count-all").textContent = D.games.length;
  const nIndie = D.games.filter(g => g.indie).length;
  $("#count-indie").textContent = nIndie; $("#indie-n").textContent = nIndie;
  $("#event").innerHTML = D.event.map(([k,v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("");
  $("#ticket").href = D.sources.btc;
  const table = (cols, rows) => `<table><thead><tr>${cols.map(c=>`<th>${esc(c)}</th>`).join("")}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(c=>`<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
  $("#pending").innerHTML = table(["참가사","부스","상태"], D.pending);
  $("#indieT").innerHTML = table(["구역","규모","내용"], D.indie);
  $("#tipsL").innerHTML = D.tips.map(([t,d]) => `<li><b>${esc(t)}</b>${esc(d)}</li>`).join("");
  $("#unc").innerHTML = D.unconfirmed.map(t => `<li>${esc(t)}</li>`).join("");
  $("#src").innerHTML = D.sourceList.map(([t,u]) => `<li><a href="${esc(u)}" target="_blank" rel="noopener">${esc(t)}</a></li>`).join("");

  // 참가 업체 목록
  const co = new Map();
  D.games.forEach(g => { const k = g.company.trim(); const c = co.get(k) || {name:k, url:"", label:"", fb:false, n:0}; c.n++; if (!c.url && g.companyUrl) { c.url = g.companyUrl; c.label = g.companyLabel || "홈페이지"; c.fb = !!g.companyFallback; } co.set(k, c); });
  const coArr = [...co.values()].sort((a,b) => a.name.localeCompare(b.name, "ko", {sensitivity:"base"}));
  $("#co-n").textContent = `${coArr.length}곳`;
  $("#coList").innerHTML = coArr.map(c => c.url
    ? `<li><a href="${esc(c.url)}" target="_blank" rel="noopener" title="${esc(c.label)}"><span class="nm">${esc(c.name)}${c.fb ? `<span class="fbt">${esc(c.label)}</span>` : ""}</span><span class="ct">${c.n}개 게임 ↗</span></a></li>`
    : `<li><a aria-disabled="true"><span class="nm">${esc(c.name)}</span><span class="ct">${c.n}개 게임</span></a></li>`).join("");

  // 맨 위로 버튼
  const tt = $("#toTop"); tt.hidden = false;
  const onScroll = () => tt.classList.toggle("show", window.scrollY > 600);
  window.addEventListener("scroll", onScroll, {passive:true}); onScroll();
  tt.addEventListener("click", () => window.scrollTo({top:0, behavior:"smooth"}));

  let genre = "전체";
  const tabs = ["전체", ...D.genres];
  const renderTabs = () => {
    $("#tabs").innerHTML = tabs.map(g => {
      const pool = $("#indieOnly").checked ? D.games.filter(x => x.indie) : D.games;
      const n = g === "전체" ? pool.length : pool.filter(x => x.genre === g).length;
      return `<button class="tab${g===genre?" on":""}" role="tab" aria-selected="${g===genre}" data-g="${esc(g)}">${esc(g)}<span class="n">${n}</span></button>`;
    }).join("");
  };
  const badge = d => d === "시연" ? `<span class="b demo">▶ 시연 가능</span>` : d === "미확인" ? `<span class="b unk">시연 미확인</span>` : `<span class="b ev">${esc(d)}</span>`;
  const GC = {"액션·RPG":["#ff3d9a","#7c5cff"],"전략·시뮬레이션":["#00b4d8","#2fe39a"],"어드벤처·캐주얼":["#ffb547","#ff3d9a"],"서브컬처·수집형":["#b388ff","#ff80ab"],"오픈월드·MMO·생존":["#00e0ff","#3d5afe"],"슈팅·레이싱·기타":["#ff6d00","#7c5cff"]};
  const thumb = g => {
    if (g.thumb) return `<div class="thumb"><img src="${esc(g.thumb)}" alt="${esc(g.name)}" loading="lazy" decoding="async" width="460" height="215"></div>`;
    const [a,b] = GC[g.genre] || ["#7c5cff","#00e0ff"];
    return `<div class="thumb ph" style="background:linear-gradient(135deg,${a},${b})" role="img" aria-label="${esc(g.name)} (이미지 없음)"><span>${esc(g.name)}</span></div>`;
  };
  const card = g => `
    <article class="card${g.indie ? " is-indie" : ""}">
      ${thumb(g)}
      <div><h3>${esc(g.name)}</h3>${g.en ? `<div class="en">${esc(g.en)}</div>` : ""}</div>
      <div class="badges">${badge(g.demo)}${g.indie ? `<span class="b indie">인디</span>` : ""}<span class="b">${esc(g.genre)}</span></div>
      <dl class="meta">
        <dt>회사</dt><dd>${g.companyUrl ? `<a href="${esc(g.companyUrl)}" target="_blank" rel="noopener" title="${esc(g.companyLabel || "회사 홈페이지")}">${esc(g.company)}</a>` : esc(g.company)}</dd>
        <dt>장르</dt><dd>${esc(g.detail)}</dd>
        <dt>플랫폼</dt><dd>${esc(g.platform)}</dd>
        <dt>부스</dt><dd>${esc(g.booth)}</dd>
      </dl>
      ${g.note ? `<p class="note">${esc(g.note)}</p>` : ""}
      <div class="links">
        ${g.companyUrl ? `<a href="${esc(g.companyUrl)}" target="_blank" rel="noopener"${g.companyFallback ? ' class="fb"' : ""}>${esc(g.companyLabel || "회사 홈페이지")}</a>` : `<span class="nolink">회사 링크 미확인</span>`}
        ${g.gameUrl ? `<a href="${esc(g.gameUrl)}" target="_blank" rel="noopener">${esc(g.gameLabel)}</a>` : `<span>공식 페이지 없음</span>`}
        <a href="${esc(g.source)}" target="_blank" rel="noopener">출처 · ${esc(host(g.source))}</a>
      </div>
    </article>`;
  const render = () => {
    const q = $("#q").value.trim().toLowerCase(), demo = $("#demo").checked, indie = $("#indieOnly").checked;
    const hit = D.games.filter(g => (genre === "전체" || g.genre === genre) && (!demo || g.demo === "시연") && (!indie || g.indie) &&
      (!q || [g.name,g.en,g.company,g.genre,g.detail,g.platform,g.booth,g.note,g.indie?"인디 indie":"",g.zone].join(" ").toLowerCase().includes(q)));
    $("#result").textContent = `${hit.length}개 게임 표시 중`;
    if (!hit.length) { $("#list").innerHTML = `<p class="empty">조건에 맞는 게임이 없습니다. 필터를 바꿔 보세요.</p>`; return; }
    const groups = genre === "전체" ? D.genres : [genre];
    $("#list").innerHTML = groups.map(gn => {
      const items = hit.filter(g => g.genre === gn);
      return items.length ? `<h3 class="genre">${esc(gn)} <small>${items.length}</small></h3><div class="cards">${items.map(card).join("")}</div>` : "";
    }).join("");
  };
  $("#tabs").addEventListener("click", e => { const b = e.target.closest(".tab"); if (!b) return; genre = b.dataset.g; const sx = $("#tabs").scrollLeft; renderTabs(); $("#tabs").scrollLeft = sx; render(); const on = $("#tabs .tab.on"); if (on && on.scrollIntoView) on.scrollIntoView({inline:"nearest", block:"nearest"}); const top = $("#games").getBoundingClientRect().top + window.scrollY; if (window.scrollY > top) window.scrollTo({top}); });
  $("#q").addEventListener("input", render);
  $("#demo").addEventListener("change", render);
  $("#indieOnly").addEventListener("change", () => { renderTabs(); render(); });
  renderTabs(); render();
})();
