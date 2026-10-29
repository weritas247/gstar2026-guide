(function(){
  const D = window.GSTAR, $ = s => document.querySelector(s);
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
  const host = u => { try { return new URL(u).hostname.replace(/^www\./,""); } catch(e){ return "출처"; } };
  $("#upd").textContent = D.updated;
  $("#count-all").textContent = D.games.length;
  $("#event").innerHTML = D.event.map(([k,v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("");
  $("#ticket").href = D.sources.btc;
  const table = (cols, rows) => `<table><thead><tr>${cols.map(c=>`<th>${esc(c)}</th>`).join("")}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(c=>`<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
  $("#pending").innerHTML = table(["참가사","부스","상태"], D.pending);
  $("#indieT").innerHTML = table(["구역","규모","내용"], D.indie);
  $("#tipsL").innerHTML = D.tips.map(([t,d]) => `<li><b>${esc(t)}</b>${esc(d)}</li>`).join("");
  $("#unc").innerHTML = D.unconfirmed.map(t => `<li>${esc(t)}</li>`).join("");
  $("#src").innerHTML = D.sourceList.map(([t,u]) => `<li><a href="${esc(u)}" target="_blank" rel="noopener">${esc(t)}</a></li>`).join("");

  let genre = "전체";
  const tabs = ["전체", ...D.genres];
  const renderTabs = () => {
    $("#tabs").innerHTML = tabs.map(g => {
      const n = g === "전체" ? D.games.length : D.games.filter(x => x.genre === g).length;
      return `<button class="tab${g===genre?" on":""}" role="tab" aria-selected="${g===genre}" data-g="${esc(g)}">${esc(g)}<span class="n">${n}</span></button>`;
    }).join("");
  };
  const badge = d => d === "시연" ? `<span class="b demo">▶ 시연 가능</span>` : d === "미확인" ? `<span class="b unk">시연 미확인</span>` : `<span class="b ev">${esc(d)}</span>`;
  const card = g => `
    <article class="card">
      <div><h3>${esc(g.name)}</h3>${g.en ? `<div class="en">${esc(g.en)}</div>` : ""}</div>
      <div class="badges">${badge(g.demo)}<span class="b">${esc(g.genre)}</span></div>
      <dl class="meta">
        <dt>회사</dt><dd>${esc(g.company)}</dd>
        <dt>장르</dt><dd>${esc(g.detail)}</dd>
        <dt>플랫폼</dt><dd>${esc(g.platform)}</dd>
        <dt>부스</dt><dd>${esc(g.booth)}</dd>
      </dl>
      ${g.note ? `<p class="note">${esc(g.note)}</p>` : ""}
      <div class="links">
        <a href="${esc(g.companyUrl)}" target="_blank" rel="noopener">회사 홈페이지</a>
        ${g.gameUrl ? `<a href="${esc(g.gameUrl)}" target="_blank" rel="noopener">${esc(g.gameLabel)}</a>` : `<span>공식 페이지 없음</span>`}
        <a href="${esc(g.source)}" target="_blank" rel="noopener">출처 · ${esc(host(g.source))}</a>
      </div>
    </article>`;
  const render = () => {
    const q = $("#q").value.trim().toLowerCase(), demo = $("#demo").checked;
    const hit = D.games.filter(g => (genre === "전체" || g.genre === genre) && (!demo || g.demo === "시연") &&
      (!q || [g.name,g.en,g.company,g.genre,g.detail,g.platform,g.booth,g.note].join(" ").toLowerCase().includes(q)));
    $("#result").textContent = `${hit.length}개 게임 표시 중`;
    if (!hit.length) { $("#list").innerHTML = `<p class="empty">조건에 맞는 게임이 없습니다. 필터를 바꿔 보세요.</p>`; return; }
    const groups = genre === "전체" ? D.genres : [genre];
    $("#list").innerHTML = groups.map(gn => {
      const items = hit.filter(g => g.genre === gn);
      return items.length ? `<h3 class="genre">${esc(gn)} <small style="color:var(--sub);font-weight:500">${items.length}</small></h3><div class="cards">${items.map(card).join("")}</div>` : "";
    }).join("");
  };
  $("#tabs").addEventListener("click", e => { const b = e.target.closest(".tab"); if (!b) return; genre = b.dataset.g; renderTabs(); render(); });
  $("#q").addEventListener("input", render);
  $("#demo").addEventListener("change", render);
  renderTabs(); render();
})();
