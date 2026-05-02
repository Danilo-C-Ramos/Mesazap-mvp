const STORAGE_KEY = 'mesazap.orders.v1';
const statuses = ['Novo', 'Preparando', 'Pronto', 'Entregue'];
const menuCatalog = [
  { category: 'Cervejas 600ml', items: [
    ['Heineken', 24], ['Amstel', 21], ['Original', 21], ['Corona', 24], ['Spaten', 21],
  ]},
  { category: 'Long necks e garrafas', items: [
    ['Praya Lager (sem glúten)', 16], ['Heineken Long Neck', 15], ['Heineken Zero', 15], ['Amstel Long Neck', 13], ['Amstel Ultra', 13], ['Amstel Vibe’s', 12], ['Corona Cero', 16], ['Corona Long Neck', 16], ['Spaten Long Neck', 14], ['Stella', 14], ['Pure Gold', 14], ['Malzbier', 14], ['Smirnoff Ice', 17], ['Skol Beats', 16],
  ]},
  { category: 'Drinks clássicos', items: [
    ['Caipirinha', 25], ['Caipiroska', 30], ['Saquerita', 35], ['Taça de Vinho', 20],
  ]},
  { category: 'Coquetéis da casa', items: [
    ['Copacabana', 42], ['Ipanema', 40], ['Arpoador', 40], ['Leblon', 40], ['Negroni', 43],
  ]},
  { category: 'Doses', items: [
    ['Whisky Black', 35], ['Whisky Red', 30], ['Jack Daniels', 32], ['Absolut', 27], ['Smirnoff', 18], ['Campari', 20], ['Licor 43', 40], ['Tequila', 29], ['Pituconha', 21], ['Cu de Burro', 10], ['Cachaça Artesanal', 18],
  ]},
  { category: 'Gin', items: [
    ['Gin Tônica (Nacional)', 30], ['Gin Tônica (Importado)', 35], ['Tônica com Frutas (Nacional)', 35], ['Tônica com Frutas (Importado)', 40], ['Gin com Energético (Nacional)', 45], ['Gin com Energético (Importado)', 45],
  ]},
  { category: 'Batidas', items: [
    ['Batida de Vinho', 33], ['Batida de Pinga', 34], ['Batida de Vodka', 36], ['Batida de Champagne', 37],
  ]},
];

let orders = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
let currentCart = [];
let filter = 'all';
let activeView = 'front';

const $ = (id) => document.getElementById(id);
const money = (value) => Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));

function orderMessage(order) {
  return `Pedido #${order.code}\nCliente: ${order.customer}\nTipo: ${order.type}\nItens:\n${order.items}\n\nTotal: ${money(order.total)}\nPagamento: ${order.payment}${order.notes ? `\nObs: ${order.notes}` : ''}\nStatus: ${order.status}`;
}

function renderMenu() {
  const container = $('menuCatalog');
  container.innerHTML = '';
  for (const group of menuCatalog) {
    const section = document.createElement('section');
    section.className = 'menu-group card';
    section.innerHTML = `<h3>${group.category}</h3><div class="menu-items"></div>`;
    const list = section.querySelector('.menu-items');
    for (const [name, price] of group.items) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'menu-item';
      button.dataset.menuName = name;
      button.dataset.menuPrice = price;
      button.innerHTML = `<span>${name}</span><strong>${money(price)}</strong>`;
      list.appendChild(button);
    }
    container.appendChild(section);
  }
}

function cartTotal() {
  return currentCart.reduce((sum, item) => sum + item.qty * item.price, 0);
}

function syncCartFields() {
  $('items').value = currentCart.map(item => `${item.qty}x ${item.name} — ${money(item.price * item.qty)}`).join('\n');
  $('total').value = cartTotal().toFixed(2);
}

function renderCart() {
  const container = $('cartItems');
  const empty = $('emptyCart');
  container.innerHTML = '';
  empty.hidden = currentCart.length > 0;
  for (const item of currentCart) {
    const row = document.createElement('div');
    row.className = 'cart-row';
    row.dataset.cartName = item.name;
    row.innerHTML = `
      <div><strong>${item.qty}x ${item.name}</strong><span>${money(item.price)} cada</span></div>
      <div class="cart-actions">
        <button type="button" data-cart-action="minus">−</button>
        <button type="button" data-cart-action="plus">+</button>
        <button type="button" data-cart-action="remove" class="danger">×</button>
      </div>
    `;
    container.appendChild(row);
  }
  syncCartFields();
}

function addMenuItem(name, price) {
  const existing = currentCart.find(item => item.name === name);
  if (existing) existing.qty += 1;
  else currentCart.push({ name, price: Number(price), qty: 1 });
  renderCart();
}

function clearCart() {
  currentCart = [];
  renderCart();
}

function getVisibleOrders() {
  return orders
    .filter(o => filter === 'all' || o.status === filter)
    .sort((a, b) => b.createdAt - a.createdAt);
}

function renderStats() {
  $('openCount').textContent = orders.filter(o => o.status !== 'Entregue').length;
  $('kitchenCount').textContent = orders.filter(o => ['Novo', 'Preparando'].includes(o.status)).length;
  $('todayTotal').textContent = money(orders.reduce((sum, o) => sum + Number(o.total || 0), 0));
}

