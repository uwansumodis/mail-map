function getQueryParam(name){
  const url = new URL(location.href);
  return url.searchParams.get(name);
}

async function loadRegion(){
  const region = getQueryParam('region') || 'johto';
  const title = document.getElementById('regionTitle');
  if(title) title.textContent = region.charAt(0).toUpperCase() + region.slice(1);

  try {
    const resp = await fetch(`data/${region}.json`);
    if(!resp.ok) throw new Error('No data file for region');
    const data = await resp.json();
    const mapImg = document.getElementById('regionMap');
    mapImg.src = data.map;
    mapImg.alt = `${region} map`;

    mapImg.onload = () => {
      buildHotspots(data.hotspots || []);
    };
  } catch(err){
    console.error(err);
    alert('Region data not found. Make sure data/' + region + '.json exists.');
  }
}

function buildHotspots(hotspots){
  const frame = document.getElementById('mapFrame');
  [...frame.querySelectorAll('.hotspot')].forEach(n => n.remove());

  hotspots.forEach(h => {
    const el = document.createElement('div');
    el.className = 'hotspot';
    el.dataset.id = h.id;
    el.dataset.name = h.name;
    el.style.left = h.xPercent + '%';
    el.style.top = h.yPercent + '%';
    frame.appendChild(el);

    el.addEventListener('mouseenter', (ev) => {
      const tip = document.getElementById('hoverTip');
      const tipImg = document.getElementById('hoverImg');
      tipImg.src = h.mailSprite;
      tip.style.display = 'block';
    });
    el.addEventListener('mousemove', (ev) => {
      const tip = document.getElementById('hoverTip');
      tip.style.left = (ev.clientX + 12) + 'px';
      tip.style.top = (ev.clientY + 12) + 'px';
    });
    el.addEventListener('mouseleave', () => {
      const tip = document.getElementById('hoverTip');
      tip.style.display = 'none';
    });

    el.addEventListener('click', () => {
      const modal = document.getElementById('modal');
      document.getElementById('modalTitle').textContent = h.name;
      document.getElementById('modalPrice').textContent = (h.details?.price ? 'Price: ' + h.details.price : '');
      document.getElementById('modalDesc').innerHTML = h.details?.desc || '';
      const ms = document.getElementById('modalScreenshot');
      if(h.details?.shopImage){
        ms.src = h.details.shopImage;
        ms.style.display = 'block';
      } else {
        ms.style.display = 'none';
      }
      modal.style.display = 'flex';
    });
  });
}

document.addEventListener('click', (e) => {
  if(e.target.id === 'closeModal' || e.target.classList.contains('modal')) {
    document.getElementById('modal').style.display = 'none';
  }
});

if(location.pathname.endsWith('region.html')) loadRegion();
