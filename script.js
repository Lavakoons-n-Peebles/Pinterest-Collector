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
    box.style = "position:fixed;bottom:20px;right:20px;z-index:9999;background:#fff;padding:20px;border:2px solid #000;border-radius:15px;font-size:18px;";
    
    // ELEMENTS
    box.innerHTML = `
        <button id="toggleBtn" style="padding:10px 20px;font-size:18px;cursor:pointer;">Open panel</button>
        <div id="mainPanel" style="display:none;margin-top:15px;">
            <button id="btnCollect" style="padding:10px;font-size:18px;cursor:pointer;">Collect [${pins.length}]</button>
            <button id="btnTop" style="padding:10px;font-size:18px;cursor:pointer;">Top-${TOP_COUNT}</button>
            <button id="btnClear" style="padding:10px;font-size:18px;cursor:pointer;">Clear All</button>
            <textarea id="textResult" style="display:block;width:400px;height:200px;margin-top:10px;font-size:16px;"></textarea>
            <div style="display:flex;gap:10px;margin-top:10px;">
                <button id="btnCopy" style="flex:1;padding:10px;font-size:18px;cursor:pointer;">Copy JSON</button>
                <button id="btnCSV" style="flex:1;padding:10px;font-size:18px;cursor:pointer;">Export CSV</button>
            </div>
            <div id="topList" style="display:none;margin-top:15px;max-height:600px;overflow-y:auto;border-top:3px solid #000;padding-top:10px;width:400px;"></div>
        </div>
    `;
    document.body.appendChild(box);
    document.getElementById('textResult').value = JSON.stringify(pins, null, 2);

    const toggle = document.getElementById('toggleBtn');
    const panel = document.getElementById('mainPanel');
    
    // EVENTS
    toggle.onclick = () => {
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        toggle.innerText = panel.style.display === 'none' ? 'Open panel' : 'Hide panel';
    };

    const showTop = () => {
        const list = document.getElementById('topList');
        list.style.display = 'block';
        list.innerHTML = `<h3>Top-${TOP_COUNT}</h3>`;
        
        const hideBtn = document.createElement('button');
        hideBtn.innerText = "Hide Top";
        hideBtn.style.cursor = "pointer";
        hideBtn.onclick = () => list.style.display = 'none';
        list.appendChild(hideBtn);

        const unique = Array.from(new Map(pins.map(p => [p.id, p])).values());
        unique.sort((a, b) => b.likes - a.likes).slice(0, TOP_COUNT).forEach(p => {
            const item = document.createElement('div');
            item.style = "display:flex;align-items:center;margin:10px 0;";
            item.innerHTML = `
                <img src="${p.img}" style="width:60px;height:60px;object-fit:cover;margin-right:15px;">
                <a href="${p.url}" target="_blank" style="font-size:20px;">${p.likes} likes</a>
            `;
            list.appendChild(item);
        });
    };

    document.getElementById('btnCollect').onclick = async (e) => {
        const links = Array.from(document.querySelectorAll('[data-test-id="masonry"] a, [data-test-id="relatedPins"] a'))
            .filter(a => a.href.includes('/pin/'));
        for (const link of links) {
            const id = link.href.split('/pin/')[1].replace('/', '');
            if (pins.find(p => p.id === id)) continue;
            let v = { id, url: link.href, img: link.querySelector('img')?.src, likes: 0 };
            try {
                const res = await fetch(link.href);
                const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
                v.likes = parseInt(doc.querySelector('[data-test-id="reactions-count"]')?.innerText.replace(/\D/g, '') || 0);
            } catch(e){}
            pins.push(v);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(pins));
            e.target.innerText = `Collect [${pins.length}]`;
            document.getElementById('textResult').value = JSON.stringify(pins, null, 2);
            if (pins.length > 0 && pins.length % TOP_THRESHOLD === 0) showTop();
        }
    };

    document.getElementById('btnCSV').onclick = () => {
        const csvContent = "data:text/csv;charset=utf-8," + ["id,url,img,likes", ...pins.map(p => `${p.id},${p.url},${p.img},${p.likes}`)].join("\n");
        const a = document.createElement('a');
        a.href = encodeURI(csvContent); a.download = 'pins.csv'; a.click();
    };

    document.getElementById('btnTop').onclick = showTop;
    document.getElementById('btnClear').onclick = () => { 
        pins = []; localStorage.removeItem(STORAGE_KEY);
        document.getElementById('textResult').value = ""; document.getElementById('btnCollect').innerText = "Collect [0]"; 
    };
    document.getElementById('btnCopy').onclick = () => navigator.clipboard.writeText(document.getElementById('textResult').value);
})();