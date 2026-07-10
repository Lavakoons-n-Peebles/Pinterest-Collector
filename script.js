(function() {
    const TOP_THRESHOLD = 20; // Порог для авто-показа Топа
    const oldBox = document.getElementById('pinCollectorBox');
    if (oldBox) oldBox.remove();

    let pins = [];
    const box = document.createElement('div');
    box.id = 'pinCollectorBox';
    box.style = "position:fixed;bottom:20px;right:20px;z-index:9999;background:#fff;padding:20px;border:2px solid #000;border-radius:15px;font-size:18px;";
    
    box.innerHTML = `
        <button id="toggleBtn" style="padding:10px 20px;font-size:18px;">Открыть панель</button>
        <div id="mainPanel" style="display:none;margin-top:15px;">
            <button id="btnCollect" style="padding:10px;font-size:18px;">Собрать [0]</button>
            <button id="btnTop" style="padding:10px;font-size:18px;">Топ-10</button>
            <button id="btnClear" style="padding:10px;font-size:18px;">Очистить</button>
            <textarea id="textResult" style="display:block;width:400px;height:200px;margin-top:10px;font-size:16px;"></textarea>
            <button id="btnCopy" style="width:100%;padding:10px;margin-top:10px;font-size:18px;">Копировать JSON</button>
            <div id="topList" style="display:none;margin-top:15px;max-height:400px;overflow-y:auto;border-top:3px solid #000;padding-top:10px;"></div>
        </div>
    `;
    document.body.appendChild(box);

    const toggle = document.getElementById('toggleBtn');
    const panel = document.getElementById('mainPanel');
    
    toggle.onclick = () => {
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        toggle.innerText = panel.style.display === 'none' ? 'Открыть панель' : 'Скрыть панель';
    };

    const showTop = () => {
        const list = document.getElementById('topList');
        list.style.display = 'block';
        list.innerHTML = `<h3>Топ-10</h3><button onclick="document.getElementById('topList').style.display='none'">Скрыть Топ</button>`;
        const unique = Array.from(new Map(pins.map(p => [p.id, p])).values());
        unique.sort((a, b) => b.likes - a.likes).slice(0, 10).forEach(p => {
            list.innerHTML += `<div style="display:flex;align-items:center;margin:10px 0;">
                <img src="${p.img}" style="width:60px;height:60px;object-fit:cover;margin-right:15px;">
                <a href="${p.url}" target="_blank" style="font-size:20px;">${p.likes} лайков</a>
            </div>`;
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
            e.target.innerText = `Собрать [${pins.length}]`;
            document.getElementById('textResult').value = JSON.stringify(pins, null, 2);
            if (pins.length > 0 && pins.length % TOP_THRESHOLD === 0) showTop();
        }
    };

    document.getElementById('btnTop').onclick = showTop;
    document.getElementById('btnClear').onclick = () => { pins = []; document.getElementById('textResult').value = ""; document.getElementById('btnCollect').innerText = "Собрать [0]"; };
    document.getElementById('btnCopy').onclick = () => navigator.clipboard.writeText(document.getElementById('textResult').value);
})();