function fillCommonTicket(node, order) {
  node.querySelector('.order, .kitchen-ticket').dataset.id = order.id;
  node.querySelector('.customer').textContent = `${order.customer} · #${order.code}`;
  node.querySelector('.meta').textContent = `${order.type} • ${new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} • ${order.payment}`;
  const badge = node.querySelector('.badge');
  badge.textContent = order.status;
  badge.className = `badge ${order.status}`;
  node.querySelector('.items').textContent = order.items;
  node.querySelector('.notes').textContent = order.notes || 'Sem observações.';
}

function renderFront() {
  const container = $('orders');
  container.innerHTML = '';
  const visible = getVisibleOrders();
  if (!visible.length) {
    container.innerHTML = '<p class="subtitle">Nenhum pedido nesse filtro ainda.</p>';
  }
  for (const order of visible) {
    const node = $('orderTemplate').content.cloneNode(true);
    fillCommonTicket(node, order);
    node.querySelector('.total').textContent = money(order.total);
    container.appendChild(node);
  }
}

function renderKitchenColumn(containerId, status, emptyText) {
  const container = $(containerId);
  container.innerHTML = '';
  const list = orders.filter(o => o.status === status).sort((a, b) => a.createdAt - b.createdAt);
  if (!list.length) {
    container.innerHTML = `<p class="subtitle empty">${emptyText}</p>`;
  }
  for (const order of list) {
    const node = $('kitchenTemplate').content.cloneNode(true);
    fillCommonTicket(node, order);
    node.querySelector('[data-action="prepare"]').hidden = order.status !== 'Novo';
    node.querySelector('[data-action="ready"]').hidden = order.status === 'Pronto';
    node.querySelector('[data-action="delivered"]').hidden = order.status !== 'Pronto';
    container.appendChild(node);
  }
}

function renderKitchen() {
  renderKitchenColumn('newKitchenOrders', 'Novo', 'Sem pedidos novos.');
  renderKitchenColumn('preparingKitchenOrders', 'Preparando', 'Nada em preparo.');
  renderKitchenColumn('readyKitchenOrders', 'Pronto', 'Nada pronto aguardando entrega.');
}

function render() {
  renderStats();
  renderFront();
  renderKitchen();
}

function setView(view) {
  activeView = view;
  document.querySelectorAll('.tab').forEach(tab => tab.classList.toggle('active', tab.dataset.view === view));
  $('frontView').classList.toggle('active', view === 'front');
  $('kitchenView').classList.toggle('active', view === 'kitchen');
}

$('orderForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const nextNumber = (orders.reduce((max, order) => Math.max(max, Number(order.code || 0)), 0) + 1).toString().padStart(3, '0');
  const order = {
    id: crypto.randomUUID(),
    code: nextNumber,
    customer: $('customer').value.trim(),
    type: $('type').value,
    items: $('items').value.trim(),
    total: $('total').value || 0,
    payment: $('payment').value,
    notes: $('notes').value.trim(),
    status: 'Novo',
    createdAt: Date.now(),
  };
  orders.push(order);
  save();
  event.target.reset();
  clearCart();
  setView('kitchen');
  render();
});

document.addEventListener('click', async (event) => {
  const button = event.target.closest('button');
  if (!button) return;

  if (button.classList.contains('menu-item')) {
    addMenuItem(button.dataset.menuName, button.dataset.menuPrice);
    return;
  }

  if (button.dataset.cartAction) {
    const name = button.closest('.cart-row').dataset.cartName;
    const item = currentCart.find(entry => entry.name === name);
    if (!item) return;
    if (button.dataset.cartAction === 'plus') item.qty += 1;
    if (button.dataset.cartAction === 'minus') item.qty -= 1;
    if (button.dataset.cartAction === 'remove' || item.qty <= 0) {
      currentCart = currentCart.filter(entry => entry.name !== name);
    }
    renderCart();
    return;
  }

  if (button.id === 'clearCart') {
    clearCart();
    return;
  }

  if (button.classList.contains('tab')) {
    setView(button.dataset.view);
    return;
  }

  if (button.classList.contains('filter')) {
    document.querySelectorAll('.filter').forEach(b => b.classList.remove('active'));
    button.classList.add('active');
    filter = button.dataset.filter;
    render();
    return;
  }

  if (button.id === 'clearDelivered' && confirm('Remover pedidos entregues da lista?')) {
    orders = orders.filter(o => o.status !== 'Entregue');
    save();
    render();
    return;
  }

  const card = button.closest('.order, .kitchen-ticket');
  if (!card) return;
  const order = orders.find(o => o.id === card.dataset.id);
  if (!order) return;

  const action = button.dataset.action;
  if (action === 'next') {
    const index = statuses.indexOf(order.status);
    order.status = statuses[Math.min(index + 1, statuses.length - 1)];
    save(); render();
  }
  if (action === 'prepare') {
    order.status = 'Preparando';
    save(); render();
  }
  if (action === 'ready') {
    order.status = 'Pronto';
    save(); render();
  }
  if (action === 'delivered') {
    order.status = 'Entregue';
    save(); render();
  }
  if (action === 'delete' && confirm('Excluir este pedido?')) {
    orders = orders.filter(o => o.id !== order.id);
    save(); render();
  }
  if (action === 'copy') {
    await navigator.clipboard.writeText(orderMessage(order));
    button.textContent = 'Copiado!';
    setTimeout(() => button.textContent = 'Copiar', 1200);
  }
});

renderMenu();
renderCart();
render();
