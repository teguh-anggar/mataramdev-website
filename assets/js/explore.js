// ====== explore.js ======
// Interactive horizontal tree visualiser for the Explore page.
// Exports init_explore() — called by explore_init.js.
// ======================================================

// ====== TREE DATA ======
const TREE = {
  id: 'root',
  label: 'Mataram Dev',
  icon: '⚡',
  color: '#ff6b35',
  children: [
    {
      id: 'community',
      label: 'Community',
      icon: '🤝',
      color: '#ff6b35',
      children: [
        { id: 'contributors', label: 'Contributors',  icon: '👥', href: './index.html#members'   },
        { id: 'projects',     label: 'Projects',      icon: '🚀', href: './index.html#projects'  },
        { id: 'resources',    label: 'Resources',     icon: '📚', href: './index.html#resources' },
        { id: 'forum',        label: 'Forum',         icon: '💬', href: '#', badge: 'Soon'       },
        {
          id: 'contacts',
          label: 'Contacts',
          icon: '📡',
          color: '#ff6b35',
          children: [
            { id: 'social',   label: 'Social Media', icon: '📱', href: 'https://instagram.com/mataramdev' },
            { id: 'inquiry',  label: 'Inquiry',      icon: '📧', href: 'mailto:hello@mataramdev.cloud'    },
            { id: 'channel',  label: 'Channel',      icon: '▶️', href: 'https://youtube.com/@mataramdev' }
          ]
        }
      ]
    },
    {
      id: 'courses',
      label: 'Courses',
      icon: '🎓',
      color: '#4d8eff',
      children: [
        {
          id: 'tech-skill',
          label: 'Tech Skill',
          icon: '💻',
          color: '#4d8eff',
          children: [
            { id: 'cybersec', label: 'Cybersecurity',      icon: '🔐' },
            { id: 'fswe',     label: 'FSWE',               icon: '🌐' },
            { id: 'aiml',     label: 'AI / ML',            icon: '🤖' },
            { id: 'pm',       label: 'Project Mgmt',       icon: '📋' },
            { id: 'design',   label: 'Design & Multimedia',icon: '🎨' }
          ]
        },
        {
          id: 'lang-center',
          label: 'Language Center',
          icon: '🌏',
          color: '#4d8eff',
          children: [
            { id: 'english',  label: 'English',  icon: '🇬🇧' },
            { id: 'japanese', label: 'Japanese', icon: '🇯🇵' },
            { id: 'arabic',   label: 'Arabic',   icon: '🇸🇦' }
          ]
        }
      ]
    },
    {
      id: 'partnership',
      label: 'Partnership',
      icon: '🌐',
      color: '#10b981',
      children: [
        { id: 'p-communities', label: 'Communities',  icon: '🏘️' },
        { id: 'p-business',    label: 'Business',     icon: '💼' },
        { id: 'p-ngo',         label: 'NGO',          icon: '🌱' },
        { id: 'p-universities',label: 'Universities', icon: '🏛️' }
      ]
    }
  ]
};

// ====== LAYOUT CONSTANTS ======
const NODE_W  = 185;
const NODE_H  = 52;
const H_GAP   = 90;
const V_GAP   = 18;
const PAD_X   = 40;
const PAD_Y   = 60;

// ====== HELPERS ======
function leaf_count(node) {
  if (!node.children || node.children.length === 0 || node._collapsed) return 1;
  return node.children.reduce((s, c) => s + leaf_count(c), 0);
}

function max_depth(node, d = 0) {
  if (!node.children || node._collapsed) return d;
  return Math.max(...node.children.map(c => max_depth(c, d + 1)));
}

function assign_positions(node, depth, y_start, parent_color) {
  const color = node.color || parent_color;
  node._color = color;
  node._depth = depth;

  const lc   = leaf_count(node);
  const span = lc * (NODE_H + V_GAP) - V_GAP;
  node._x = PAD_X + depth * (NODE_W + H_GAP);
  node._y = y_start + (span - NODE_H) / 2;

  if (!node.children || node.children.length === 0 || node._collapsed) return;

  let cy = y_start;
  for (const child of node.children) {
    const cl = leaf_count(child);
    assign_positions(child, depth + 1, cy, color);
    cy += cl * (NODE_H + V_GAP);
  }
}

function collect_nodes(node, out = []) {
  out.push(node);
  if (node.children && !node._collapsed) node.children.forEach(c => collect_nodes(c, out));
  return out;
}

