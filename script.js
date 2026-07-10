(function() {
    // SETTINGS
    const TOP_COUNT = 20; 
    const TOP_THRESHOLD = 20; 
    const STORAGE_KEY = 'pinterest_pins_data';

    // VARS
    let pins = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

    // INIT
    const oldBox = document.getElementById('pinCollectorBox');
    if (oldBox) oldBox.remove();

    const box = document.createElement('div');
    box.id = 'pinCollectorBox';
    // Glassmorphism стили с адаптивной шириной
    box.style = `
        position:fixed;bottom:20px;right:20px;z-index:9999;
        background: rgba(255, 255, 255, 0.85);
        backdrop-filter: blur(15px);
        -webkit-backdrop-filter: blur(15px);
        padding:20px;
        border:1px solid rgba(255, 255, 255, 0.3);
        border-radius:20px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        width: 400px;
        max-width: 90vw;
    `;
    
    // ELEMENTS
    box.innerHTML = `
        <h3 style="margin:0 0 15px 0; font-size:18px; color:#333;">Pinterest Collector Dashboard</h3>
        <button id="toggleBtn" style="padding:10px 20px; font-size:14px; border-radius:10px; border:none; background:#eee; cursor:pointer; width:100%;">Open</button>
        <div id="mainPanel" style="display:none; margin-top:15px;">
            <div style="display:flex; gap:10px; margin-bottom:15px;">
                <button id="btnCollect" style="flex:1; padding:10px; border-radius:10px; border:none; background:#efefef; cursor:pointer;">Collect [${pins.length}]</button>
                <button id="btnTop" style="flex:1; padding:10px; border-radius:10px; border:none; background:#efefef; cursor:pointer;">Top-${TOP_COUNT}</button>
                <button id="btnClear" style="padding:10px; border-radius:10px; border:none; background:#fee; color:#d00; cursor:pointer;">Clear</button>
            </div>
            <textarea id="textResult" style="width:100%; height:120px; border-radius:10px; border:1px solid #ddd; padding:10px; font-size:13px; box-sizing:border-box;"></textarea>
            <div style="display:flex; gap:10px; margin-top:15px;">
                <button id="btnCopy" style="flex:1; padding:10px; border-radius:10px; border:none; background:#333; color:#fff; cursor:pointer;">Copy JSON</button>
                <button id="btnCSV" style="flex:1; padding:10px; border-radius:10px; border:none; background:#333; color:#fff; cursor:pointer;">Export CSV</button>
            </div>
            <div id="topList" style="display:none; margin-top:15px; max-height:350px; overflow-y:auto; border-top:1px solid #eee; padding-top:15px;"></div>
        </div>
    `;
    document.body.appendChild(box);
    document.getElementById('textResult').value = JSON.stringify(pins, null, 2);

    // EVENTS
    const toggle = document.getElementById('toggleBtn');
    const panel = document.getElementById('mainPanel');
    toggle.onclick = () => {
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        toggle.innerText = panel.style.display === 'none' ? 'Open' : 'Hide panel';
    };

    const showTop = () => {
        const list = document.getElementById('topList');
        list.style.display = 'block';
        list.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                <h3 style="margin:0; font-size:16px;">Top Pins</h3>
                <button id="hideTopBtn" style="padding:5px 12px; border-radius:8px; border:none; background:#ff4444; color:#fff; cursor:pointer;">Hide</button>
            </div>`;
        
        document.getElementById('hideTopBtn').onclick = () => list.style.display = 'none';

        const unique = Array.from(new Map(pins.map(p => [p.id, p])).values());
        unique.sort((a, b) => b.likes - a.likes).slice(0, TOP_COUNT).forEach(p => {
            const item = document.createElement('a');
            item.href = p.url;
            item.target = "_blank";
            item.style = `
                display:flex; align-items:center; margin-bottom:5px; padding:5px; 
                background:rgba(255,255,255,0.6); border-radius:6px; text-decoration:none; color:#333;
                transition: background 0.2s;
            `;
            item.onmouseover = () => item.style.background = "rgba(230,230,230,0.8)";
            item.onmouseout = () => item.style.background = "rgba(255,255,255,0.6)";
            
            item.innerHTML = `<img src="${p.img}" style="width:40px; height:40px; object-fit:cover; border-radius:4px; margin-right:10px;">
                  <div style="font-size:12px; overflow:hidden;">
                    <div style="font-weight:bold;">${p.title.substring(0, 20)}</div>
                    <div>${p.likes} likes</div>
                  </div>`;
            list.appendChild(item);
        });
    };

    document.getElementById('btnCollect').onclick = async (e) => {
        const links = Array.from(document.querySelectorAll('[data-test-id="masonry"] a, [data-test-id="relatedPins"] a, [data-test-id="homefeed-feed"] a'))
            .filter(a => a.href.includes('/pin/'));
        for (const link of links) {
            const id = link.href.split('/pin/')[1].replace('/', '');
            if (pins.find(p => p.id === id)) continue;
            let v = { id, url: link.href, img: link.querySelector('img')?.src, likes: 0, title: "" };
            try {
                const res = await fetch(link.href);
                const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
                const text = doc.body.innerHTML;
                v.likes = parseInt(doc.querySelector('[data-test-id="reactions-count"]')?.innerText.replace(/\D/g, '') || 0);
                debugger;
                const titleMatch = text.match(/"pin_title":"([^"]+)"/);
                v.title = titleMatch ? titleMatch[1] : "";
            } catch(e){}
            pins.push(v);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(pins));
            e.target.innerText = `Collect [${pins.length}]`;
            document.getElementById('textResult').value = JSON.stringify(pins, null, 2);
            if (pins.length > 0 && pins.length % TOP_THRESHOLD === 0) showTop();
        }
    };

    document.getElementById('btnCSV').onclick = () => {
        const csv = ["id,url,img,likes,title", ...pins.map(p => `${p.id},${p.url},${p.img},${p.likes},"${p.title.replace(/"/g, '""')}"`)].join("\n");
        const a = document.createElement('a');
        a.href = "data:text/csv;charset=utf-8," + encodeURI(csv);
        a.download = 'pins.csv'; a.click();
    };

    document.getElementById('btnTop').onclick = showTop;
    document.getElementById('btnClear').onclick = () => { 
        pins = []; localStorage.removeItem(STORAGE_KEY);
        document.getElementById('textResult').value = ""; document.getElementById('btnCollect').innerText = "Collect [0]"; 
    };
    document.getElementById('btnCopy').onclick = () => navigator.clipboard.writeText(document.getElementById('textResult').value);
})();