function collect_edges(node, out = []) {
  if (!node.children || node._collapsed) return out;
  for (const child of node.children) {
    out.push([node, child]);
    collect_edges(child, out);
  }
  return out;
}

// ====== DOM REFS ======
let canvas_el = null;
let svg_el    = null;

// ====== DRAW EDGE ======
function draw_edge(parent, child, idx) {
  const x1 = parent._x + NODE_W;
  const y1 = parent._y + NODE_H / 2;
  const x2 = child._x;
  const y2 = child._y + NODE_H / 2;
  const mx = (x1 + x2) / 2;

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', `M ${x1},${y1} C ${mx},${y1} ${mx},${y2} ${x2},${y2}`);
  path.setAttribute('stroke', child._color);
  path.setAttribute('stroke-width', '2');
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke-opacity', '0.5');
  path.setAttribute('stroke-linecap', 'round');
  path.classList.add('edge-path');
  svg_el.appendChild(path);

  // Animate stroke-dashoffset after the path is in the DOM
  requestAnimationFrame(() => {
    const len = path.getTotalLength();
    path.style.strokeDasharray  = len;
    path.style.strokeDashoffset = len;

    requestAnimationFrame(() => {
      path.style.transition = `stroke-dashoffset 0.5s ease ${idx * 25}ms`;
      path.style.strokeDashoffset = '0';
    });
  });
}

// ====== DRAW NODE ======
function draw_node(node, idx) {
  const el = document.createElement('div');
  el.className  = 't-node';
  el.dataset.id = node.id;

  el.style.cssText = `
    left: ${node._x}px;
    top:  ${node._y}px;
    width: ${NODE_W}px;
    --c: ${node._color};
    animation-delay: ${idx * 35}ms;
  `;

  const is_root      = node._depth === 0;
  const has_children = node.children && node.children.length > 0;

  if (is_root)       el.classList.add('t-node--root');
  if (has_children)  el.classList.add('t-node--branch');
  if (node._collapsed) el.classList.add('t-node--collapsed');

  el.innerHTML = `
    <span class="t-icon">${node.icon}</span>
    <span class="t-label">${node.label}</span>
    ${node.badge ? `<span class="t-badge">${node.badge}</span>` : ''}
    ${has_children ? `<span class="t-toggle">${node._collapsed ? '＋' : '－'}</span>` : ''}
  `;

  if (has_children) {
    el.addEventListener('click', () => {
      node._collapsed = !node._collapsed;
      render();
    });
  } else if (node.href && node.href !== '#') {
    el.classList.add('t-node--link');
    el.addEventListener('click', () => {
      if (node.href.startsWith('mailto:') || node.href.startsWith('http')) {
        window.open(node.href, '_blank');
      } else {
        window.location.href = node.href;
      }
    });
  }

  canvas_el.appendChild(el);
}

// ====== MAIN RENDER ======
function render() {
  const lc = leaf_count(TREE);
  const md = max_depth(TREE);

  const canvas_h = lc * (NODE_H + V_GAP) - V_GAP + PAD_Y * 2;
  const canvas_w = PAD_X + (md + 1) * (NODE_W + H_GAP) + PAD_X;

  assign_positions(TREE, 0, PAD_Y, '#ff6b35');

  canvas_el.style.width     = canvas_w + 'px';
  canvas_el.style.minHeight = canvas_h + 'px';

  // Clear old nodes
  canvas_el.querySelectorAll('.t-node').forEach(el => el.remove());

  // Reset SVG
  svg_el.innerHTML = '';
  svg_el.setAttribute('width',  canvas_w);
  svg_el.setAttribute('height', canvas_h);

  // Edges (behind nodes)
  collect_edges(TREE).forEach(([p, c], i) => draw_edge(p, c, i));

  // Nodes
  collect_nodes(TREE).forEach((n, i) => draw_node(n, i));
}

// ====== INIT (exported) ======
export function init_explore() {
  canvas_el = document.getElementById('tree-canvas');
  if (!canvas_el) return;

  svg_el = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg_el.style.cssText = 'position:absolute;top:0;left:0;pointer-events:none;overflow:visible;';
  canvas_el.prepend(svg_el);

  render();

  // Debounced re-render on resize
  let resize_timer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resize_timer);
    resize_timer = setTimeout(render, 150);
  });
}
